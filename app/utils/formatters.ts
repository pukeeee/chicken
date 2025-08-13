/**
 * Форматирует дату в локальный формат
 */
export const formatDate = (dateString: string | Date): string => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Kiev'
  })
}

/**
 * Форматирует цену в валюту
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'UAH'
  }).format(price)
}

/**
 * Форматирует номер телефона
 */
export const formatPhone = (phone: string): string => {
  // Простое форматирование для украинских номеров
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 12 && cleaned.startsWith('380')) {
    return `+38 (${cleaned.slice(3, 6)}) ${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}-${cleaned.slice(11)}`
  }
  return phone
}

/**
 * Форматирует ID заказа с префиксом
 */
export const formatOrderId = (id: number): string => {
  return `#${String(id).padStart(4, '0')}`
}