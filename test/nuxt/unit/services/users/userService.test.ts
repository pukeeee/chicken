/**
 * @file Юніт-тести для userService
 * @description Тести перевіряють бізнес-логіку сервісу, що відповідає за роботу з профілем користувача.
 * Залежності, такі як репозиторій, кеш та JWT, повністю мокаються.
 */
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import type { User } from '@prisma/client'
import jwt from 'jsonwebtoken'

// Мокаємо залежності
vi.mock('~~/server/repositories/user.repository', () => ({
  getUserById: vi.fn(),
  getUsersOrderByUserId: vi.fn(),
  updateUserById: vi.fn(),
  getUserByEmail: vi.fn()
}))

vi.mock('~~/server/utils/userCache', () => ({
  invalidateUserCache: vi.fn()
}))

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn()
  }
}))

// Імпортуємо моки та сервіс
import { 
  getUserById,
  getUsersOrderByUserId, 
  updateUserById, 
  getUserByEmail 
} from '~~/server/repositories/user.repository'
import { invalidateUserCache } from '~~/server/utils/userCache'
import { getUserByToken, updateUserProfile, toPublicUser, fetchUsersOrders } from '~~/server/services/users/userService'
import { ValidationError } from '~~/server/services/errorService'

// Типізуємо моки для зручності
const mockedGetUserById = getUserById as Mock
const mockedGetUsersOrderByUserId = getUsersOrderByUserId as Mock
const mockedGetUserByEmail = getUserByEmail as Mock
const mockedUpdateUserById = updateUserById as Mock
const mockedInvalidateUserCache = invalidateUserCache as Mock
const mockedJwtVerify = jwt.verify as Mock

// --- Test Suite ---

