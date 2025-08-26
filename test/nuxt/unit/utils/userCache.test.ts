/**
 * @file Юніт-тести для userCache
 * @description Тести перевіряють логіку роботи простого кешу в пам'яті для об'єктів користувачів.
 * Використовуються фейкові таймери для перевірки логіки закінчення терміну дії кешу (TTL).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getCachedUser, setCachedUser, invalidateUserCache } from '~~/server/utils/userCache'
import type { User } from '@prisma/client'

// Створюємо фейкового користувача для тестів
const mockUser: User = {
  id: 1,
  phone: '1234567890',
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashedpassword',
  role: 'USER',
  isActive: true,
  token: null,
  createdAt: new Date()
}

describe('userCache - Кеш користувачів у пам\'яті', () => {
  // Включаємо фейкові таймери перед усіма тестами в цьому блоці
  beforeEach(() => {
    vi.useFakeTimers()
    // Очищуємо кеш перед кожним тестом, викликаючи invalidate
    invalidateUserCache(mockUser.id)
  })

  // Повертаємо реальні таймери після всіх тестів
  afterEach(() => {
    vi.useRealTimers()
  })

  it('(Позитивний) Має зберігати та отримувати користувача з кешу', () => {
    // Arrange
    setCachedUser(mockUser)

    // Act
    const cachedUser = getCachedUser(mockUser.id)

    // Assert
    expect(cachedUser).toEqual(mockUser)
  })

  it('(Позитивний) Має оновлювати дані існуючого користувача в кеші', () => {
    // Arrange
    setCachedUser(mockUser)
    const updatedUser = { ...mockUser, name: 'Updated Name' }

    // Act
    setCachedUser(updatedUser)
    const cachedUser = getCachedUser(mockUser.id)

    // Assert
    expect(cachedUser).toEqual(updatedUser)
    expect(cachedUser?.name).toBe('Updated Name')
  })

  it('(Негативний) Має повертати null для користувача, якого немає в кеші', () => {
    // Act
    const cachedUser = getCachedUser(999)

    // Assert
    expect(cachedUser).toBeNull()
  })

  it('(Позитивний) Має інвалідувати (видаляти) кеш для конкретного користувача', () => {
    // Arrange
    setCachedUser(mockUser)

    // Act
    invalidateUserCache(mockUser.id)
    const cachedUser = getCachedUser(mockUser.id)

    // Assert
    expect(cachedUser).toBeNull()
  })

  describe('Логіка закінчення терміну дії (TTL)', () => {
    const CACHE_TTL = 5 * 60 * 1000 // 5 хвилин

    it('(Позитивний) Має повертати користувача, якщо термін дії не закінчився', () => {
      // Arrange
      setCachedUser(mockUser)
      // Переводимо час вперед на 4 хвилини
      vi.advanceTimersByTime(CACHE_TTL - 1000)

      // Act
      const cachedUser = getCachedUser(mockUser.id)

      // Assert
      expect(cachedUser).toEqual(mockUser)
    })

    it('(Негативний) Має повертати null, якщо термін дії кешу закінчився', () => {
      // Arrange
      setCachedUser(mockUser)
      // Переводимо час вперед на 5 хвилин і 1 секунду
      vi.advanceTimersByTime(CACHE_TTL + 1000)

      // Act
      const cachedUser = getCachedUser(mockUser.id)

      // Assert
      expect(cachedUser).toBeNull()
    })

    it('(Позитивний) Має видаляти запис з кешу після закінчення терміну дії', () => {
        // Arrange
        setCachedUser(mockUser)
        // Переводимо час вперед, щоб кеш закінчився
        vi.advanceTimersByTime(CACHE_TTL + 1000)
  
        // Act
        // Перший виклик поверне null і видалить запис
        getCachedUser(mockUser.id)
        // Спробуємо отримати ще раз, щоб переконатись, що запису немає
        const resultAfterExpiration = getCachedUser(mockUser.id)
  
        // Assert
        expect(resultAfterExpiration).toBeNull()
      })
  })
})
