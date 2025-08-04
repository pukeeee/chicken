<script setup>
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'admin'
})

// Реактивные состояния
const selectedOrder = ref(null)
const isModalOpen = ref(false)
const selectedStatus = ref('')
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(5)

// Получаем параметры из URL
const route = useRoute()
const router = useRouter()

// Инициализируем фильтры из URL
onMounted(() => {
  if (route.query.status) {
    selectedStatus.value = route.query.status
  }
  if (route.query.search) {
    searchQuery.value = route.query.search
  }
  if (route.query.page) {
    currentPage.value = parseInt(route.query.page)
  }
})

// Запрос данных с фильтрами
const { data: ordersData, pending: loading, error, refresh } = await useFetch('/api/admin/orders', {
  query: computed(() => ({
    status: selectedStatus.value || undefined,
    search: searchQuery.value || undefined,
    page: currentPage.value,
    limit: pageSize.value
  }))
})

// Если есть ошибка авторизации, перенаправляем на логин
// if (error.value?.statusCode === 401) {
//   await navigateTo('/admin/login')
// }

// Вычисляемые данные
const orders = computed(() => ordersData.value?.orders || [])
const totalOrders = computed(() => ordersData.value?.total || 0)
const totalPages = computed(() => Math.ceil(totalOrders.value / pageSize.value))

// Опции статусов
const statusOptions = [
  { label: 'Всі статуси', value: '' },
  { label: 'Очікує', value: 'pending' },
  { label: 'Готується', value: 'preparing' },
  { label: 'Готовий', value: 'ready' },
  { label: 'Доставлено', value: 'delivered' },
  { label: 'Скасовано', value: 'cancelled' }
]

// Конфигурация статусов
const statusConfig = {
  PENDING: { label: 'Очікує', color: 'warning', icon: 'i-lucide-clock' },
  PREPARING: { label: 'Готується', color: 'info', icon: 'i-lucide-chef-hat' },
  READY: { label: 'Готовий', color: 'success', icon: 'i-lucide-check-circle' },
  DELIVERED: { label: 'Доставлено', color: 'neutral', icon: 'i-lucide-truck' },
  CANCELLED: { label: 'Скасовано', color: 'error', icon: 'i-lucide-x-circle' }
}

const paymentConfig = {
  CASH: { label: 'Готівка', icon: 'i-lucide-banknote' },
  CARD: { label: 'Картка', icon: 'i-lucide-credit-card' },
  ONLINE: { label: 'Онлайн', icon: 'i-lucide-smartphone' }
}

// Методы
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'UAH'
  }).format(price)
}

// Обновление URL при изменении фильтров
const updateUrl = () => {
  const query = {}
  if (selectedStatus.value) query.status = selectedStatus.value
  if (searchQuery.value) query.search = searchQuery.value
  if (currentPage.value > 1) query.page = currentPage.value

  router.push({ query })
}

// Обработчики фильтров
const handleStatusChange = () => {
  currentPage.value = 1
  updateUrl()
}

const handleSearch = useDebounceFn(() => {
  currentPage.value = 1
  updateUrl()
}, 300)

const handlePageChange = (page) => {
  currentPage.value = page
  updateUrl()
}

// Действия с заказами
const handleUpdateStatus = async (orderId, newStatus) => {
  try {
    await $fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      body: { status: newStatus }
    })
    
    await refresh()
    
    const toast = useToast()
    toast.add({
      title: 'Статус оновлено',
      description: `Замовлення #${orderId} оновлено`,
      color: 'green'
    })
  } catch (err) {
    console.error('Error updating order status:', err)
    const toast = useToast()
    toast.add({
      title: 'Помилка',
      description: 'Не вдалося оновити статус замовлення',
      color: 'red'
    })
  }
}

const handleViewOrder = (order) => {
  selectedOrder.value = order
  isModalOpen.value = true
}

const handleCallCustomer = (phone) => {
  window.open(`tel:${phone}`)
}

const clearFilters = () => {
  selectedStatus.value = ''
  searchQuery.value = ''
  currentPage.value = 1
  router.push({ query: {} })
}

// Статистика заказов
const orderStats = computed(() => ordersData.value?.orderStats || null)

// Watchers для автоматического обновления
watch([selectedStatus, searchQuery], () => {
  handleSearch()
})

// Элементы для UDropdownMenu
const statusDropdownItems = computed(() => [
  [
    {
      label: 'Всі статуси',
      icon: 'i-lucide-filter',
      onSelect: () => {
        selectedStatus.value = ''
        handleStatusChange()
      }
    }
  ],
  [
    {
      label: 'Очікує',
      icon: 'i-lucide-clock',
      onSelect: () => {
        selectedStatus.value = 'pending'
        handleStatusChange()
      }
    },
    {
      label: 'Готується',
      icon: 'i-lucide-chef-hat',
      onSelect: () => {
        selectedStatus.value = 'preparing'
        handleStatusChange()
      }
    },
    {
      label: 'Готовий',
      icon: 'i-lucide-check-circle',
      onSelect: () => {
        selectedStatus.value = 'ready'
        handleStatusChange()
      }
    },
    {
      label: 'Доставлено',
      icon: 'i-lucide-truck',
      onSelect: () => {
        selectedStatus.value = 'delivered'
        handleStatusChange()
      }
    },
    {
      label: 'Скасовано',
      icon: 'i-lucide-x-circle',
      onSelect: () => {
        selectedStatus.value = 'cancelled'
        handleStatusChange()
      }
    }
  ]
])
</script>

