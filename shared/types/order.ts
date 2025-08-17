import type { Product } from './types'

export interface OrderCustomer {
  id: number
  name?: string | null
  email?: string | null
  phone?: string | null
}

export interface OrderItem {
  id: number
  quantity: number
  price: number
  image?: string | null
  product: Product
}

export interface Order {
  id: number
  status: string
  customerName?: string | null
  customerPhone?: string | null
  customerEmail?: string | null
  deliveryAddress?: string | null
  total: number
  paymentMethod: string
  createdAt: string
  updatedAt?: string | null
  items: OrderItem[]
  user?: OrderCustomer | null
}

// Параметры запроса для фильтрации заказов
export interface OrderFilters {
  status?: string
  search?: string
  page: number
  limit: number
}

export interface OrderUpdateData {
  userId?: number
  status?: string
  customerName?: string | null
  customerPhone?: string | null
  customerEmail?: string | null
  deliveryAddress?: string | null
  total?: number
  paymentMethod?: string
}

export interface OrderStats {
  total: number
  pending: number
  preparing: number
  ready: number
  delivered: number
  cancelled: number
  todayTotal: number
  weekTotal: number
  monthTotal: number
}

export interface OrdersResponse {
  orders: Order[]
  total: number
  page: number
  limit: number
  orderStats: OrderStats
}

export interface StatusDropdownItem {
  label: string
  icon: string
  onSelect: () => void
}

export interface OrderStatusConfig {
  label: string
  color: 'warning' | 'info' | 'success' | 'neutral' | 'error'
  icon: string
  value: string
}

export interface PaymentMethodConfig {
  label: string
  icon: string
}

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
  printOrder: (orderId: string | number) => void
  duplicateOrder: (orderId: string | number) => Promise<void>
  refresh: () => Promise<void>
  createStatusDropdownItems: (onStatusSelect: (status: string) => void) => StatusDropdownItem[][]
}