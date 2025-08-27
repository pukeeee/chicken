/**
 * @file Юніт-тести для codeService
 * @description Ці тести перевіряють бізнес-логіку генерації та верифікації кодів.
 * Залежність `otpService` повністю мокається, щоб ізолювати `codeService` і тестувати
 * виключно його власну логіку.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { codeService } from '~~/server/services/users/codeService'
import { otpService } from '~~/server/utils/otp'
import { AppError } from '~~/server/services/errorService'

// Повністю мокаємо залежність otpService. Кожен його метод замінюється на мок-функцію.
vi.mock('~~/server/utils/otp', () => ({
  otpService: {
    set: vi.fn(),
    get: vi.fn(),
    verify: vi.fn(),
    setLock: vi.fn(),
    isLocked: vi.fn()
  }
}))

describe('codeService', () => {
  // Перед кожним тестом очищуємо історію викликів всіх моків.
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('error check', () => {
    it('(Негативний) Має обробляти помилки otpService.set', async () => {
      vi.mocked(otpService.isLocked).mockResolvedValue(false)
      vi.mocked(otpService.set).mockRejectedValue(new Error('Redis error'))
      
      await expect(codeService.createAndStore('123')).rejects.toThrow('Redis error')
    })
  })

  describe('generateCode - Генерація коду', () => {
    it('(Позитивний) Має генерувати код з 6 символів за замовчуванням', () => {
      // Act
      const code = codeService.generateCode()
      // Assert
      expect(code).toBeTypeOf('string')
      expect(code.length).toBe(6)
    })

    it('(Позитивний) Має генерувати код заданої довжини', () => {
      // Act
      const code = codeService.generateCode(4)
      // Assert
      expect(code.length).toBe(4)
    })

    it('(Позитивний) Має містити тільки дозволені символи (цифри та літери крім I, O, 0)', () => {
      // Arrange
      const allowedChars = /^[1-9A-HJ-NP-Z]+$/
      // Act
      const code = codeService.generateCode(100)
      // Assert
      expect(allowedChars.test(code)).toBe(true)
    })

    it('(Негативний) Має повертати порожній рядок, якщо довжина 0', () => {
      // Act
      const code = codeService.generateCode(0)
      // Assert
      expect(code).toBe('')
    })

    it('(Позитивний) Має генерувати різні коди при послідовних викликах', () => {
      // Act
      const codes = new Set()
      for (let i = 0; i < 100; i++) {
        codes.add(codeService.generateCode())
      }
      // Assert
      expect(codes.size).toBeGreaterThan(95)
    })
  })

  describe('createAndStore - Створення та збереження коду', () => {
    it('(Позитивний) Має створити, зберегти код і встановити блокування, якщо його немає', async () => {
      // Arrange
      const phone = '123456789'
      vi.mocked(otpService.isLocked).mockResolvedValue(false)

      // Act
      const code = await codeService.createAndStore(phone)

      // Assert
      expect(otpService.isLocked).toHaveBeenCalledWith(phone)
      expect(otpService.set).toHaveBeenCalledOnce()
      expect(otpService.set).toHaveBeenCalledWith(phone, expect.any(String), 300)
      expect(otpService.setLock).toHaveBeenCalledOnce()
      expect(otpService.setLock).toHaveBeenCalledWith(phone, 60)
      expect(code).toBeDefined()
      expect(code.length).toBe(6)
    })

    it('(Позитивний) Має передавати кастомний TTL в otpService.set', async () => {
      // Arrange
      const phone = '987654321'
      const customTtl = 600
      vi.mocked(otpService.isLocked).mockResolvedValue(false)

      // Act
      await codeService.createAndStore(phone, customTtl)

      // Assert
      expect(otpService.set).toHaveBeenCalledWith(phone, expect.any(String), customTtl)
    })

    it('(Позитивний) Має генерувати код правильного формату', async () => {
      // Arrange
      const phone = '123456789'
      vi.mocked(otpService.isLocked).mockResolvedValue(false)
      
      // Act
      const code = await codeService.createAndStore(phone)
      
      // Assert
      expect(code).toMatch(/^[1-9A-HJ-NP-Z]{6}$/)
    })

    it('(Негативний) Має викинути помилку AppError 429, якщо блокування активне', async () => {
      // Arrange
      const phone = '111222333'
      vi.mocked(otpService.isLocked).mockResolvedValue(true)

      // Act & Assert
      await expect(codeService.createAndStore(phone)).rejects.toThrow(AppError)
      await expect(codeService.createAndStore(phone)).rejects.toMatchObject({
        statusCode: 429,
        message: 'Повторная отправка возможна через минуту'
      })
      expect(otpService.set).not.toHaveBeenCalled()
      expect(otpService.setLock).not.toHaveBeenCalled()
    })
  })

  describe('verify - Верифікація коду', () => {
    it('(Позитивний) Має повернути true, якщо код вірний', async () => {
      // Arrange
      const phone = '444555666'
      const correctCode = 'ABCDEF'
      vi.mocked(otpService.get).mockResolvedValue(correctCode)

      // Act
      const result = await codeService.verify(phone, correctCode)

      // Assert
      expect(result).toBe(true)
      expect(otpService.get).toHaveBeenCalledWith(phone)
    })

    it('(Негативний) Має повернути false, якщо код невірний', async () => {
      // Arrange
      const phone = '444555666'
      const correctCode = 'ABCDEF'
      const incorrectCode = 'FEDCBA'
      vi.mocked(otpService.get).mockResolvedValue(correctCode)

      // Act
      const result = await codeService.verify(phone, incorrectCode)

      // Assert
      expect(result).toBe(false)
    })

    it('(Негативний) Має повернути false, якщо збереженого коду не існує', async () => {
      // Arrange
      const phone = '777888999'
      vi.mocked(otpService.get).mockResolvedValue(null)

      // Act
      const result = await codeService.verify(phone, '123456')

      // Assert
      expect(result).toBe(false)
    })
  })
})