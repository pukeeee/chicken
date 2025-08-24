import { z } from 'zod'
import type { H3Event } from 'h3'

/**
 * Результат валидации
 */
export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: Record<string, string[]>
  message?: string
}

/**
 * Валидация тела запроса с помощью Zod схемы
 */
export async function validateBody<T>(
  event: H3Event,
  schema: z.ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    const body = await readBody(event)
    const validatedData = schema.parse(body)
    
    return {
      success: true,
      data: validatedData
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {}
      
      error.issues.forEach(err => {
        const path = err.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })
      
      return {
        success: false,
        errors,
        message: 'Помилки валідації'
      }
    }
    
    return {
      success: false,
      message: 'Невідома помилка валідації'
    }
  }
}

/**
 * Валидация query параметров
 */
export function validateQuery<T>(
  event: H3Event,
  schema: z.ZodSchema<T>
): ValidationResult<T> {
  try {
    const query = getQuery(event)
    const validatedData = schema.parse(query)
    
    return {
      success: true,
      data: validatedData
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {}
      
      error.issues.forEach(err => {
        const path = err.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })
      
      return {
        success: false,
        errors,
        message: 'Помилки валідації query параметрів'
      }
    }
    
    return {
      success: false,
      message: 'Невідома помилка валідації query'
    }
  }
}

/**
 * Создание стандартизированного ответа об ошибке валидации
 */
export function createValidationError(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validationResult: ValidationResult<any>,
  statusCode: number = 400
) {
  return createError({
    statusCode,
    statusMessage: validationResult.message || 'Помилка валідації',
    data: validationResult.errors
  })
}

/**
 * Middleware для валидации (можно использовать как декоратор)
 */
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  type: 'body' | 'query' = 'body'
) {
  return async (event: H3Event): Promise<T> => {
    let validationResult: ValidationResult<T>
    
    if (type === 'body') {
      validationResult = await validateBody(event, schema)
    } else {
      validationResult = validateQuery(event, schema)
    }
    
    if (!validationResult.success) {
      throw createValidationError(validationResult)
    }
    
    return validationResult.data!
  }
}

/**
 * Помощник для валидации с кастомными ошибками
 */
export async function safeValidateBody<T>(
  event: H3Event,
  schema: z.ZodSchema<T>,
  customErrors?: Record<string, string>
): Promise<ValidationResult<T>> {
  const result = await validateBody(event, schema)
  
  if (!result.success && customErrors && result.errors) {
    // Заменяем стандартные сообщения на кастомные
    const updatedErrors: Record<string, string[]> = {}
    
    Object.entries(result.errors).forEach(([field, messages]) => {
      const customMessage = customErrors[field]
      updatedErrors[field] = customMessage ? [customMessage] : messages
    })
    
    return {
      ...result,
      errors: updatedErrors
    }
  }
  
  return result
}

/**
 * Типизированные ошибки для разных случаев
 */
export const ValidationErrors = {
  PHONE_INVALID: 'Невірний формат номера телефону',
  CODE_INVALID: 'Невірний код підтвердження',
  EMAIL_INVALID: 'Невірний формат email',
  REQUIRED_FIELD: 'Це поле обов\'язкове',
  PHONE_EXISTS: 'Користувач з таким номером уже існує',
  USER_NOT_FOUND: 'Користувача не знайдено',
  INVALID_CREDENTIALS: 'Невірні дані для входу'
} as const