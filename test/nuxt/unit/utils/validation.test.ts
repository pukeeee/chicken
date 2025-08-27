/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @file Юніт-тести для утиліт валідації
 * @description Тести перевіряють логіку валідації. Модуль `h3` повністю мокається,
 * щоб контролювати функції `readBody`, `getQuery` та `createError`.
 */
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { z } from 'zod'
import type { H3Event } from 'h3'
import { 
  validateBody, 
  validateQuery,
  createValidationError,
  withValidation,
  safeValidateBody
} from '~~/server/utils/validation'
import { readBody, getQuery, createError } from 'h3'

// --- Mocks Setup ---

// Повністю мокаємо модуль h3, щоб контролювати його функції в усіх тестах
vi.mock('h3', () => ({
  readBody: vi.fn(),
  getQuery: vi.fn(),
  createError: vi.fn(e => ({
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
}));

// Типізуємо моки для зручності використання
const mockedReadBody = readBody as Mock;
const mockedGetQuery = getQuery as Mock;
const mockedCreateError = createError as Mock;

// --- Test Suite ---

describe('Утиліти валідації', () => {
  beforeEach(() => {
    vi.resetAllMocks()
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
      mockedReadBody.mockResolvedValue(validData)

      // Act
      const result = await validateBody(mockEvent, testSchema)

      // Assert
      expect(mockedReadBody).toHaveBeenCalledWith(mockEvent)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validData)
    })

    it('(Негативний) Має повернути { success: false, errors } для невалідного тіла запиту', async () => {
      // Arrange
      const invalidData = { name: '', age: 30 } // name is empty
      mockedReadBody.mockResolvedValue(invalidData)

      // Act
      const result = await validateBody(mockEvent, testSchema)

      // Assert
      expect(result.success).toBe(false)
      expect((result as any).errors?.name).toEqual(['Name is required'])
    })

    it('(Негативний) Має обробляти не-Zod помилки під час читання тіла', async () => {
        // Arrange
        mockedReadBody.mockRejectedValue(new Error('Read error'))
  
        // Act
        const result = await validateBody(mockEvent, testSchema)
  
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
      mockedGetQuery.mockReturnValue(validQuery)

      // Act
      const result = validateQuery(mockEvent, schemaWithCoercion)

      // Assert
      expect(mockedGetQuery).toHaveBeenCalledWith(mockEvent)
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
        mockedGetQuery.mockReturnValue(invalidQuery)
  
        // Act
        const result = validateQuery(mockEvent, schemaWithCoercion)
  
        // Assert
        expect(result.success).toBe(false)
        expect((result as any).errors?.age).toEqual(['Must be at least 18'])
      })
  })

  describe('createValidationError - Створення об\'єкта помилки', () => {
    it('(Позитивний) Має викликати createError з правильними параметрами', () => {
      // Arrange
      const validationResult = { success: false, message: 'Error', errors: { f: ['m'] } }

      // Act
      createValidationError(validationResult as any, 422)

      // Assert
      expect(mockedCreateError).toHaveBeenCalledWith({
        statusCode: 422,
        statusMessage: 'Error',
        data: { f: ['m'] }
      })
    })
  })

  describe('Складні схеми валідації', () => {
    it('(Негативний) Має обробляти вкладені об\'єкти з масивами', async () => {
      const complexSchema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string(),
            tags: z.array(z.string())
          }),
          settings: z.object({
            notifications: z.boolean(),
            theme: z.enum(['light', 'dark'])
          })
        })
      })

      const invalidData = {
        user: {
          profile: {
            name: 123, // має бути рядком
            tags: ['tag1', 123] // другий елемент має бути рядком
          },
          settings: {
            notifications: 'true', // має бути boolean
            theme: 'blue' // неприпустиме значення enum
          }
        }
      }

      mockedReadBody.mockResolvedValue(invalidData)

      const result = await validateBody(mockEvent, complexSchema)

      expect(result.success).toBe(false)
      const errors = (result as any).errors;
      expect(errors).toHaveProperty('user.profile.name')
      expect(errors).toHaveProperty('user.profile.tags.1')
      expect(errors).toHaveProperty('user.settings.notifications')
      expect(errors).toHaveProperty('user.settings.theme')
    })

    it('(Негативний) Має валідувати умовні схеми (discriminated unions)', async () => {
      const conditionalSchema = z.discriminatedUnion('type', [
        z.object({
          type: z.literal('email'),
          email: z.string().email()
        }),
        z.object({
          type: z.literal('phone'),
          phone: z.string().min(10)
        })
      ])

      // Неправильний тип
      mockedReadBody.mockResolvedValue({
        type: 'email',
        phone: '123456789' // очікується email, а не phone
      })

      const result = await validateBody(mockEvent, conditionalSchema)

      expect(result.success).toBe(false)
    })
  })

  describe('safeValidateBody - розширені тести', () => {
    it('(Позитивний) Має замінювати тільки вказані помилки, залишаючи інші', async () => {
      const schema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
        age: z.number().min(18)
      })

      const customErrors = {
        name: 'Кастомна помилка імені'
        // email та age залишаються зі стандартними помилками
      }

      mockedReadBody.mockResolvedValue({
        name: 'a',
        email: 'invalid-email',
        age: 16
      })

      const result = await safeValidateBody(mockEvent, schema, customErrors)

      expect(result.success).toBe(false)
      const errors = (result as any).errors;
      expect(errors?.name).toEqual(['Кастомна помилка імені'])
      expect(errors?.email).toEqual(['Invalid email address'])
      expect(errors?.age).toEqual(['Too small: expected number to be >=18'])
    })

    it('(Негативний) Має обробляти відсутні кастомні помилки', async () => {
      const schema = z.object({ name: z.string() })
      mockedReadBody.mockResolvedValue({ name: 123 })

      const result = await safeValidateBody(mockEvent, schema, {})

      expect(result.success).toBe(false)
      expect((result as any).errors?.name).toEqual(['Invalid input: expected string, received number'])
    })
  })

  describe('withValidation - тестування middleware', () => {
    it('(Позитивний) Має повертати валідовані дані для коректного запиту', async () => {
      const schema = z.object({ name: z.string() })
      const validData = { name: 'Test' }
      
      mockedReadBody.mockResolvedValue(validData)

      const middleware = withValidation(schema, 'body')
      const result = await middleware(mockEvent)

      expect(result).toEqual(validData)
    })

    it('(Негативний) Має кидати помилку для некоректних даних', async () => {
      const schema = z.object({ name: z.string() })
      mockedReadBody.mockResolvedValue({ name: 123 })

      const middleware = withValidation(schema, 'body')

      await expect(middleware(mockEvent)).rejects.toThrow()
    })
  })

  describe('Екстремальні та граничні випадки', () => {
    it('(Негативний) Має обробляти дуже глибоку вкладеність', async () => {
      // Створюємо глибоко вкладену схему
      let deepSchema: z.ZodTypeAny = z.string()
      for (let i = 0; i < 100; i++) {
        deepSchema = z.object({ nested: deepSchema })
      }

      // Створюємо відповідні дані з помилкою на найглибшому рівні
      let deepData: any = 123 // помилка - має бути рядок
      for (let i = 0; i < 100; i++) {
        deepData = { nested: deepData }
      }

      mockedReadBody.mockResolvedValue(deepData)

      const result = await validateBody(mockEvent, deepSchema)

      expect(result.success).toBe(false)
      // Перевіряємо, що шлях до помилки правильно сформований
      const errorPath = 'nested.'.repeat(99) + 'nested'
      expect((result as any).errors).toHaveProperty(errorPath)
    })

    it('(Позитивний) Має обробляти дуже великі об\'єкти', async () => {
      const largeObject: Record<string, string> = {}
      for (let i = 0; i < 10000; i++) {
        largeObject[`field${i}`] = `value${i}`
      }

      const dynamicSchema = z.object(
        Object.fromEntries(
          Object.keys(largeObject).map(key => [key, z.string()])
        )
      )

      mockedReadBody.mockResolvedValue(largeObject)

      const result = await validateBody(mockEvent, dynamicSchema)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(largeObject)
    })
  })

})