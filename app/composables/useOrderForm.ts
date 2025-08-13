import type { Order, OrderUpdateData } from '~/app/types/order'
import { createStatusOptions, createPaymentOptions } from '~/app/utils/orderHelper'
import { validateOrderForm, normalizePhone } from '~/app/utils/orderValidation'

export interface UseOrderFormReturn {
  formData: Ref<OrderUpdateData & { status: string, paymentMethod: string }>
  statusOptions: ComputedRef<any[]>
  paymentOptions: ComputedRef<any[]>
  isFormValid: ComputedRef<boolean>
  errors: ComputedRef<Record<string, string>>
  initializeForm: (order: Order) => void
  resetForm: () => void
  getChangedData: (originalOrder: Order) => OrderUpdateData
  normalizeFormData: () => void
}

export const useOrderForm = (): UseOrderFormReturn => {
  // Форма данных
  const formData = ref<OrderUpdateData & { 
    status: string, 
    paymentMethod: string 
  }>({
    status: 'PENDING',
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    total: 0,
    paymentMethod: 'CASH'
  })

  // Опции для селектов
  const statusOptions = computed(() => createStatusOptions())
  const paymentOptions = computed(() => createPaymentOptions())

  // Валидация формы
  const validation = computed(() => validateOrderForm(formData.value))
  const isFormValid = computed(() => validation.value.isValid)
  const errors = computed(() => validation.value.errors)

  // Инициализация формы
  const initializeForm = (order: Order): void => {
    if (order) {
      formData.value = {
        status: order.status || 'PENDING',
        customerName: order.customerName || '',
        customerPhone: order.customerPhone || '',
        deliveryAddress: order.deliveryAddress || '',
        total: order.total,
        paymentMethod: order.paymentMethod || 'CASH'
      }
    }
  }

  // Сброс формы
  const resetForm = (): void => {
    formData.value = {
      status: 'PENDING',
      customerName: '',
      customerPhone: '',
      deliveryAddress: '',
      total: 0,
      paymentMethod: 'CASH'
    }
  }

  // Нормализация данных формы
  const normalizeFormData = (): void => {
    if (formData.value.customerPhone) {
      formData.value.customerPhone = normalizePhone(formData.value.customerPhone)
    }
    
    // Обрезаем лишние пробелы
    if (formData.value.customerName) {
      formData.value.customerName = formData.value.customerName.trim()
    }
    
    if (formData.value.deliveryAddress) {
      formData.value.deliveryAddress = formData.value.deliveryAddress.trim()
    }
  }

  // Получение только измененных данных
  const getChangedData = (originalOrder: Order): OrderUpdateData => {
    const updateData: OrderUpdateData = {}
    
    if (formData.value.status !== originalOrder.status) {
      updateData.status = formData.value.status
    }
    
    if (formData.value.customerName !== (originalOrder.customerName || '')) {
      updateData.customerName = formData.value.customerName
    }
    
    if (formData.value.customerPhone !== (originalOrder.customerPhone || '')) {
      updateData.customerPhone = formData.value.customerPhone
    }
    
    if (formData.value.deliveryAddress !== (originalOrder.deliveryAddress || '')) {
      updateData.deliveryAddress = formData.value.deliveryAddress
    }
    
    if (formData.value.total !== originalOrder.total) {
      updateData.total = formData.value.total
    }
    
    if (formData.value.paymentMethod !== originalOrder.paymentMethod) {
      updateData.paymentMethod = formData.value.paymentMethod
    }

    return updateData
  }

  return {
    formData,
    statusOptions,
    paymentOptions,
    isFormValid,
    errors,
    initializeForm,
    resetForm,
    getChangedData,
    normalizeFormData
  }
}