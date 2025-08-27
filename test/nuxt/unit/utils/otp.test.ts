/**
 * @file Юніт-тести для otpService
 * @description Ці тести перевіряють сервіс для роботи з одноразовими паролями (OTP).
 * Головна стратегія тут - повна ізоляція від зовнішніх залежностей (Redis).
 * Ми використовуємо `vi.resetModules()` у `beforeEach`, щоб гарантувати, що кожен тест
 * виконується у чистому середовищі, скидаючи внутрішній стан модуля (напр. isConnected).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Фабрика для створення моку Redis клієнта. Дозволяє нам перестворювати мок перед кожним тестом.
const createMockRedisClient = () => ({
  on: vi.fn(),
  connect: vi.fn().mockResolvedValue(undefined),
  set: vi.fn().mockResolvedValue(undefined),
  get: vi.fn().mockResolvedValue(null),
  del: vi.fn().mockResolvedValue(1),
  exists: vi.fn().mockResolvedValue(0)
})

let mockRedisClient = createMockRedisClient()

// Мокаємо весь модуль 'redis'. Коли код в otp.ts викличе createClient(), він отримає наш мок.
vi.mock('redis', () => ({
  createClient: vi.fn(() => mockRedisClient)
}))

describe('otpService - сервіс для одноразових паролів', () => {
  let otpService: typeof import('~~/server/utils/otp')['otpService']

  // Перед кожним тестом скидаємо стан всіх модулів та моків для повної ізоляції.
  beforeEach(async () => {
    vi.resetModules()
    mockRedisClient = createMockRedisClient()

    // Динамічно імпортуємо сервіс, щоб отримати його "чисту" версію для тесту
    const module = await import('~~/server/utils/otp')
    otpService = module.otpService
  })

  describe('connect - підключення до Redis', () => {
    it('(Негативний) Має обробляти помилки підключення до Redis', async () => {
      // Arrange
      mockRedisClient.connect.mockRejectedValue(new Error('Connection failed'))
      
      // Assert
      await expect(otpService.set('key', 'code')).rejects.toThrow('Connection failed')
    })
  })

  describe('set - Збереження OTP', () => {
    it('(Позитивний) Має зберегти код з TTL за замовчуванням (300с)', async () => {
      // Arrange
      const key = 'test_user'
      const code = '123456'
      const expectedTtl = 300

      // Act
      await otpService.set(key, code)

      // Assert
      expect(mockRedisClient.connect).toHaveBeenCalledOnce()
      expect(mockRedisClient.set).toHaveBeenCalledOnce()
      expect(mockRedisClient.set).toHaveBeenCalledWith(`otp:${key}`, code, { EX: expectedTtl })
    })

    it('(Позитивний) Має зберегти код з кастомним TTL', async () => {
      // Arrange
      const key = 'test_user_custom_ttl'
      const code = '654321'
      const customTtl = 600

      // Act
      await otpService.set(key, code, customTtl)

      // Assert
      expect(mockRedisClient.connect).toHaveBeenCalledOnce()
      expect(mockRedisClient.set).toHaveBeenCalledOnce()
      expect(mockRedisClient.set).toHaveBeenCalledWith(`otp:${key}`, code, { EX: customTtl })
    })

    it('(Позитивний) Має викликати connect лише один раз при повторних викликах', async () => {
      // Arrange & Act
      await otpService.set('user1', '111')
      await otpService.set('user2', '222')

      // Assert
      expect(mockRedisClient.connect).toHaveBeenCalledOnce()
    })

    it('(Позитивний) Має використовувати правильний префікс для OTP', async () => {
      await otpService.set('user123', 'code456')
      expect(mockRedisClient.set).toHaveBeenCalledWith('otp:user123', 'code456', { EX: 300 })
    })
  })

  describe('get - Отримання та видалення OTP', () => {
    it('(Позитивний) Має повернути код і видалити його, якщо він існує', async () => {
      // Arrange
      const key = 'get_user'
      const code = '789012'
      mockRedisClient.get.mockResolvedValue(code)

      // Act
      const result = await otpService.get(key)

      // Assert
      expect(result).toBe(code)
      expect(mockRedisClient.get).toHaveBeenCalledWith(`otp:${key}`)
      expect(mockRedisClient.del).toHaveBeenCalledOnce()
      expect(mockRedisClient.del).toHaveBeenCalledWith(`otp:${key}`)
    })

    it('(Негативний) Має повернути null і не намагатись видалити, якщо код не існує', async () => {
      // Arrange
      const key = 'non_existent_user'
      mockRedisClient.get.mockResolvedValue(null)

      // Act
      const result = await otpService.get(key)

      // Assert
      expect(result).toBeNull()
      expect(mockRedisClient.get).toHaveBeenCalledWith(`otp:${key}`)
      expect(mockRedisClient.del).not.toHaveBeenCalled()
    })
  })

  describe('verify - Верифікація OTP без видалення', () => {
    it('(Позитивний) Має повернути true, якщо коди співпадають', async () => {
      // Arrange
      const key = 'verify_user'
      const correctCode = '555444'
      mockRedisClient.get.mockResolvedValue(correctCode)

      // Act
      const isMatch = await otpService.verify(key, correctCode)

      // Assert
      expect(isMatch).toBe(true)
      expect(mockRedisClient.get).toHaveBeenCalledWith(`otp:${key}`)
    })

    it('(Негативний) Має повернути false, якщо коди не співпадають', async () => {
      // Arrange
      const key = 'verify_user_fail'
      const correctCode = '555444'
      const incorrectInput = '111222'
      mockRedisClient.get.mockResolvedValue(correctCode)

      // Act
      const isMatch = await otpService.verify(key, incorrectInput)

      // Assert
      expect(isMatch).toBe(false)
    })

    it('(Негативний) Має повернути false, якщо збереженого коду немає', async () => {
      // Arrange
      const key = 'verify_non_existent'
      mockRedisClient.get.mockResolvedValue(null)

      // Act
      const isMatch = await otpService.verify(key, '123456')

      // Assert
      expect(isMatch).toBe(false)
    })

    it('(Позитивний) Не має видаляти ключ після простої перевірки', async () => {
      // Arrange
      const key = 'verify_no_delete'
      mockRedisClient.get.mockResolvedValue('123123')

      // Act
      await otpService.verify(key, '123123')

      // Assert
      expect(mockRedisClient.del).not.toHaveBeenCalled()
    })
  })

  describe('setLock - Встановлення блокування повторного відправлення', () => {
    it('(Позитивний) Має встановити ключ блокування з правильним префіксом і TTL', async () => {
      // Arrange
      const key = 'lock_user'
      const ttl = 60

      // Act
      await otpService.setLock(key, ttl)

      // Assert
      expect(mockRedisClient.set).toHaveBeenCalledOnce()
      expect(mockRedisClient.set).toHaveBeenCalledWith(`otp_lock:${key}`, 'locked', { EX: ttl })
    })

    it('(Позитивний) Має використовувати правильний префікс для блокування', async () => {
      // Arrange
      await otpService.setLock('user123', 60)
      
      // Assert
      expect(mockRedisClient.set).toHaveBeenCalledWith('otp_lock:user123', 'locked', { EX: 60 })
    })
  })

  describe('isLocked - Перевірка блокування повторного відправлення', () => {
    it('(Позитивний) Має повернути true, якщо ключ блокування існує', async () => {
      // Arrange
      const key = 'locked_user'
      mockRedisClient.exists.mockResolvedValue(1)

      // Act
      const result = await otpService.isLocked(key)

      // Assert
      expect(result).toBe(true)
      expect(mockRedisClient.exists).toHaveBeenCalledOnce()
      expect(mockRedisClient.exists).toHaveBeenCalledWith(`otp_lock:${key}`)
    })

    it('(Негативний) Має повернути false, якщо ключ блокування не існує', async () => {
      // Arrange
      const key = 'unlocked_user'
      mockRedisClient.exists.mockResolvedValue(0)

      // Act
      const result = await otpService.isLocked(key)

      // Assert
      expect(result).toBe(false)
      expect(mockRedisClient.exists).toHaveBeenCalledOnce()
      expect(mockRedisClient.exists).toHaveBeenCalledWith(`otp_lock:${key}`)
    })
  })

  describe('Обробка помилок Redis', () => {
    it('(Негативний) Має обробляти помилки підключення', async () => {
      mockRedisClient.connect.mockRejectedValue(new Error('Connection refused'))
      
      await expect(otpService.set('test', '123')).rejects.toThrow('Connection refused')
    })

    it('(Негативний) Має обробляти помилки запису', async () => {
      mockRedisClient.set.mockRejectedValue(new Error('Write error'))
      
      await expect(otpService.set('test', '123')).rejects.toThrow('Write error')
    })

    it('(Негативний) Має обробляти помилки читання', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('Read error'))
      
      await expect(otpService.get('test')).rejects.toThrow('Read error')
    })

    it('(Негативний) Має обробляти таймаути операцій Redis', async () => {
      const timeoutError = new Error('Operation timeout')
      timeoutError.name = 'TimeoutError'
      
      mockRedisClient.set.mockRejectedValue(timeoutError)
      
      await expect(otpService.set('test', '123')).rejects.toThrow('Operation timeout')
    })
  })

  describe('Граничні випадки та валідація', () => {
    it('(Позитивний) Має працювати з різними форматами ключів', async () => {
      const edgeKeys = [
        '',
        '   ',
        'key-with-special-chars!@#$%',
        'key:with:colons',
        'very_long_key_' + 'x'.repeat(1000),
        'ключ-на-кириллице',
        'key\nwith\nnewlines',
        '123456789'
      ]

      for (const key of edgeKeys) {
        await otpService.set(key, 'test-code')
        expect(mockRedisClient.set).toHaveBeenCalledWith(
          `otp:${key}`,
          'test-code',
          { EX: 300 }
        )
      }
    })

    it('(Позитивний) Має працювати з різними форматами кодів', async () => {
      const edgeCodes = [
        '',
        '   ',
        'very-long-code-' + 'x'.repeat(1000),
        'код-кириллицей',
        'code\nwith\nnewlines',
        'code with spaces',
        '!@#$%^&*()',
        JSON.stringify({ fake: 'object' })
      ]

      for (const code of edgeCodes) {
        await otpService.set('test-key', code)
        expect(mockRedisClient.set).toHaveBeenCalledWith(
          'otp:test-key',
          code,
          { EX: 300 }
        )
      }
    })

    it('(Позитивний) Має обробляти екстремальні значення TTL', async () => {
      const ttlValues = [
        1, // мінімум
        0, // граничний випадок
        -1, // від'ємне значення
        Number.MAX_SAFE_INTEGER, // максимум
        3.14, // дробове число
        Infinity,
        -Infinity,
        NaN
      ]

      for (const ttl of ttlValues) {
        if (isNaN(ttl) || !isFinite(ttl) || ttl < 0) {
          // Redis має відхиляти некоректні TTL
          mockRedisClient.set.mockRejectedValue(new Error('Invalid TTL'))
          await expect(otpService.set('test', 'code', ttl)).rejects.toThrow('Invalid TTL')
        } else {
          mockRedisClient.set.mockResolvedValue(undefined)
          await otpService.set('test', 'code', ttl)
          expect(mockRedisClient.set).toHaveBeenCalledWith('otp:test', 'code', { EX: ttl })
        }
        
        vi.clearAllMocks() // Очищуємо моки всередині циклу для чистоти перевірки
      }
    })
  })

  describe('Стан підключення та відновлення', () => {
    it('(Позитивний) Має повторно використовувати існуюче підключення', async () => {
      // Перший виклик
      await otpService.set('key1', 'code1')
      expect(mockRedisClient.connect).toHaveBeenCalledOnce()
      
      // Другий виклик не має викликати connect знову
      await otpService.set('key2', 'code2')
      expect(mockRedisClient.connect).toHaveBeenCalledOnce()
      
      // Третій виклик іншого методу
      await otpService.get('key1')
      expect(mockRedisClient.connect).toHaveBeenCalledOnce()
    })

    it('(Негативний) Має обробляти втрату з\'єднання', async () => {
      // Перше підключення успішне
      await otpService.set('key1', 'code1')
      
      // Симулюємо втрату з'єднання
      mockRedisClient.set.mockRejectedValue(new Error('Connection lost'))
      
      await expect(otpService.set('key2', 'code2')).rejects.toThrow('Connection lost')
    })
  })

  describe('Продуктивність та конкуренція', () => {
    it('(Позитивний) Має обробляти множинні послідовні операції', async () => {
      const keys = Array.from({ length: 100 }, (_, i) => `key${i}`)

      for (const key of keys) {
        await otpService.set(key, `code${
          key.substring(3)
        }`)
      }
      
      expect(mockRedisClient.set).toHaveBeenCalledTimes(100)
      expect(mockRedisClient.connect).toHaveBeenCalledOnce()
    })

    it('(Позитивний) Має обробляти змішані операції послідовно', async () => {
      const mixedOps = [
        () => otpService.set('key1', 'code1'),
        () => otpService.get('key1'),
        () => otpService.verify('key1', 'code1'),
        () => otpService.setLock('key1', 60),
        () => otpService.isLocked('key1')
      ]

      for (const op of mixedOps) {
        await op()
      }
      
      expect(mockRedisClient.connect).toHaveBeenCalledOnce()
    })

    it('(Позитивний) Має швидко виконувати операції в циклі', async () => {
      const start = performance.now()
      
      for (let i = 0; i < 1000; i++) {
        await otpService.set(`key${i}`, `code${i}`)
      }
      
      const end = performance.now()
      const duration = end - start
      
      // Перевіряємо, що операції виконуються швидко
      expect(duration).toBeLessThan(1000) // менше 1 секунди для 1000 операцій
    })
  })

  describe('Семантика одноразових кодів', () => {
    it('(Позитивний) get має видаляти код тільки при успішному отриманні', async () => {
      // Код існує
      mockRedisClient.get.mockResolvedValue('123456')
      
      const result = await otpService.get('test-key')
      
      expect(result).toBe('123456')
      expect(mockRedisClient.del).toHaveBeenCalledWith('otp:test-key')
    })

    it('(Негативний) get не має видаляти неіснуючий код', async () => {
      mockRedisClient.get.mockResolvedValue(null)
      
      const result = await otpService.get('non-existent')
      
      expect(result).toBeNull()
      expect(mockRedisClient.del).not.toHaveBeenCalled()
    })

    it('(Позитивний) verify не має видаляти код при перевірці', async () => {
      mockRedisClient.get.mockResolvedValue('123456')
      
      const result = await otpService.verify('test-key', '123456')
      
      expect(result).toBe(true)
      expect(mockRedisClient.del).not.toHaveBeenCalled()
    })

    it('(Позитивний) Має коректно обробляти race condition в get', async () => {
      // Симулюємо ситуацію, коли між get та del код видаляється
      let getCallCount = 0
      mockRedisClient.get.mockImplementation(() => {
        getCallCount++
        return Promise.resolve(getCallCount === 1 ? '123456' : null)
      })
      
      mockRedisClient.del.mockResolvedValue(0) // код вже було видалено
      
      const result = await otpService.get('racy-key')
      
      expect(result).toBe('123456')
      expect(mockRedisClient.del).toHaveBeenCalled()
    })
  })

  describe('Блокування повторного відправлення', () => {
    it('(Позитивний) Має правильно керувати життєвим циклом блокування', async () => {
      // Встановлюємо блокування
      await otpService.setLock('user123', 60)
      expect(mockRedisClient.set).toHaveBeenCalledWith('otp_lock:user123', 'locked', { EX: 60 })
      
      // Перевіряємо блокування
      mockRedisClient.exists.mockResolvedValue(1)
      const isLocked = await otpService.isLocked('user123')
      expect(isLocked).toBe(true)
      
      // Блокування закінчується
      mockRedisClient.exists.mockResolvedValue(0)
      const isStillLocked = await otpService.isLocked('user123')
      expect(isStillLocked).toBe(false)
    })

    it('(Позитивний) Має обробляти різний час блокування', async () => {
      const lockTimes = [1, 60, 300, 3600, 86400]
      
      for (const lockTime of lockTimes) {
        await otpService.setLock('user', lockTime)
        expect(mockRedisClient.set).toHaveBeenCalledWith(
          'otp_lock:user',
          'locked',
          { EX: lockTime }
        )
      }
    })
  })
})