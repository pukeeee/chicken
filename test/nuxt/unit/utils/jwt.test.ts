/**
 * @file Юніт-тести для jwt утиліти
 * @description Тести перевіряють обгортки над бібліотекою jsonwebtoken.
 * Ми мокаємо всю бібліотеку, щоб ізолювати тестування нашої логіки
 * від внутрішньої реалізації `jsonwebtoken`.
 */
import { describe, it, expect, vi, type Mock, beforeEach } from 'vitest'
import jwt, { JsonWebTokenError, TokenExpiredError, NotBeforeError } from 'jsonwebtoken'
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
  },
  TokenExpiredError: class extends Error {
    expiredAt: Date;
    constructor(message: string, expiredAt: Date) { 
      super(message); this.name = 'TokenExpiredError'; this.expiredAt = expiredAt 
    }
  },
  NotBeforeError: class extends Error {
    date: Date
    constructor(message: string, date: Date) { 
      super(message); this.name = 'NotBeforeError'; this.date = date 
    }
  }
}))

// Типізуємо мок для зручності
const mockedJwt = jwt as unknown as {
  sign: Mock
  verify: Mock
}

describe('jwt утиліти', () => {
  // Скидаємо всі моки перед кожним тестом для чистого середовища
  beforeEach(() => {
    vi.resetAllMocks()
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

  describe('createToken - Безпека та граничні випадки', () => {
    it('(Позитивний) Має працювати з різними типами payload', () => {
      const payloads = [
        { userId: 1 },
        'simple-string',
        Buffer.from('buffer-data'),
        { complex: { nested: { object: 'value' } } },
        { array: [1, 2, 3] },
        { nullField: null, undefinedField: undefined },
      ]

      payloads.forEach(payload => {
        mockedJwt.sign.mockReturnValue('token')
        
        const result = createToken(payload)
        
        expect(mockedJwt.sign).toHaveBeenCalledWith(
          payload,
          process.env.JWT_SECRET || 'secret',
          { expiresIn: '1d' }
        )
        expect(result).toBe('token')
      })
    })

    it('(Позитивний) Має обробляти різні формати expiresIn', () => {
      const expiresInFormats: (jwt.SignOptions['expiresIn'])[] = [
        '1d', '7d', '30d',
        '1h', '24h', '168h',
        '3600s', '86400s',
        60, 3600, 86400, // числа (секунди)
        '1y', '1M', '1w'
      ]

      expiresInFormats.forEach(expiresIn => {
        mockedJwt.sign.mockReturnValue('token')
        
        createToken({ test: true }, expiresIn)
        
        expect(mockedJwt.sign).toHaveBeenCalledWith(
          { test: true },
          expect.any(String),
          { expiresIn }
        )
      })
    })

    it('(Позитивний) Має коректно використовувати секрет, завантажений з .env файлу', () => {
      // Arrange
      const expectedSecret = process.env.JWT_SECRET; // Має бути 'test_secret_key' з .env.test
      mockedJwt.sign.mockReturnValue('token');

      // Act
      createToken({ test: true });

      // Assert
      // Перевіряємо, що функція викликається з секретом, який був успішно завантажений при старті тестів
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        { test: true },
        expectedSecret,
        { expiresIn: '1d' }
      );
    });
  })

  describe('verifyToken - Різні типи помилок JWT', () => {
    it('(Негативний) Має обробляти всі стандартні типи помилок JWT', () => {
      const jwtErrors = [
        new JsonWebTokenError('invalid signature'),
        new JsonWebTokenError('jwt malformed'),
        new JsonWebTokenError('jwt signature is required'),
        new TokenExpiredError('jwt expired', new Date()),
        new NotBeforeError('jwt not active', new Date()),
        new JsonWebTokenError('invalid token')
      ]

      jwtErrors.forEach(error => {
        mockedJwt.verify.mockImplementation(() => { throw error })
        
        expect(() => verifyToken('invalid-token')).toThrow(error)
        expect(mockedJwt.verify).toHaveBeenCalledWith('invalid-token', expect.any(String))
      })
    })

    it('(Позитивний) Має повертати різні типи розкодованого payload', () => {
      const payloads = [
        { userId: 1, role: 'admin' },
        'string-payload',
        { exp: Math.floor(Date.now() / 1000) + 3600 },
        { iss: 'test-issuer', sub: 'user-123', aud: 'test-app' }
      ]

      payloads.forEach(payload => {
        mockedJwt.verify.mockReturnValue(payload)
        
        const result = verifyToken('valid-token')
        
        expect(result).toEqual(payload)
      })
    })

    it('(Негативний) Має обробляти граничні випадки токенів', () => {
      const edgeCaseTokens = [
        '', // порожній токен
        '   ', // тільки пробіли
        'a', // дуже короткий
        'x'.repeat(10000), // дуже довгий
        'invalid.token.format',
        'header.payload', // неповний JWT
        'header.payload.signature.extra', // забагато частин
        'тест-токен з юнікодом',
        'token\nwith\nnewlines', // Тут було неправильне екранування, виправлено на \n
        'token with spaces'
      ]

      edgeCaseTokens.forEach(token => {
        const error = new JsonWebTokenError(`Invalid token: ${token}`)
        mockedJwt.verify.mockImplementation(() => { throw error })
        
        expect(() => verifyToken(token)).toThrow(error)
      })
    })

    it('(Позитивний) Має обробляти токени з різними алгоритмами підпису', () => {
      // Симулюємо токени, створені з різними алгоритмами
      const algorithmsPayloads = [
        { alg: 'HS256', data: 'test' },
        { alg: 'HS384', data: 'test' },
        { alg: 'HS512', data: 'test' },
        { alg: 'RS256', data: 'test' },
        { alg: 'none', data: 'test' } // небезпечний алгоритм
      ]

      algorithmsPayloads.forEach(payload => {
        mockedJwt.verify.mockReturnValue(payload)
        
        const result = verifyToken('token-with-algorithm')
        
        expect(result).toEqual(payload)
      })
    })
  })

  describe('Продуктивність та стрес-тести', () => {
    it('(Позитивний) Має швидко створювати велику кількість токенів', () => {
      mockedJwt.sign.mockImplementation(() => 'fast-token')
      
      const start = performance.now()
      
      for (let i = 0; i < 10000; i++) {
        createToken({ id: i })
      }
      
      const end = performance.now()
      const duration = end - start
      
      // Має виконуватись менш ніж за 1 секунду
      expect(duration).toBeLessThan(1000)
    })

    it('(Позитивний) Має обробляти паралельні операції', async () => {
      mockedJwt.sign.mockImplementation((payload) => `token-${JSON.stringify(payload)}`)
      mockedJwt.verify.mockImplementation((token) => ({ token }))
      
      const operations = Array.from({ length: 1000 }, (_, i) => {
        const payload = { id: i }
        const token = createToken(payload)
        return verifyToken(token)
      })
      
      const results = await Promise.all(operations.map(op => Promise.resolve(op)))
      
      expect(results).toHaveLength(1000)
    })

    it('(Позитивний) Має працювати з дуже великими payload', () => {
      const largePayload = {
        user: {
          id: 1,
          permissions: Array.from({ length: 1000 }, (_, i) => `permission_${i}`),
          metadata: {
            largeField: 'x'.repeat(10000),
            nestedData: Array.from({ length: 100 }, (_, i) => ({
              id: i,
              data: 'data'.repeat(100)
            }))
          }
        }
      }

      mockedJwt.sign.mockReturnValue('large-token')
      mockedJwt.verify.mockReturnValue(largePayload)
      
      const token = createToken(largePayload)
      const decoded = verifyToken(token)
      
      expect(decoded).toEqual(largePayload)
    })
  })

  describe('Безпека JWT', () => {
    it('(Позитивний) Має коректно обробляти потенційно шкідливий payload, не падаючи', () => {
      const maliciousPayloads = [
        { __proto__: { isAdmin: true } } as unknown as Record<string, unknown>,
        { constructor: { prototype: { isAdmin: true } } } as unknown as Record<string, unknown>,
        { 'role': "admin", "fake'": 'value' } as unknown as Record<string, unknown>, // JSON injection attempt
        { eval: 'malicious code' } as unknown as Record<string, unknown>,
        { script: '<script>alert("xss")</script>' } as unknown as Record<string, unknown>
      ]

      maliciousPayloads.forEach(payload => {
        mockedJwt.verify.mockReturnValue(payload)
        
        // Верифікація має пройти (фільтрація - відповідальність програми)
        const result = verifyToken('malicious-token')
        expect(result).toEqual(payload)
      })
    })

    it('(Позитивний) Має коректно обробляти токени з критичними claims (exp, nbf, iss)', () => {
      const criticalClaims = [
        { exp: Math.floor(Date.now() / 1000) - 3600 }, // термін дії минув
        { nbf: Math.floor(Date.now() / 1000) + 3600 }, // ще не активний
        { iss: 'malicious-issuer' },
        { aud: ['wrong', 'audience'] },
        { sub: null },
        { jti: 'duplicate-id' }
      ]

      criticalClaims.forEach(claims => {
        mockedJwt.verify.mockReturnValue(claims)
        
        const result = verifyToken('token-with-claims')
        expect(result).toEqual(claims)
      })
    })
  })

})