<template>
  <div class="space-y-6">
    <!-- Заголовок страницы -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Керування замовленнями</h1>
        <p class="text-gray-600 mt-1">Переглядайте та керуйте всіма замовленнями</p>
      </div>
      <div class="flex items-center gap-3">
        <UButton 
          @click="refresh()" 
          icon="i-lucide-refresh-cw" 
          variant="outline"
          :loading="loading"
        >
          Оновити
        </UButton>
        <UButton 
          icon="i-lucide-download" 
          variant="outline"
          class="text-gray-600"
        >
          Експорт
        </UButton>
      </div>
    </div>

    <!-- Быстрая статистика -->
    <div v-if="orderStats" class="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div 
        v-for="(count, status) in orderStats" 
        :key="status"
        class="bg-white rounded-lg border border-gray-200 p-4 text-center"
      >
        <UIcon 
          :name="statusConfig[status]?.icon || 'i-lucide-circle'" 
          :class="`w-6 h-6 mx-auto mb-2 text-${statusConfig[status]?.color || 'gray'}-500`" 
        />
        <p class="text-2xl font-bold text-gray-900">{{ count }}</p>
        <p class="text-sm text-gray-500">{{ statusConfig[status]?.label || status }}</p>
      </div>
    </div>

    <!-- Фильтры и поиск -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- Поиск -->
        <div class="flex-1">
          <UInput
            v-model="searchQuery"
            placeholder="Пошук за номером замовлення, ім'ям клієнта або телефоном..."
            icon="i-lucide-search"
            size="lg"
          />
        </div>
        
        <!-- Фильтр по статусу с UDropdownMenu -->
        <div class="w-full sm:w-48">
          <UDropdownMenu 
            :items="statusDropdownItems"
            :ui="{ content: 'w-48 max-h-60 overflow-y-auto' }"
            :content="{ align: 'start' }"
          >
            <UButton
              :icon="selectedStatus && statusConfig[selectedStatus.toUpperCase()] 
                ? statusConfig[selectedStatus.toUpperCase()].icon 
                : 'i-lucide-filter'"
              :color="selectedStatus && statusConfig[selectedStatus.toUpperCase()]
                ? statusConfig[selectedStatus.toUpperCase()].color
                : 'gray'"
              variant="outline"
              size="lg"
              block
              trailing-icon="i-lucide-chevron-down"
            >
              {{ selectedStatus && statusConfig[selectedStatus.toUpperCase()]
                ? statusConfig[selectedStatus.toUpperCase()].label 
                : 'Всі статуси' }}
            </UButton>
          </UDropdownMenu>
        </div>
        
        <!-- Кнопка очистки фильтров -->
        <UButton 
          v-if="selectedStatus || searchQuery"
          @click="clearFilters"
          icon="i-lucide-x"
          variant="outline"
          size="lg"
        >
          Очистити
        </UButton>
      </div>
    </div>

    <!-- Основная таблица заказов -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <!-- Заголовок таблицы -->
      <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            Замовлення
            <span v-if="totalOrders" class="text-sm font-normal text-gray-500 ml-2">
              ({{ totalOrders }} {{ totalOrders === 1 ? 'замовлення' : 'замовленнь' }})
            </span>
          </h3>
        </div>
      </div>

      <!-- Состояние загрузки -->
      <div v-if="loading" class="p-8">
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
      <div v-else-if="!orders.length" class="p-12 text-center">
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

      <!-- Таблица заказов -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Заказ
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Клиент
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Товары
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Сумма
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Оплата
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr 
              v-for="order in orders" 
              :key="order.id" 
              class="hover:bg-gray-50 transition-colors"
            >
              <!-- Информация о заказе -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">#{{ order.id }}</div>
                  <div class="text-sm text-gray-500">{{ formatDate(order.createdAt) }}</div>
                </div>
              </td>

              <!-- Клиент -->
              <td class="px-6 py-4">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ order.customerName }}</div>
                  <div class="text-sm text-gray-500">{{ order.customerPhone }}</div>
                  <div v-if="order.deliveryAddress" class="text-xs text-gray-400 mt-1 max-w-xs truncate">
                    📍 {{ order.deliveryAddress }}
                  </div>
                </div>
              </td>

              <!-- Товары -->
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">
                  <div v-for="(item, index) in order.items.slice(0, 2)" :key="index" class="flex justify-between">
                    <span class="truncate mr-2">{{ item.product.name }}</span>
                    <span class="text-gray-500">x{{ item.quantity }}</span>
                  </div>
                  <div v-if="order.items.length > 2" class="text-xs text-gray-500 mt-1">
                    +{{ order.items.length - 2 }} еще
                  </div>
                </div>
              </td>

              <!-- Сумма -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-semibold text-gray-900">
                  {{ formatPrice(order.total) }}
                </div>
              </td>

              <!-- Статус -->
              <td class="px-6 py-4 whitespace-nowrap">
                <UDropdownMenu
                  :items="[[
                    { label: 'Очікує', click: () => handleUpdateStatus(order.id, 'PENDING'), disabled: order.status === 'PENDING' },
                    { label: 'Готується', click: () => handleUpdateStatus(order.id, 'PREPARING'), disabled: order.status === 'PREPARING' },
                    { label: 'Готовий', click: () => handleUpdateStatus(order.id, 'READY'), disabled: order.status === 'READY' },
                    { label: 'Доставлено', click: () => handleUpdateStatus(order.id, 'DELIVERED'), disabled: order.status === 'DELIVERED' },
                    { label: 'Скасовано', click: () => handleUpdateStatus(order.id, 'CANCELLED'), disabled: order.status === 'CANCELLED' }
                  ]]"
                >
                  <UBadge
                    :label="statusConfig[order.status].label"
                    :color="statusConfig[order.status].color"
                    variant="soft"
                    class="cursor-pointer"
                  >
                    <template #leading>
                      <UIcon :name="statusConfig[order.status].icon" class="w-3 h-3" />
                    </template>
                  </UBadge>
                </UDropdownMenu>
              </td>

              <!-- Оплата -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <UIcon :name="paymentConfig[order.paymentMethod].icon" class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-600">{{ paymentConfig[order.paymentMethod].label }}</span>
                </div>
              </td>

              <!-- Действия -->
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-2">
                  <UButton
                    @click="handleViewOrder(order)"
                    icon="i-lucide-eye"
                    variant="ghost"
                    size="sm"
                    class="text-gray-400 hover:text-blue-600"
                  />
                  <UButton
                    @click="handleCallCustomer(order.customerPhone)"
                    icon="i-lucide-phone"
                    variant="ghost"
                    size="sm"
                    class="text-gray-400 hover:text-green-600"
                  />
                  <UDropdownMenu
                    :items="[[
                      { label: 'Перегляд', icon: 'i-lucide-eye', click: () => handleViewOrder(order) },
                      { label: 'Друк', icon: 'i-lucide-printer', click: () => console.log('print', order.id) },
                      { label: 'Дублювати', icon: 'i-lucide-copy', click: () => console.log('duplicate', order.id) }
                    ], [
                      { label: 'Скасувати замовлення', icon: 'i-lucide-x-circle', click: () => handleUpdateStatus(order.id, 'CANCELLED'), disabled: order.status === 'CANCELLED' }
                    ]]"
                  >
                    <UButton
                      icon="i-lucide-more-horizontal"
                      variant="ghost"
                      size="sm"
                      class="text-gray-400 hover:text-gray-600"
                    />
                  </UDropdownMenu>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Пагинация -->
      <div v-if="totalPages > 1" class="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Показано 
            <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
            -
            <span class="font-medium">{{ Math.min(currentPage * pageSize, totalOrders) }}</span>
            з
            <span class="font-medium">{{ totalOrders }}</span>
            замовлень
          </div>
          
          <div class="flex items-center gap-2">
            <UButton
              @click="handlePageChange(currentPage - 1)"
              :disabled="currentPage <= 1"
              icon="i-lucide-chevron-left"
              variant="outline"
              size="sm"
            />
            
            <div class="flex gap-1">
              <UButton
                v-for="page in Math.min(5, totalPages)"
                :key="page"
                @click="handlePageChange(page)"
                :variant="page === currentPage ? 'solid' : 'ghost'"
                :class="page === currentPage ? 'bg-amber-500' : ''"
                size="sm"
              >
                {{ page }}
              </UButton>
            </div>
            
            <UButton
              @click="handlePageChange(currentPage + 1)"
              :disabled="currentPage >= totalPages"
              icon="i-lucide-chevron-right"
              variant="outline"
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно деталей заказа -->
    <OrderDetailsModal
      v-model:isOpen="isModalOpen"
      :order="selectedOrder"
      @update-status="handleUpdateStatus"
    />

    <!-- Ошибка загрузки -->
    <div v-if="error && error.statusCode !== 401" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <div class="flex items-center">
        <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-red-500 mr-3" />
        <div>
          <h3 class="text-sm font-medium text-red-800">Помилка завантаження замовлень</h3>
          <p class="text-sm text-red-600 mt-1">{{ error.message || 'Сталася помилка при завантаженні замовлень' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>