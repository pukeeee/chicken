/**
 * @file Юніт-тести для loginService
 * @description Тести перевіряють логіку отримання або створення користувача під час входу.
 * Залежності (репозиторій, JWT) повністю мокаються.
 */
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import type { User } from '@prisma/client'

// Мокаємо залежності
vi.mock('~~/server/repositories/user.repository', () => ({
  getUserByPhone: vi.fn(),
  createUser: vi.fn(),
  setToken: vi.fn()
}))

vi.mock('~~/server/utils/jwt', () => ({
  createToken: vi.fn()
}))

// Імпортуємо моки та сервіс
import { getUserByPhone, createUser, setToken } from '~~/server/repositories/user.repository'
import { createToken } from '~~/server/utils/jwt'
import { loginService } from '~~/server/services/users/loginService'

// Типізуємо моки
const mockedGetUserByPhone = getUserByPhone as Mock
const mockedCreateUser = createUser as Mock
const mockedSetToken = setToken as Mock
const mockedCreateToken = createToken as Mock

describe('loginService - Сервіс входу та реєстрації', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockUser: User = {
    id: 1,
    phone: '1234567890',
    email: null, name: null, password: null, role: 'USER', 
    isActive: true, token: null, createdAt: new Date()
  }
  const mockToken = 'mock-jwt-token'

  describe('getOrCreateUser - Отримання або створення користувача', () => {
    it('(Позитивний) Має повернути існуючого користувача і новий токен', async () => {
      // Arrange
      mockedGetUserByPhone.mockResolvedValue(mockUser)
      mockedCreateToken.mockReturnValue(mockToken)

      // Act
      const { user, token } = await loginService.getOrCreateUser(mockUser.phone)

      // Assert
      expect(mockedGetUserByPhone).toHaveBeenCalledWith(mockUser.phone)
      expect(mockedCreateUser).not.toHaveBeenCalled()
      expect(mockedCreateToken).toHaveBeenCalledWith({ 
        id: mockUser.id, 
        role: mockUser.role,
        phone: mockUser.phone 
      }, '30d')
      expect(mockedSetToken).toHaveBeenCalledWith(mockUser.id, mockToken)
      expect(user).toEqual(mockUser)
      expect(token).toBe(mockToken)
    })

    it('(Позитивний) Має створити нового користувача, якщо він не існує', async () => {
        // Arrange
        const newUser = { ...mockUser, id: 2 };
        mockedGetUserByPhone.mockResolvedValue(null) // Користувач не знайдений
        mockedCreateUser.mockResolvedValue(newUser) // Створюємо нового
        mockedCreateToken.mockReturnValue(mockToken)
  
        // Act
        const { user, token } = await loginService.getOrCreateUser(newUser.phone)
  
        // Assert
        expect(mockedGetUserByPhone).toHaveBeenCalledWith(newUser.phone)
        expect(mockedCreateUser).toHaveBeenCalledWith(newUser.phone)
        expect(mockedCreateToken).toHaveBeenCalledWith({ 
            id: newUser.id, 
            role: newUser.role,
            phone: newUser.phone 
        }, '30d')
        expect(mockedSetToken).toHaveBeenCalledWith(newUser.id, mockToken)
        expect(user).toEqual(newUser)
        expect(token).toBe(mockToken)
      })

    it('(Позитивний) Має призначити роль USER за замовчуванням для нового користувача без ролі', async () => {
        // Arrange
        const userWithoutRole = { ...mockUser, id: 3, role: null };
        mockedGetUserByPhone.mockResolvedValue(null);
        mockedCreateUser.mockResolvedValue(userWithoutRole);
        mockedCreateToken.mockReturnValue(mockToken);

        // Act
        await loginService.getOrCreateUser(userWithoutRole.phone);

        // Assert
        expect(mockedCreateToken).toHaveBeenCalledWith(
            expect.objectContaining({ role: 'USER' }), // Перевіряємо, що роль встановлена як 'USER'
            '30d'
        );
    });

    it('(Негативний) Має прокинути помилку, якщо findUserByPhone падає', async () => {
        // Arrange
        const dbError = new Error('DB connection failed at find');
        mockedGetUserByPhone.mockRejectedValue(dbError);
  
        // Act & Assert
        await expect(loginService.getOrCreateUser('any-phone')).rejects.toThrow(dbError);
        expect(mockedCreateUser).not.toHaveBeenCalled();
        expect(mockedCreateToken).not.toHaveBeenCalled();
    });

    it('(Негативний) Має прокинути помилку, якщо createUser падає', async () => {
        // Arrange
        const dbError = new Error('DB connection failed at create');
        mockedGetUserByPhone.mockResolvedValue(null);
        mockedCreateUser.mockRejectedValue(dbError);

        // Act & Assert
        await expect(loginService.getOrCreateUser('any-phone')).rejects.toThrow(dbError);
        expect(mockedCreateToken).not.toHaveBeenCalled();
    });

    it('(Негативний) Має прокинути помилку, якщо setToken падає', async () => {
        // Arrange
        const dbError = new Error('DB connection failed at setToken');
        mockedGetUserByPhone.mockResolvedValue(mockUser);
        mockedCreateToken.mockReturnValue(mockToken);
        mockedSetToken.mockRejectedValue(dbError);

        // Act & Assert
        await expect(loginService.getOrCreateUser(mockUser.phone)).rejects.toThrow(dbError);
    });
  })
})