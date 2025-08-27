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
    it('Позитивний) Має обробляти помилки підключення до Redis', async () => {
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

    it('Має використовувати правильний префікс для OTP', async () => {
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

    it('Має використовувати правильний префікс для блокування', async () => {
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
})
