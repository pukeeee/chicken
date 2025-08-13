import type { OrderUpdateData } from '~~/shared/types/order'

/**
 * Валидация номера телефона
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone) return false
  // Простая валидация для украинских номеров
  const phoneRegex = /^(\+380|380|0)[0-9]{9}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

/**
 * Валидация email
 */
export const validateEmail = (email: string): boolean => {
  if (!email) return true // email не обязателен
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Валидация суммы заказа
 */
export const validateTotal = (total: number): boolean => {
  return typeof total === 'number' && total > 0
}

/**
 * Валидация данных формы заказа
 */
export const validateOrderForm = (data: Partial<OrderUpdateData & { status: string, paymentMethod: string }>): {
  isValid: boolean
  errors: Record<string, string>
} => {
  const errors: Record<string, string> = {}

  if (!data.customerPhone) {
    errors.customerPhone = 'Телефон клієнта обов\'язковий'
  } else if (!validatePhone(data.customerPhone)) {
    errors.customerPhone = 'Невірний формат телефону'
  }

  if (data.customerEmail && !validateEmail(data.customerEmail)) {
    errors.customerEmail = 'Невірний формат email'
  }

  if (!data.total || !validateTotal(data.total)) {
    errors.total = 'Сума замовлення повинна бути більше 0'
  }

  if (!data.status) {
    errors.status = 'Статус замовлення обов\'язковий'
  }

  if (!data.paymentMethod) {
    errors.paymentMethod = 'Спосіб оплати обов\'язковий'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Нормализация номера телефона
 */
export const normalizePhone = (phone: string): string => {
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