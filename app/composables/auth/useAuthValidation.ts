import { authSchemas, fieldSchemas } from '~~/shared/validation/schemas'
import type { AuthSendCodeInput, AuthLoginInput, AuthUpdateProfileInput } from '~~/shared/validation/schemas'
import { z } from 'zod'

/**
 * Композабл для валидации форм авторизации с использованием Zod
 */
export const useAuthValidation = () => {
  
  /**
   * Форматирование номера телефона во время ввода
   */
  const formatPhone = (value: string): string => {
    let digits = value.replace(/\D/g, '')
    
    if (digits.startsWith('380')) {
      digits = '+' + digits
    } else if (digits.startsWith('80')) {
      digits = '+3' + digits
    } else if (digits.startsWith('0')) {
      digits = '+38' + digits
    } else if (digits.length <= 9 && !digits.startsWith('380')) {
      digits = '+380' + digits
    }
    
    return digits.slice(0, 13)
  }

  /**
   * Нормализация номера телефона для отправки на сервер
   */
  const normalizePhone = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '')
    
    if (cleaned.startsWith('380')) {
      return `+${cleaned}`
    } else if (cleaned.startsWith('0') && cleaned.length === 10) {
      return `+38${cleaned}`
    } else if (cleaned.length === 9) {
      return `+380${cleaned}`
    }
    
    return phone
  }

  /**
   * Валидация отдельных полей
   */
  const validateField = (field: 'phone' | 'code' | 'email' | 'name', value: string) => {
    try {
      fieldSchemas[field].parse(value)
      return { success: true, error: null }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          success: false, 
          error: error.issues[0]?.message || 'Помилка валідації' 
        }
      }
      return { success: false, error: 'Невідома помилка валідації' }
    }
  }

  /**
   * Быстрые проверки валидности (для disabled состояний кнопок)
   */
  const isPhoneValid = (phone: string): boolean => {
    return fieldSchemas.phone.safeParse(phone).success
  }

  const isCodeValid = (code: string): boolean => {
    return fieldSchemas.code.safeParse(code).success
  }

  const isEmailValid = (email: string): boolean => {
    return fieldSchemas.email.safeParse(email).success
  }

  /**
   * Валидация формы отправки кода
   */
  const validateSendCodeForm = (data: { phone: string }) => {
    try {
      const validated = authSchemas.sendCode.parse({
        phone: normalizePhone(data.phone)
      })
      return { 
        success: true as const, 
        data: validated, 
        errors: {} 
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        error.issues.forEach(err => {
          const path = err.path[0] as string
          errors[path] = err.message
        })
        return { 
          success: false as const, 
          data: null, 
          errors 
        }
      }
      return { 
        success: false as const, 
        data: null, 
        errors: { general: 'Помилка валідації' } 
      }
    }
  }

  /**
   * Валидация формы входа
   */
  const validateLoginForm = (data: { phone: string; code: string }) => {
    try {
      const validated = authSchemas.login.parse({
        phone: normalizePhone(data.phone),
        code: data.code
      })
      return { 
        success: true as const, 
        data: validated, 
        errors: {} 
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        error.issues.forEach(err => {
          const path = err.path[0] as string
          errors[path] = err.message
        })
        return { 
          success: false as const, 
          data: null, 
          errors 
        }
      }
      return { 
        success: false as const, 
        data: null, 
        errors: { general: 'Помилка валідації' } 
      }
    }
  }

  /**
   * Валидация формы обновления профиля
   */
  const validateProfileForm = (data: { name?: string; email?: string }) => {
    try {
      const validated = authSchemas.updateProfile.parse(data)
      return { 
        success: true as const, 
        data: validated, 
        errors: {} 
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        error.issues.forEach(err => {
          const path = err.path[0] as string
          errors[path] = err.message
        })
        return { 
          success: false as const, 
          data: null, 
          errors 
        }
      }
      return { 
        success: false as const, 
        data: null, 
        errors: { general: 'Помилка валідації' } 
      }
    }
  }

  /**
   * Получение сообщения об ошибке для отдельного поля
   */
  const getFieldError = (field: 'phone' | 'code' | 'email' | 'name', value: string): string | null => {
    const result = validateField(field, value)
    return result.success ? null : result.error
  }

  /**
   * Реактивный валидатор для v-model
   */
  const createFieldValidator = (field: 'phone' | 'code' | 'email' | 'name') => {
    return (value: string) => getFieldError(field, value)
  }

  return {
    // Форматирование
    formatPhone,
    normalizePhone,
    
    // Быстрые проверки
    isPhoneValid,
    isCodeValid,
    isEmailValid,
    
    // Валидация отдельных полей
    validateField,
    getFieldError,
    createFieldValidator,
    
    // Валидация форм
    validateSendCodeForm,
    validateLoginForm,
    validateProfileForm,
    
    // Прямой доступ к схемам для серверной валидации
    schemas: {
      sendCode: authSchemas.sendCode,
      login: authSchemas.login,
      updateProfile: authSchemas.updateProfile
    }
  }
}