describe('userService - Сервіс профілю користувача', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockUser: User = {
    id: 1,
    phone: '1234567890',
    email: 'user@example.com',
    name: 'Test User',
    password: 'hashedpassword',
    role: 'USER',
    isActive: true,
    token: null,
    createdAt: new Date()
  }

  describe('getUserByToken - Отримання користувача за токеном', () => {
    it('(Позитивний) Має повернути публічні дані користувача за валідним токеном', async () => {
      // Arrange
      const token = 'valid-token'
      const decodedPayload = { id: mockUser.id, role: 'USER', phone: mockUser.phone }
      mockedJwtVerify.mockReturnValue(decodedPayload)
      mockedGetUserById.mockResolvedValue(mockUser)

      // Act
      const result = await getUserByToken(token)

      // Assert
      expect(mockedJwtVerify).toHaveBeenCalledWith(token, process.env.JWT_SECRET || 'your-secret-key')
      expect(mockedGetUserById).toHaveBeenCalledWith(mockUser.id)
      expect(result).toEqual(toPublicUser(mockUser))
    })

    it('(Негативний) Має повернути null, якщо токен невалідний', async () => {
      // Arrange
      mockedJwtVerify.mockImplementation(() => { throw new Error('Invalid token') })

      // Act
      const result = await getUserByToken('invalid-token')

      // Assert
      expect(result).toBeNull()
    })

    it('(Негативний) Має повернути null, якщо користувача не знайдено в базі', async () => {
        // Arrange
        const decodedPayload = { id: 999, role: 'USER', phone: '000' }
        mockedJwtVerify.mockReturnValue(decodedPayload)
        mockedGetUserById.mockResolvedValue(null)
  
        // Act
        const result = await getUserByToken('valid-token-for-nonexistent-user')
  
        // Assert
        expect(result).toBeNull()
      })

      it('(Негативний) Має повернути null, якщо користувач неактивний', async () => {
        // Arrange
        const inactiveUser = { ...mockUser, isActive: false }
        const decodedPayload = { id: inactiveUser.id, role: 'USER', phone: inactiveUser.phone }
        mockedJwtVerify.mockReturnValue(decodedPayload)
        mockedGetUserById.mockResolvedValue(inactiveUser)
  
        // Act
        const result = await getUserByToken('valid-token-for-inactive-user')
  
        // Assert
        expect(result).toBeNull()
      })
  })

  describe('updateUserProfile - Оновлення профілю', () => {
    it('(Позитивний) Має оновити профіль та інвалідувати кеш', async () => {
      // Arrange
      const updateData = { name: 'New Name', email: 'new@example.com' }
      const updatedUser = { ...mockUser, ...updateData }
      mockedGetUserByEmail.mockResolvedValue(null) // Email не зайнятий
      mockedUpdateUserById.mockResolvedValue(updatedUser)

      // Act
      const result = await updateUserProfile(mockUser.id, updateData)

      // Assert
      expect(mockedGetUserByEmail).toHaveBeenCalledWith(updateData.email)
      expect(mockedUpdateUserById).toHaveBeenCalledWith(mockUser.id, updateData)
      expect(mockedInvalidateUserCache).toHaveBeenCalledWith(mockUser.id)
      expect(result).toEqual(updatedUser)
    })

    it('(Негативний) Має кинути ValidationError, якщо email вже зайнятий іншим користувачем', async () => {
      // Arrange
      const anotherUser = { ...mockUser, id: 2, email: 'existing@example.com' }
      const updateData = { email: 'existing@example.com' }
      mockedGetUserByEmail.mockResolvedValue(anotherUser)

      // Act & Assert
      await expect(updateUserProfile(mockUser.id, updateData)).rejects.toThrow(ValidationError)
      await expect(updateUserProfile(mockUser.id, updateData)).rejects.toThrow('Цей email вже використовується іншим акаунтом.')
      expect(mockedUpdateUserById).not.toHaveBeenCalled()
      expect(mockedInvalidateUserCache).not.toHaveBeenCalled()
    })

    it('(Позитивний) Має дозволити оновлення, якщо email належить тому ж користувачу', async () => {
        // Arrange
        const updateData = { email: mockUser.email } // той самий email
        mockedGetUserByEmail.mockResolvedValue(mockUser)
        mockedUpdateUserById.mockResolvedValue(mockUser)
  
        // Act
        const result = await updateUserProfile(mockUser.id, updateData)
  
        // Assert
        expect(mockedUpdateUserById).toHaveBeenCalledWith(mockUser.id, updateData)
        expect(mockedInvalidateUserCache).toHaveBeenCalledWith(mockUser.id)
        expect(result).toEqual(mockUser)
      })

    it('(Позитивний) Має оновити тільки імя, не перевіряючи email', async () => {
        // Arrange
        const updateData = { name: 'Just A New Name' };
        const updatedUser = { ...mockUser, ...updateData };
        mockedUpdateUserById.mockResolvedValue(updatedUser);

        // Act
        const result = await updateUserProfile(mockUser.id, updateData);

        // Assert
        expect(mockedGetUserByEmail).not.toHaveBeenCalled(); // Перевірка унікальності email не має викликатись
        expect(mockedUpdateUserById).toHaveBeenCalledWith(mockUser.id, updateData);
        expect(mockedInvalidateUserCache).toHaveBeenCalledWith(mockUser.id);
        expect(result.name).toBe('Just A New Name');
    });
  })

  describe('toPublicUser - Конвертація в публічний обʼєкт', () => {
    it('(Позитивний) Має коректно конвертувати повний об\'єкт User в UserPublic', () => {
      // Act
      const publicUser = toPublicUser(mockUser)

      // Assert
      expect(publicUser).toEqual({
        id: mockUser.id,
        phone: mockUser.phone,
        name: mockUser.name,
        email: mockUser.email,
        createdAt: mockUser.createdAt.toISOString()
      })
      expect(publicUser).not.toHaveProperty('password')
      expect(publicUser).not.toHaveProperty('isActive')
    })

    it('(Позитивний) Має коректно обробляти null у полях name та email', () => {
        // Arrange
        const userWithNulls = { ...mockUser, name: null, email: null };

        // Act
        const publicUser = toPublicUser(userWithNulls);

        // Assert
        expect(publicUser.name).toBeNull();
        expect(publicUser.email).toBeNull();
    });
  })

  describe('fetchUsersOrders - Отримання історії замовлень', () => {
    it('(Позитивний) Має повертати відформатовану історію замовлень', async () => {
      // Arrange
      const rawOrders = [
        {
          id: 101,
          userId: mockUser.id,
          customerName: mockUser.name!,
          customerPhone: mockUser.phone,
          customerEmail: mockUser.email!,
          deliveryAddress: 'address',
          paymentMethod: 'CASH',
          status: 'DELIVERED',
          total: { toNumber: () => 150.50 },
          createdAt: new Date(),
          items: [
            {
              orderId: 101,
              productId: 1,
              quantity: 2,
              price: { toNumber: () => 50.25 },
              product: {
                id: 1, name: 'Test Product', 
                price: { toNumber: () => 25.125 }, // Simulate Decimal
                createdAt: new Date(),
                description: null, image: null, isActive: true, categoryId: null, category: null
              }
            }
          ],
          payment: null
        }
      ];
      mockedGetUsersOrderByUserId.mockResolvedValue(rawOrders);

      // Act
      const result = await fetchUsersOrders(mockUser.id);

      // Assert
      expect(getUsersOrderByUserId).toHaveBeenCalledWith(mockUser.id);
      expect(result).toHaveLength(1);

      const order = result[0];
      if (!order) {
        throw new Error('Тест провалено: замовлення не повинно бути undefined');
      }

      expect(order.items).toHaveLength(1);
      const item = order.items[0];
      if (!item) {
        throw new Error('Тест провалено: товар у замовленні не повинен бути undefined');
      }

      // Тепер доступ до властивостей 100% безпечний
      expect(order.total).toBe(150.50);
      expect(typeof order.createdAt).toBe('string');
      expect(item.price).toBe(50.25);

      if (item.product) {
        expect(item.product.price).toBe(25.125);
        expect(typeof item.product.createdAt).toBe('string');
      }
    });

    it('(Позитивний) Має повертати порожній масив, якщо замовлень немає', async () => {
        // Arrange
        mockedGetUsersOrderByUserId.mockResolvedValue([]);
  
        // Act
        const result = await fetchUsersOrders(mockUser.id);
  
        // Assert
        expect(result).toEqual([]);
      });

    it('(Позитивний) Має включати деактивовані товари в історію замовлень', async () => {
        // Arrange
        const rawOrdersWithInactiveProduct = [
            {
              id: 102,
              userId: mockUser.id,
              customerName: mockUser.name!,
              customerPhone: mockUser.phone,
              customerEmail: mockUser.email!,
              deliveryAddress: 'address',
              paymentMethod: 'CASH',
              status: 'DELIVERED',
              total: { toNumber: () => 200 },
              createdAt: new Date(),
              items: [
                {
                  orderId: 102,
                  productId: 2,
                  quantity: 1,
                  price: { toNumber: () => 200 },
                  product: {
                    id: 2, name: 'Inactive Product', 
                    price: { toNumber: () => 200 },
                    isActive: false, // <-- Ключова умова
                    createdAt: new Date(),
                    description: null, image: null, categoryId: null, category: null
                  }
                }
              ],
              payment: null
            }
          ];
        mockedGetUsersOrderByUserId.mockResolvedValue(rawOrdersWithInactiveProduct);

        // Act
        const result = await fetchUsersOrders(mockUser.id);

        // Assert
        expect(result).toHaveLength(1);
        const order = result[0];
        if (!order) throw new Error('Order should be defined');
        
        const item = order.items[0];
        if (!item) throw new Error('Item should be defined');

        expect(item.product).toBeDefined();
        expect(item.product?.isActive).toBe(false);
        expect(item.product?.name).toBe('Inactive Product');
    });
  })
})