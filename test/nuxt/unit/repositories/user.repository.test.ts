/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @file Юніт-тести для userRepository
 * @description Тести перевіряють, що функції репозиторію правильно викликають
 * відповідні методи клієнта Prisma з правильними параметрами.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Мокаємо клієнт Prisma. Фабрика буде викликана до всіх імпортів.
vi.mock('~~/server/database/client', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    order: {
      findMany: vi.fn(),
    },
  },
}));

// Імпортуємо функції репозиторію ПІСЛЯ мокінгу
import {
  getUserByEmail,
  getUserById,
  getUserByPhone,
  setToken,
  removeToken,
  createUser,
  updateUserById,
  getUsersOrderByUserId
} from '~~/server/repositories/user.repository'

// Динамічно імпортуємо мокнутий клієнт, щоб отримати доступ до моків
const prismaMock = (await import('~~/server/database/client')).default;

describe('userRepository - Репозиторій користувача', () => {
  beforeEach(() => {
    // Скидаємо всі моки перед кожним тестом для чистого середовища
    vi.resetAllMocks()
  })

  describe('getUserByEmail', () => {
    it('(Позитивний) Має викликати prisma.user.findUnique з правильним email', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockUser = { id: 1, email, name: 'Test User' };
      (prismaMock.user.findUnique as any).mockResolvedValue(mockUser);

      // Act
      const result = await getUserByEmail(email);

      // Assert
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    })

    it('(Негативний) Має повернути null, якщо користувача не знайдено', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      (prismaMock.user.findUnique as any).mockResolvedValue(null);

      // Act
      const result = await getUserByEmail(email);

      // Assert
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(result).toBeNull();
    })

    it('(Негативний) Має прокинути помилку, якщо сталася помилка Prisma', async () => {
      // Arrange
      const email = 'test@example.com';
      const errorMessage = 'Database connection error';
      (prismaMock.user.findUnique as any).mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(getUserByEmail(email)).rejects.toThrow(errorMessage);
    })

    it('(Позитивний) Має опрацьовувати різноманітні формати email', async () => {
      const emailFormats = [
        'test@example.com',
        'TEST@EXAMPLE.COM',
        'user+tag@domain.co.uk',
        'very.long.email.address@very.long.domain.name.com',
        '',
        '   ',
        'invalid-email',
        '@domain.com',
        'user@'
      ]
      
      for (const email of emailFormats) {
        (prismaMock.user.findUnique as any).mockResolvedValue(null)

        await getUserByEmail(email);
        
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email } })
      }
    })
  })

  describe('getUserById', () => {
    it('(Позитивний) Має викликати prisma.user.findUnique з правильним ID', async () => {
      // Arrange
      const id = 1;
      const mockUser = { id, email: 'test@example.com', name: 'Test User' };
      (prismaMock.user.findUnique as any).mockResolvedValue(mockUser);

      // Act
      const result = await getUserById(id);

      // Assert
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(mockUser);
    })

    it('(Негативний) Має повернути null, якщо користувача не знайдено', async () => {
      // Arrange
      const id = 999;
      (prismaMock.user.findUnique as any).mockResolvedValue(null);

      // Act
      const result = await getUserById(id);

      // Assert
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(result).toBeNull();
    })

    it('(Негативний) Має прокинути помилку, якщо сталася помилка Prisma', async () => {
      // Arrange
      const id = 1;
      const errorMessage = 'Database connection error';
      (prismaMock.user.findUnique as any).mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(getUserById(id)).rejects.toThrow(errorMessage);
    })

    it('(Позитивний) Має опрацьовувати граничні значення ID', async () => {
      const boundaryIds = [0, 1, Number.MAX_SAFE_INTEGER, -1]
      
      for (const id of boundaryIds) {
        (prismaMock.user.findUnique as any).mockResolvedValue(null)
        
        const result = await getUserById(id)
        
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id } })
        expect(result).toBeNull()
      }
    })
  })

  describe('getUserByPhone', () => {
    it('(Позитивний) Має викликати prisma.user.findUnique з правильним телефоном', async () => {
      // Arrange
      const phone = '1234567890';
      const mockUser = { id: 1, phone, name: 'Test User' };
      (prismaMock.user.findUnique as any).mockResolvedValue(mockUser);

      // Act
      const result = await getUserByPhone(phone);

      // Assert
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { phone } });
      expect(result).toEqual(mockUser);
    })

    it('(Негативний) Має повернути null, якщо користувача не знайдено', async () => {
      // Arrange
      const phone = '0987654321';
      (prismaMock.user.findUnique as any).mockResolvedValue(null);

      // Act
      const result = await getUserByPhone(phone);

      // Assert
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { phone } });
      expect(result).toBeNull();
    })

    it('(Негативний) Має прокинути помилку, якщо сталася помилка Prisma', async () => {
      // Arrange
      const phone = '1234567890';
      const errorMessage = 'Database connection error';
      (prismaMock.user.findUnique as any).mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(getUserByPhone(phone)).rejects.toThrow(errorMessage);
    })

    it('(Позитивний) Має опрацьовувати різноманітні формати телефонів', async () => {
      const phoneFormats = [
        '+380501234567',
        '380501234567', 
        '0501234567',
        '+1-555-123-4567',
        '(555) 123-4567',
        '555.123.4567',
        '',
        '   ',
        '1234567890123456789012345'
      ]
      
      for (const phone of phoneFormats) {
        (prismaMock.user.findUnique as any).mockResolvedValue(null)

        await getUserByPhone(phone)
        
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { phone } })
      }
    })
  })

  describe('createUser', () => {
    it('(Позитивний) Має викликати prisma.user.create з правильними даними', async () => {
      // Arrange
      const phone = '1234567890';
      const mockUser = { id: 1, phone, name: null, email: null, token: null };
      (prismaMock.user.create as any).mockResolvedValue(mockUser);

      // Act
      const result = await createUser(phone);

      // Assert
      expect(prismaMock.user.create).toHaveBeenCalledWith({ data: { phone } });
      expect(result).toEqual(mockUser);
    })

    it('(Негативний) Має прокинути помилку, якщо сталася помилка Prisma', async () => {
      // Arrange
      const phone = '1234567890';
      const errorMessage = 'Database connection error';
      (prismaMock.user.create as any).mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(createUser(phone)).rejects.toThrow(errorMessage);
    })
  })

  describe('updateUserById', () => {
    it('(Позитивний) Має викликати prisma.user.update з правильними даними', async () => {
      // Arrange
      const id = 1;
      const data = { name: 'New Name' };
      const mockUser = { id, phone: '1234567890', name: 'New Name', email: null, token: null };
      (prismaMock.user.update as any).mockResolvedValue(mockUser);

      // Act
      const result = await updateUserById(id, data);

      // Assert
      expect(prismaMock.user.update).toHaveBeenCalledWith({ where: { id }, data });
      expect(result).toEqual(mockUser);
    })

    it('(Негативний) Має прокинути помилку, якщо сталася помилка Prisma', async () => {
      // Arrange
      const id = 1;
      const data = { name: 'New Name' };
      const errorMessage = 'Database connection error';
      (prismaMock.user.update as any).mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(updateUserById(id, data)).rejects.toThrow(errorMessage);
    })
  })

  describe('setToken', () => {
    it('(Позитивний) Має викликати prisma.user.update для встановлення токена', async () => {
      // Arrange
      const id = 1;
      const token = 'new-token';
      const mockUser = { id, phone: '1234567890', name: null, email: null, token };
      (prismaMock.user.update as any).mockResolvedValue(mockUser);

      // Act
      const result = await setToken(id, token);

      // Assert
      expect(prismaMock.user.update).toHaveBeenCalledWith({ where: { id }, data: { token } });
      expect(result).toEqual(mockUser);
    })

    it('(Негативний) Має прокинути помилку, якщо сталася помилка Prisma', async () => {
      // Arrange
      const id = 1;
      const token = 'new-token';
      const errorMessage = 'Database connection error';
      (prismaMock.user.update as any).mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(setToken(id, token)).rejects.toThrow(errorMessage);
    })
  })

  describe('removeToken', () => {
    it('(Позитивний) Має викликати prisma.user.update для видалення токена', async () => {
      // Arrange
      const id = 1;
      const mockUser = { id, phone: '1234567890', name: null, email: null, token: null };
      (prismaMock.user.update as any).mockResolvedValue(mockUser);

      // Act
      const result = await removeToken(id);

      // Assert
      expect(prismaMock.user.update).toHaveBeenCalledWith({ where: { id }, data: { token: null } });
      expect(result).toEqual(mockUser);
    })

    it('(Негативний) Має прокинути помилку, якщо сталася помилка Prisma', async () => {
      // Arrange
      const id = 1;
      const errorMessage = 'Database connection error';
      (prismaMock.user.update as any).mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(removeToken(id)).rejects.toThrow(errorMessage);
    })
  })

  describe('getUsersOrderByUserId', () => {
    it('(Позитивний) Має викликати prisma.order.findMany з правильними параметрами', async () => {
      // Arrange
      const userId = 1;
      const mockOrders = [
        { id: 1, userId, total: 100, items: [] },
        { id: 2, userId, total: 200, items: [] }
      ];
      (prismaMock.order.findMany as any).mockResolvedValue(mockOrders);

      // Act
      const result = await getUsersOrderByUserId(userId);

      // Assert
      expect(prismaMock.order.findMany).toHaveBeenCalledWith({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
      expect(result).toEqual(mockOrders);
    })

    it('(Негативний) Має прокинути помилку, якщо сталася помилка Prisma', async () => {
      // Arrange
      const userId = 1;
      const errorMessage = 'Database connection error';
      (prismaMock.order.findMany as any).mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(getUsersOrderByUserId(userId)).rejects.toThrow(errorMessage);
    })

    it('(Позитивний) Має коректно обробляти користувачів без замовлень', async () => {
      ;(prismaMock.order.findMany as any).mockResolvedValue([])
      
      const result = await getUsersOrderByUserId(999)
      
      expect(result).toEqual([])
    })

    it('(Позитивний) Має правильно сортувати замовлення за датою створення', async () => {
      const ordersWithDates = [
        { id: 3, userId: 1, createdAt: new Date('2023-03-01'), total: 100, items: [] },
        { id: 1, userId: 1, createdAt: new Date('2023-01-01'), total: 50, items: [] },
        { id: 2, userId: 1, createdAt: new Date('2023-02-01'), total: 75, items: [] }
      ]

      ;(prismaMock.order.findMany as any).mockResolvedValue(ordersWithDates)
      
      await getUsersOrderByUserId(1)
      
      expect(prismaMock.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' }
        })
      )
    })
  })

  describe('Обробка помилок бази даних', () => {
    it('(Негативний) Має опрацьовувати різні типи помилок Prisma', async () => {
      const prismaErrors = [
        new Error('Connection timeout'),
        new Error('ECONNREFUSED'),
        new Error('P2002: Unique constraint violation'),
        new Error('P1001: Can\'t reach database server'),
        { code: 'P2025', message: 'Record not found' }
      ]

      for (const error of prismaErrors) {
        (prismaMock.user.findUnique as any).mockRejectedValue(error)
        
        await expect(getUserById(1)).rejects.toThrow()
      }
    })

    it('(Негативний) createUser - має опрацьовувати помилку унікальності (constraint violation)', async () => {
      const constraintError = new Error('P2002: Unique constraint failed on the fields: (`phone`)')
      
      ;(prismaMock.user.create as any).mockRejectedValue(constraintError)
      
      await expect(createUser('1234567890')).rejects.toThrow(constraintError)
    })

    it('(Негативний) updateUserById - має опрацьовувати помилку відсутності запису', async () => {
      const notFoundError = new Error('P2025: Record to update not found')
      
      ;(prismaMock.user.update as any).mockRejectedValue(notFoundError)
      
      await expect(updateUserById(999, { name: 'Test' }))
        .rejects.toThrow(notFoundError)
    })
  })

  describe('Стрес-тести та продуктивність', () => {
    it('(Позитивний) Має обробляти множинні паралельні запити', async () => {
      const userIds = Array.from({ length: 100 }, (_, i) => i + 1)
      
      ;(prismaMock.user.findUnique as any).mockImplementation(({ where }: any) => 
        Promise.resolve({ id: where.id, phone: `phone${where.id}` })
      )
      
      const promises = userIds.map(id => getUserById(id))
      const results = await Promise.all(promises)
      
      expect(results).toHaveLength(100)
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(100)
    })

    it('(Позитивний) Має обробляти запити з дуже довгими даними', async () => {
      const longEmail = 'a'.repeat(1000) + '@example.com'
      const longPhone = '1'.repeat(50)
      
      ;(prismaMock.user.findUnique as any).mockResolvedValue(null)
      
      await getUserByEmail(longEmail)
      await getUserByPhone(longPhone)
      
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: longEmail } })
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { phone: longPhone } })
    })
  })

  describe('Безпека транзакцій', () => {
    it('(Позитивний) updateUserById - має коректно обробляти часткові оновлення', async () => {
      const partialUpdates = [
        { name: 'New Name' },
        { email: 'new@email.com' },
        { name: 'Name', email: 'email@test.com' },
        {}, // порожнє оновлення
        { name: '', email: '' } // порожні рядки
      ]

      for (const updateData of partialUpdates) {
        const mockUpdatedUser = { id: 1, phone: '123', ...updateData }
        ;(prismaMock.user.update as any).mockResolvedValue(mockUpdatedUser)
        
        const result = await updateUserById(1, updateData)
        
        expect(prismaMock.user.update).toHaveBeenCalledWith({
          where: { id: 1 },
          data: updateData
        })
        expect(result).toEqual(mockUpdatedUser)
      }
    })
  })
});
