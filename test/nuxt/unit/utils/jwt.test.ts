/**
 * @file Юніт-тести для jwt утиліти
 * @description Тести перевіряють обгортки над бібліотекою jsonwebtoken.
 * Ми мокаємо всю бібліотеку, щоб ізолювати тестування нашої логіки
 * від внутрішньої реалізації `jsonwebtoken`.
 */
import { describe, it, expect, vi, type Mock, beforeEach } from 'vitest'
import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import { createToken, verifyToken } from '~~/server/utils/jwt'

// Мокаємо бібліотеку jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  // `default` потрібен, оскільки ми імпортуємо jwt через `import jwt from 'jsonwebtoken'`
  default: {
    sign: vi.fn(),
    verify: vi.fn()
  },
  // Мокаємо іменований експорт для типів помилок
  JsonWebTokenError: class extends Error {
    constructor (message: string) {
      super(message)
      this.name = 'JsonWebTokenError'
    }
  }
}))

// Типізуємо мок для зручності
const mockedJwt = jwt as unknown as {
  sign: Mock
  verify: Mock
}

describe('jwt утиліти', () => {
  // Перед кожним тестом очищуємо історію викликів всіх моків
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const secret = process.env.JWT_SECRET || 'secret'
  const objectPayload = { userId: 1 }
  const stringPayload = 'user-id-string'
  const token = 'mock_token'

  describe('createToken - Створення токена', () => {
    it('(Позитивний) Має створювати токен з опціями за замовчуванням (expiresIn: "1d")', () => {
      // Arrange
      mockedJwt.sign.mockReturnValue(token)

      // Act
      const result = createToken(objectPayload)

      // Assert
      expect(mockedJwt.sign).toHaveBeenCalledOnce()
      expect(mockedJwt.sign).toHaveBeenCalledWith(objectPayload, secret, { expiresIn: '1d' })
      expect(result).toBe(token)
    })

    it('(Позитивний) Має створювати токен з кастомним часом життя', () => {
      // Arrange
      const expiresIn = '7d'
      mockedJwt.sign.mockReturnValue(token)

      // Act
      const result = createToken(objectPayload, expiresIn)

      // Assert
      expect(mockedJwt.sign).toHaveBeenCalledOnce()
      expect(mockedJwt.sign).toHaveBeenCalledWith(objectPayload, secret, { expiresIn })
      expect(result).toBe(token)
    })

    it('(Негативний) Має кидати помилку, якщо jwt.sign кидає помилку', () => {
      // Arrange
      const error = new Error('Signing error')
      mockedJwt.sign.mockImplementation(() => {
        throw error
      })

      // Act & Assert
      expect(() => createToken(objectPayload)).toThrow(error)
    })
  })

  describe('verifyToken - Верифікація токена', () => {
    it('(Позитивний) Має верифікувати токен і повертати payload у вигляді об\'єкта', () => {
      // Arrange
      mockedJwt.verify.mockReturnValue(objectPayload)

      // Act
      const result = verifyToken(token)

      // Assert
      expect(mockedJwt.verify).toHaveBeenCalledOnce()
      expect(mockedJwt.verify).toHaveBeenCalledWith(token, secret)
      expect(result).toEqual(objectPayload)
    })

    it('(Позитивний) Має верифікувати токен і повертати payload у вигляді рядка', () => {
      // Arrange
      mockedJwt.verify.mockReturnValue(stringPayload)

      // Act
      const result = verifyToken(token)

      // Assert
      expect(mockedJwt.verify).toHaveBeenCalledOnce()
      expect(mockedJwt.verify).toHaveBeenCalledWith(token, secret)
      expect(result).toEqual(stringPayload)
    })

    it('(Негативний) Має кидати JsonWebTokenError, якщо токен невалідний', () => {
      // Arrange
      const error = new JsonWebTokenError('Invalid token')
      mockedJwt.verify.mockImplementation(() => {
        throw error
      })

      // Act & Assert
      expect(() => verifyToken('invalid_token')).toThrow(error)
      expect(mockedJwt.verify).toHaveBeenCalledWith('invalid_token', secret)
    })

    it('(Негативний) Має кидати помилку, якщо токен - це порожній рядок', () => {
      // Arrange
      const error = new JsonWebTokenError('jwt must be provided')
      mockedJwt.verify.mockImplementation(() => {
        throw error
      })

      // Act & Assert
      expect(() => verifyToken('')).toThrow(error)
      expect(mockedJwt.verify).toHaveBeenCalledWith('', secret)
    })
  })
})
