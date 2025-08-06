export interface Order {
  id: number
  userId?: number
  customerName?: string
  customerPhone?: string
  deliveryAddress?: string
  paymentMethod: 'CASH' | 'CARD' | 'ONLINE'
  status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED'
  total: number
  createdAt: string
  items: OrderItem[]
  payment?: Payment
  user?: {
    id: number
    name?: string
    email?: string
    phone: string
  }
}

export interface OrderUpdateData {
  status?: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  total?: number;
  paymentMethod?: 'CASH' | 'CARD' | 'ONLINE';
  userId?: number; // если нужно привязать к пользователю
}

export interface Payment {
  id: number
  orderId: number
  amount: number
  method: 'CASH' | 'CARD' | 'ONLINE'
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  createdAt: string
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
  updateOrder: (orderId: string | number, updateData: OrderUpdateData) => Promise<void>
  callCustomer: (phone: string) => void
  refresh: () => Promise<void>
  createStatusDropdownItems: (onStatusSelect: (status: string) => void) => StatusDropdownItem[][]
}