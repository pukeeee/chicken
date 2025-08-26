/**
 * @file Юніт-тести для bcrypt утиліти
 * @description Тести перевіряють обгортки над бібліотекою bcrypt.
 * Ми мокаємо всю бібліотеку, щоб ізолювати тестування нашої логіки
 * від внутрішньої реалізації `bcrypt`.
 */
import { describe, it, expect, vi, type Mock, beforeEach } from 'vitest'
import bcrypt from 'bcrypt'
import { hash, compare } from '~~/server/utils/bcrypt'

// Мокаємо бібліотеку bcrypt
vi.mock('bcrypt', () => ({
  // `default` потрібен, оскільки ми імпортуємо bcrypt через `import bcrypt from 'bcrypt'`
  default: {
    hash: vi.fn(),
    compare: vi.fn()
  }
}))

// Типізуємо мок для зручності
const mockedBcrypt = bcrypt as unknown as {
  hash: Mock
  compare: Mock
}

describe('bcrypt утиліти', () => {
  // Перед кожним тестом очищуємо історію викликів всіх моків
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const plainPassword = 'password123'
  const hashedPassword = 'hashed_password_mock'

  describe('hash - Хешування пароля', () => {
    it('(Позитивний) Має успішно хешувати пароль', async () => {
      // Arrange
      mockedBcrypt.hash.mockResolvedValue(hashedPassword)

      // Act
      const result = await hash(plainPassword)

      // Assert
      expect(mockedBcrypt.hash).toHaveBeenCalledOnce()
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(plainPassword, 10)
      expect(result).toBe(hashedPassword)
    })

    it('(Негативний) Має кидати помилку, якщо bcrypt.hash кидає помилку', async () => {
      // Arrange
      const error = new Error('Hashing failed')
      mockedBcrypt.hash.mockRejectedValue(error)

      // Act & Assert
      await expect(hash(plainPassword)).rejects.toThrow(error)
    })
  })

  describe('compare - Порівняння пароля', () => {
    it('(Позитивний) Має повертати true, якщо паролі співпадають', async () => {
      // Arrange
      mockedBcrypt.compare.mockResolvedValue(true)

      // Act
      const result = await compare(plainPassword, hashedPassword)

      // Assert
      expect(mockedBcrypt.compare).toHaveBeenCalledOnce()
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword)
      expect(result).toBe(true)
    })

    it('(Негативний) Має повертати false, якщо паролі не співпадають', async () => {
      // Arrange
      mockedBcrypt.compare.mockResolvedValue(false)

      // Act
      const result = await compare('wrong_password', hashedPassword)

      // Assert
      expect(result).toBe(false)
    })

    it('(Негативний) Має кидати помилку, якщо bcrypt.compare кидає помилку', async () => {
      // Arrange
      const error = new Error('Comparison failed')
      mockedBcrypt.compare.mockRejectedValue(error)

      // Act & Assert
      await expect(compare(plainPassword, hashedPassword)).rejects.toThrow(error)
    })
  })
})
