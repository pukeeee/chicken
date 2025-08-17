import { ref, readonly } from 'vue'
import type { Order } from '~~/shared/types/order'

export function useUserOrders() {
  const orders = ref<Order[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const fetchOrders = async () => {
    if (isLoading.value) return

    isLoading.value = true
    error.value = null

    try {
      const data = await $fetch<Order[]>('/api/users/orders', {
        headers: useRequestHeaders(['cookie'])
      })
      orders.value = data
    } catch (e: any) {
      console.error('Failed to fetch user orders:', e)
      error.value = e
    } finally {
      isLoading.value = false
    }
  }

  return {
    orders: readonly(orders),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchOrders
  }
}