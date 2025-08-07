import { ORDER_STATUS_CONFIG, PAYMENT_METHOD_CONFIG } from '~/constants/orderConstants'

/**
 * Получение иконки статуса
 */
export const getStatusIcon = (status: string): string => {
  return ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG]?.icon || 'i-lucide-help-circle'
}

/**
 * Получение цвета статуса
 */
export const getStatusColor = (status: string): string => {
  const config = ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG]
  return config ? `text-${config.color}-600` : 'text-gray-600'
}

/**
 * Получение метки статуса
 */
export const getStatusLabel = (status: string): string => {
  return ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG]?.label || status
}

/**
 * Получение иконки способа оплаты
 */
export const getPaymentIcon = (method: string): string => {
  return PAYMENT_METHOD_CONFIG[method as keyof typeof PAYMENT_METHOD_CONFIG]?.icon || 'i-lucide-help-circle'
}

/**
 * Получение метки способа оплаты
 */
export const getPaymentLabel = (method: string): string => {
  return PAYMENT_METHOD_CONFIG[method as keyof typeof PAYMENT_METHOD_CONFIG]?.label || method
}

/**
 * Создание опций для статусов
 */
export const createStatusOptions = () => {
  return Object.entries(ORDER_STATUS_CONFIG).map(([key, config]) => ({
    id: key,
    label: config.label,
    value: key,
    icon: config.icon,
    colorClass: `text-${config.color}-600`
  }))
}

/**
 * Создание опций для способов оплаты
 */
export const createPaymentOptions = () => {
  return Object.entries(PAYMENT_METHOD_CONFIG).map(([key, config]) => ({
    id: key,
    label: config.label,
    value: key,
    icon: config.icon
  }))
}