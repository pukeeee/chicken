export interface Order {
  id: string | number
  status: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  total: number
  items: OrderItem[]
  createdAt: string
  updatedAt?: string
  deliveryAddress?: string
  paymentMethod?: string
  notes?: string
}

export interface OrderItem {
  id: string | number
  productId: number
  product: {
    name: string
  }
  price: number
  quantity: number
  image?: string
}

// Статистика заказов
export interface OrderStats {
  total: number
  pending: number
  confirmed: number
  preparing: number
  ready: number
  delivered: number
  cancelled: number
  // Добавьте другие поля статистики по необходимости
}

// Ответ API для списка заказов
export interface OrdersResponse {
  orders: Order[]
  total: number
  orderStats?: OrderStats
}

// Конфигурация статуса заказа
export interface OrderStatusConfig {
  value: string
  label: string
  icon: string
  color?: string
}

// Элемент дропдауна для выбора статуса
export interface StatusDropdownItem {
  label: string
  icon: string
  onSelect: () => void
}

// Параметры запроса для фильтрации заказов
export interface OrderFilters {
  status?: string
  search?: string
  page: number
  limit: number
}

// Параметры обновления статуса заказа
export interface UpdateOrderStatusPayload {
  status: string
}

// Уведомление (Toast)
export interface ToastNotification {
  title: string
  description: string
  color: "error" | "warning" | "info" | "success" | "neutral" | "primary" | "secondary"
}

// Тип для возвращаемого значения composable useOrders
export interface UseOrdersReturn {
  // Состояния
  selectedStatus: Ref<string>
  searchQuery: Ref<string>
  currentPage: Ref<number>
  pageSize: Ref<number>
  
  // Данные
  orders: ComputedRef<Order[]>
  totalOrders: ComputedRef<number>
  totalPages: ComputedRef<number>
  orderStats: ComputedRef<OrderStats | null>
  loading: Ref<boolean>
  error: Ref<any>
  
  // Методы
  initializeFromUrl: () => void
  handleStatusChange: () => void
  handlePageChange: (page: number) => void
  clearFilters: () => void
  updateOrderStatus: (orderId: string | number, newStatus: string) => Promise<void>
  callCustomer: (phone: string) => void
  refresh: () => Promise<void>
  createStatusDropdownItems: (onStatusSelect: (status: string) => void) => StatusDropdownItem[][]
}