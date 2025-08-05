// constants/orderConstants.ts

// Enum для статусов заказов (для использования в БД)
export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

// Enum для способов оплаты (для использования в БД)
export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  ONLINE = 'ONLINE'
}

// Конфигурация статусов для UI
export const ORDER_STATUS_CONFIG = {
  [OrderStatus.PENDING]: { 
    label: 'Очікує', 
    color: 'warning' as const, 
    icon: 'i-lucide-clock',
    value: 'pending'
  },
  [OrderStatus.PREPARING]: { 
    label: 'Готується', 
    color: 'info' as const, 
    icon: 'i-lucide-chef-hat',
    value: 'preparing'
  },
  [OrderStatus.READY]: { 
    label: 'Готовий', 
    color: 'success' as const, 
    icon: 'i-lucide-check-circle',
    value: 'ready'
  },
  [OrderStatus.DELIVERED]: { 
    label: 'Доставлено', 
    color: 'neutral' as const, 
    icon: 'i-lucide-truck',
    value: 'delivered'
  },
  [OrderStatus.CANCELLED]: { 
    label: 'Скасовано', 
    color: 'error' as const, 
    icon: 'i-lucide-x-circle',
    value: 'cancelled'
  }
} as const

// Конфигурация способов оплаты для UI
export const PAYMENT_METHOD_CONFIG = {
  [PaymentMethod.CASH]: { 
    label: 'Готівка', 
    icon: 'i-lucide-banknote' 
  },
  [PaymentMethod.CARD]: { 
    label: 'Картка', 
    icon: 'i-lucide-credit-card' 
  },
  [PaymentMethod.ONLINE]: { 
    label: 'Онлайн', 
    icon: 'i-lucide-smartphone' 
  }
} as const

// Типы для TypeScript
export type OrderStatusKey = keyof typeof ORDER_STATUS_CONFIG
export type PaymentMethodKey = keyof typeof PAYMENT_METHOD_CONFIG