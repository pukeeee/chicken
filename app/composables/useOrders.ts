// composables/useOrders.ts
import { useDebounceFn } from '@vueuse/core'
import { ORDER_STATUS_CONFIG } from '~~/shared/constants/orderConstants'
import type { 
    Order, 
    OrderStats, 
    OrdersResponse, 
    StatusDropdownItem, 
    OrderStatusConfig,
    UseOrdersReturn, 
    OrderUpdateData
} from '~~/shared/types/order'

export const useOrders = (): UseOrdersReturn => {
    // Реактивные состояния
    const selectedStatus: Ref<string> = ref('')
    const searchQuery: Ref<string> = ref('')
    const currentPage: Ref<number> = ref(1)
    const pageSize: Ref<number> = ref(5)
    
    const route = useRoute()
    const router = useRouter()
    
    // Инициализация из URL
    const initializeFromUrl = (): void => {
        if (route.query.status && typeof route.query.status === 'string') {
        selectedStatus.value = route.query.status
        }
        if (route.query.search && typeof route.query.search === 'string') {
        searchQuery.value = route.query.search
        }
        if (route.query.page && typeof route.query.page === 'string') {
        currentPage.value = parseInt(route.query.page)
        }
    }
    
    // Обновление URL
    const updateUrl = (): void => {
        const query: Record<string, string | number> = {}
        if (selectedStatus.value) query.status = selectedStatus.value
        if (searchQuery.value) query.search = searchQuery.value
        if (currentPage.value > 1) query.page = currentPage.value
        router.push({ query })
    }
    
    // Обработчики
    const handleStatusChange = (): void => {
        currentPage.value = 1
        updateUrl()
    }
    
    const handleSearch = useDebounceFn((): void => {
        currentPage.value = 1
        updateUrl()
    }, 300)
    
    const handlePageChange = (page: number): void => {
        currentPage.value = page
        updateUrl()
    }
    
    const clearFilters = (): void => {
        selectedStatus.value = ''
        searchQuery.value = ''
        currentPage.value = 1
        router.push({ query: {} })
    }
    
    // Запрос данных
    const { data: ordersData, pending: loading, error, refresh } = useFetch<OrdersResponse>('/api/admin/orders', {
        deep: true,
        query: computed(() => ({
        status: selectedStatus.value || undefined,
        search: searchQuery.value || undefined,
        page: currentPage.value,
        limit: pageSize.value
        }))
    })
    
    // Вычисляемые свойства
    const orders: ComputedRef<Order[]> = computed(() => ordersData.value?.orders || [])
    const totalOrders: ComputedRef<number> = computed(() => ordersData.value?.total || 0)
    const totalPages: ComputedRef<number> = computed(() => Math.ceil(totalOrders.value / pageSize.value))
    const orderStats: ComputedRef<OrderStats | null> = computed(() => ordersData.value?.orderStats || null)
    
    // Создаем элементы для дропдауна статусов
    const createStatusDropdownItems = (onStatusSelect: (status: string) => void): StatusDropdownItem[][] => [
        [
            {
                label: 'Всі статуси',
                icon: 'i-lucide-filter',
                onSelect: () => onStatusSelect('')
            }
        ],
        [
            ...Object.values(ORDER_STATUS_CONFIG as Record<string, OrderStatusConfig>).map((status: OrderStatusConfig) => ({
                label: status.label,
                icon: status.icon,
                onSelect: () => onStatusSelect(status.value)
            }))
        ]
    ]
    
    // Действия с заказами
    const updateOrder = async (orderId: string | number, updateData: OrderUpdateData): Promise<void> => {
        try {
            await $fetch<any>(`/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                body: updateData
            })
        
            await refresh()
            
            const toast = useToast()
            toast.add({
                title: 'Замовлення оновлено',
                description: `Замовлення #${orderId} оновлено`,
                color: 'success'
            })
        } 
        catch (err) {
            console.error('Error updating order:', err)
            const toast = useToast()
            toast.add({
                title: 'Помилка',
                description: 'Не вдалося оновити замовлення',
                color: 'error'
            })
        }
    }
    
    const callCustomer = (phone: string): void => {
        window.open(`tel:${phone}`)
    }
  
    // Watchers
    watch([selectedStatus, searchQuery], () => {
        handleSearch()
    })

    // Add new methods for printing and duplicating orders
    const printOrder = async (orderId: string | number): Promise<void> => {
        try {
            // Implementation for printing order
            // This could open a print-friendly page or generate a PDF
            window.open(`/api/admin/orders/${orderId}/print`, '_blank')
        } catch (err) {
            console.error('Error printing order:', err)
            const toast = useToast()
            toast.add({
                title: 'Помилка',
                description: 'Не вдалося роздрукувати замовлення',
                color: 'error'
            })
        }
    }

    const duplicateOrder = async (orderId: string | number): Promise<void> => {
        try {
            await $fetch<any>(`/api/admin/orders/${orderId}/duplicate`, {
                method: 'POST'
            })
            
            await refresh()
            
            const toast = useToast()
            toast.add({
                title: 'Замовлення продубльовано',
                description: `Замовлення #${orderId} успішно продубльовано`,
                color: 'success'
            })
        } catch (err) {
            console.error('Error duplicating order:', err)
            const toast = useToast()
            toast.add({
                title: 'Помилка',
                description: 'Не вдалося продублювати замовлення',
                color: 'error'
            })
        }
    }

    return {
        // Состояния
        selectedStatus,
        searchQuery,
        currentPage,
        pageSize,
        
        // Данные
        orders,
        totalOrders,
        totalPages,
        orderStats,
        loading,
        error,
        
        // Методы
        initializeFromUrl,
        handleStatusChange,
        handlePageChange,
        clearFilters,
        updateOrder,
        callCustomer,
        refresh,
        createStatusDropdownItems,
        printOrder,
        duplicateOrder
    }
}