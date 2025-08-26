/**
 * @file Юніт-тести для утиліт валідації
 * @description Тести перевіряють логіку валідації, використовуючи впровадження залежностей
 * для мокінгу функцій `readBody`, `getQuery` та `createError`.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { z } from 'zod'
import type { H3Event } from 'h3'
import { 
  validateBody, 
  validateQuery,
  createValidationError
} from '~~/server/utils/validation'

// --- Mocks Setup ---

const mockReadBody = vi.fn()
const mockGetQuery = vi.fn()
const mockCreateError = vi.fn(e => ({
  ...new Error(e.statusMessage || 'Unknown error'),
  statusCode: e.statusCode,
  statusMessage: e.statusMessage,
  data: e.data,
  fatal: false,
  unhandled: false,
  toJSON: () => ({
    message: e.statusMessage,
    statusCode: e.statusCode,
    statusMessage: e.statusMessage,
    data: e.data
  })
}))

// --- Test Suite ---

describe('Утиліти валідації', () => {
  // Скидаємо моки перед кожним тестом
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const testSchema = z.object({
    name: z.string().nonempty('Name is required'),
    age: z.number().min(18, 'Must be at least 18')
  })

  const mockEvent = {} as H3Event

  describe('validateBody - Валідація тіла запиту', () => {
    it('(Позитивний) Має повернути { success: true, data } для валідного тіла запиту', async () => {
      // Arrange
      const validData = { name: 'John', age: 30 }
      mockReadBody.mockResolvedValue(validData)

      // Act
      const result = await validateBody(mockEvent, testSchema, mockReadBody)

      // Assert
      expect(mockReadBody).toHaveBeenCalledWith(mockEvent)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validData)
    })

    it('(Негативний) Має повернути { success: false, errors } для невалідного тіла запиту', async () => {
      // Arrange
      const invalidData = { name: '', age: 30 } // name is empty
      mockReadBody.mockResolvedValue(invalidData)

      // Act
      const result = await validateBody(mockEvent, testSchema, mockReadBody)

      // Assert
      expect(result.success).toBe(false)
      expect(result.errors?.name).toEqual(['Name is required'])
    })

    it('(Негативний) Має обробляти не-Zod помилки', async () => {
        // Arrange
        mockReadBody.mockRejectedValue(new Error('Read error'))
  
        // Act
        const result = await validateBody(mockEvent, testSchema, mockReadBody)
  
        // Assert
        expect(result.success).toBe(false)
        expect(result.message).toBe('Невідома помилка валідації')
      })
  })

  describe('validateQuery - Валідація query-параметрів', () => {
    it('(Позитивний) Має повернути { success: true, data } для валідних query', () => {
      // Arrange
      const validQuery = { name: 'Jane', age: '25' }
      const schemaWithCoercion = z.object({ name: z.string(), age: z.coerce.number() })
      mockGetQuery.mockReturnValue(validQuery)

      // Act
      const result = validateQuery(mockEvent, schemaWithCoercion, mockGetQuery)

      // Assert
      expect(mockGetQuery).toHaveBeenCalledWith(mockEvent)
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ name: 'Jane', age: 25 })
    })

    it('(Негативний) Має повернути { success: false, errors } для невалідних query', () => {
        // Arrange
        const invalidQuery = { name: 'Jane', age: '17' }
        const schemaWithCoercion = z.object({
            name: z.string(), 
            age: z.coerce.number().min(18, 'Must be at least 18') 
        })
        mockGetQuery.mockReturnValue(invalidQuery)
  
        // Act
        const result = validateQuery(mockEvent, schemaWithCoercion, mockGetQuery)
  
        // Assert
        expect(result.success).toBe(false)
        expect(result.errors?.age).toEqual(['Must be at least 18'])
      })
  })

  describe('createValidationError - Створення об\'єкта помилки', () => {
    it('(Позитивний) Має викликати createError з правильними параметрами', () => {
      // Arrange
      const validationResult = { success: false, message: 'Error', errors: { f: ['m'] } }

      // Act
      createValidationError(validationResult, 422, mockCreateError)

      // Assert
      expect(mockCreateError).toHaveBeenCalledWith({
        statusCode: 422,
        statusMessage: 'Error',
        data: { f: ['m'] }
      })
    })
  })
})
