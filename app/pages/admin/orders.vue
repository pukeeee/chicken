<script setup>
import { ORDER_STATUS_CONFIG, PAYMENT_METHOD_CONFIG } from '~~/shared/constants/orderConstants'
import { useOrders } from '~/composables/useOrders'

definePageMeta({
  layout: 'admin'
})

// Используем композабл для работы с заказами
const {
  selectedStatus,
  searchQuery,
  currentPage,
  pageSize,
  orders,
  totalOrders,
  totalPages,
  orderStats,
  loading,
  error,
  initializeFromUrl,
  handleStatusChange,
  handlePageChange,
  clearFilters,
  updateOrder,
  callCustomer,
  printOrder,
  duplicateOrder,
  refresh,
  createStatusDropdownItems
} = useOrders()

// Состояния модального окна
const selectedOrder = ref(null)
const isModalOpen = ref(false)
const isUpdateModalOpen = ref(false)

// Инициализируем фильтры из URL
onMounted(() => {
  initializeFromUrl()
})

// Создаем элементы дропдауна статусов
const statusDropdownItems = computed(() => 
  createStatusDropdownItems((status) => {
    selectedStatus.value = status
    handleStatusChange()
  })
)

// Обработчики для модального окна и действий
const handleViewOrder = (order) => {
  selectedOrder.value = order
  isModalOpen.value = true
}

const handleUpdateOrderModal = (order) => {
  selectedOrder.value = order
  isUpdateModalOpen.value = true
}

const handleUpdateOrder = async (orderId, updateData) => {
  await updateOrder(orderId, updateData)
}

const handleCallCustomer = (phone) => {
  callCustomer(phone)
}

const handlePrintOrder = (orderId) => {
  printOrder(orderId)
}

const handleDuplicateOrder = (orderId) => {
  duplicateOrder(orderId)
}

// Экспортируем конфигурации для использования в шаблоне
const statusConfig = ORDER_STATUS_CONFIG
const paymentConfig = PAYMENT_METHOD_CONFIG
</script>

<template>
  <div class="space-y-6">
    <!-- Заголовок страницы -->
    <AdminOrdersPageHeader
      :loading="loading"
      @refresh="refresh"
      @export="$emit('export')"
    />

    <!-- Быстрая статистика -->
    <AdminOrdersStatsGrid
      :order-stats="orderStats"
      :status-config="statusConfig"
    />

    <!-- Фильтры и поиск -->
    <AdminOrdersFilters
      v-model:search-query="searchQuery"
      :selected-status="selectedStatus"
      :status-config="statusConfig"
      :status-dropdown-items="statusDropdownItems"
      @clear-filters="clearFilters"
    />

    <!-- Состояние загрузки -->
    <div v-if="loading" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div class="space-y-4">
        <div v-for="i in 5" :key="i" class="animate-pulse">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-4 bg-gray-200 rounded"></div>
            <div class="w-32 h-4 bg-gray-200 rounded"></div>
            <div class="w-48 h-4 bg-gray-200 rounded"></div>
            <div class="w-24 h-4 bg-gray-200 rounded"></div>
            <div class="w-20 h-6 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Пустое состояние -->
    <div v-else-if="orders.length === 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
      <UIcon name="i-lucide-package-x" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        {{ searchQuery || selectedStatus ? 'Замовлення не знайдені' : 'Замовлень поки немає' }}
      </h3>
      <p class="text-gray-500 mb-6">
        {{ searchQuery || selectedStatus 
          ? 'Спробуйте змінити параметри пошуку або фільтру' 
          : 'Як тільки з\'являться нові замовлення, вони відобразяться тут' 
        }}
      </p>
      <UButton 
        v-if="searchQuery || selectedStatus"
        @click="clearFilters"
        variant="outline"
      >
        Очистити фільтри
      </UButton>
    </div>

    <!-- Основная таблица заказов -->
    <AdminOrdersTable
      v-else
      :orders="orders"
      :total-orders="totalOrders"
      :loading="false"
      :search-query="searchQuery"
      :selected-status="selectedStatus"
      :status-config="statusConfig"
      :payment-config="paymentConfig"
      @update-order="handleUpdateOrder"
      @update-order-modal="handleUpdateOrderModal"
      @view-order="handleViewOrder"
      @call-customer="handleCallCustomer"
      @print-order="handlePrintOrder"
      @duplicate-order="handleDuplicateOrder"
      @clear-filters="clearFilters"
    />

    <!-- Модальное окно редактирования -->
    <AdminOrdersUpdateModal 
      v-if="selectedOrder"
      v-model="isUpdateModalOpen"
      :order="selectedOrder"
      @save="handleUpdateOrder"
    />

    <!-- Пагинация -->
    <AdminOrdersPagination
      v-if="!loading && orders.length > 0 && totalPages > 1"
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-orders="totalOrders"
      :page-size="pageSize"
      @page-change="handlePageChange"
    />

    <!-- Ошибка загрузки -->
    <AdminOrdersErrorAlert :error="error" />
  </div>
</template>