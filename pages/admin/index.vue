<script setup>

definePageMeta({
  layout: 'admin'
})

// Получаем данные для дашборда
const { data: dashboardData, pending: loading, error, refresh } = await useFetch('/api/admin/dashboard')

// Если есть ошибка авторизации, перенаправляем на логин
if (error.value?.statusCode === 401) {
  await navigateTo('/admin/login')
}

// Вычисляемые данные для графиков и статистики
const stats = computed(() => {
  if (!dashboardData.value) return null
  return {
    totalOrders: dashboardData.value.orders?.total || 0,
    pendingOrders: dashboardData.value.orders?.pending || 0,
    completedOrders: dashboardData.value.orders?.delivered || 0,
    totalRevenue: dashboardData.value.sales?.total || 0,
    todayOrders: dashboardData.value.orders?.today || 0,
    todayRevenue: dashboardData.value.sales?.today || 0
  }
})

const recentOrders = computed(() => {
  return dashboardData.value?.recentOrders || []
})

const popularItems = computed(() => {
  return dashboardData.value?.popularItems || []
})

const salesData = computed(() => {
  return dashboardData.value?.hourlyStats || []
})

// Форматирование цены
const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'UAH'
  }).format(price)
}

// Функция для получения цвета статуса
const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    preparing: 'info',
    ready: 'success',
    delivered: 'neutral',
    cancelled: 'error'
  }
  return colors[status] || 'neutral'
}

// Функция для получения процента изменения
const getChangePercent = (current, previous) => {
  if (!previous) return 0
  return Math.round(((current - previous) / previous) * 100)
}

// Рефреш данных
const refreshData = async () => {
  await refresh()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Заголовок дашборда -->
    <!-- <div class="flex items-center justify-between">
      <UButton 
        @click="refreshData" 
        icon="i-lucide-refresh-cw" 
        variant="outline"
        :loading="loading"
      >
        Обновить
      </UButton>
    </div> -->

    <!-- Основные метрики -->
    <div v-if="!loading && stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Сегодняшние заказы -->
      <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-100 text-sm font-medium">Замовлення сьогодні</p>
            <p class="text-3xl font-bold mt-2">{{ stats.todayOrders }}</p>
            <div class="flex items-center mt-2">
              <UIcon name="i-lucide-trending-up" class="w-4 h-4 mr-1" />
              <span class="text-sm">+12% от вчора</span>
            </div>
          </div>
          <div class="w-12 h-12 bg-blue-400 bg-opacity-30 rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-shopping-bag" class="w-6 h-6" />
          </div>
        </div>
      </div>

      <!-- Общая выручка -->
      <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-green-100 text-sm font-medium">Виручка сьогодні</p>
            <p class="text-3xl font-bold mt-2">{{ formatPrice(stats.todayRevenue) }}</p>
            <div class="flex items-center mt-2">
              <UIcon name="i-lucide-trending-up" class="w-4 h-4 mr-1" />
              <span class="text-sm">+8% від минулого тижня</span>
            </div>
          </div>
          <div class="w-12 h-12 bg-green-400 bg-opacity-30 rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-dollar-sign" class="w-6 h-6" />
          </div>
        </div>
      </div>

      <!-- Активные заказы -->
      <div class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-orange-100 text-sm font-medium">Активні замовлення</p>
            <p class="text-3xl font-bold mt-2">{{ stats.pendingOrders }}</p>
            <div class="flex items-center mt-2">
              <UIcon name="i-lucide-clock" class="w-4 h-4 mr-1" />
              <span class="text-sm">Потребують уваги</span>
            </div>
          </div>
          <div class="w-12 h-12 bg-orange-400 bg-opacity-30 rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-alert-circle" class="w-6 h-6" />
          </div>
        </div>
      </div>

      <!-- Выполненные заказы -->
      <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-purple-100 text-sm font-medium">Виконано</p>
            <p class="text-3xl font-bold mt-2">{{ stats.completedOrders }}</p>
            <div class="flex items-center mt-2">
              <UIcon name="i-lucide-check-circle" class="w-4 h-4 mr-1" />
              <span class="text-sm">За весь час</span>
            </div>
          </div>
          <div class="w-12 h-12 bg-purple-400 bg-opacity-30 rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-trophy" class="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>

    <!-- Состояние загрузки -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="i in 4" :key="i" class="bg-white rounded-xl p-6 animate-pulse">
        <div class="flex items-center justify-between">
          <div class="space-y-3">
            <div class="h-4 bg-gray-200 rounded w-24"></div>
            <div class="h-8 bg-gray-200 rounded w-16"></div>
            <div class="h-4 bg-gray-200 rounded w-20"></div>
          </div>
          <div class="w-12 h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>

    <!-- Контент в две колонки -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Последние заказы -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Останні замовлення</h3>
          <UButton to="/admin/orders" variant="ghost" size="sm" icon="i-lucide-arrow-right">
            Всі замовлення
          </UButton>
        </div>

        <div v-if="loading" class="space-y-4">
          <div v-for="i in 5" :key="i" class="flex items-center space-x-3 animate-pulse">
            <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div class="w-16 h-6 bg-gray-200 rounded"></div>
          </div>
        </div>

        <div v-else-if="recentOrders.length" class="space-y-4">
          <div 
            v-for="order in recentOrders.slice(0, 5)" 
            :key="order.id"
            class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <UIcon name="i-lucide-shopping-bag" class="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p class="font-medium text-gray-900">#{{ order.id }}</p>
                <p class="text-sm text-gray-500">{{ order.customerName }}</p>
              </div>
            </div>
            <div class="text-right">
              <UBadge :color="getStatusColor(order.status)" variant="soft" size="sm">
                {{ order.status === 'pending' ? 'Очікує' : 
                   order.status === 'preparing' ? 'Готується' : 
                   order.status === 'ready' ? 'ГоГотовийтов' : 
                   order.status === 'delivered' ? 'Доставлено' : 'ОтмСкасованоенен' }}
              </UBadge>
              <p class="text-sm font-medium text-gray-900 mt-1">{{ formatPrice(order.total) }}</p>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8">
          <UIcon name="i-lucide-package" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p class="text-gray-500">Замовлень поки немає</p>
        </div>
      </div>

      <!-- Популярные блюда -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Популярні страви</h3>
          <UButton to="/admin/menu" variant="ghost" size="sm" icon="i-lucide-arrow-right">
            Меню
          </UButton>
        </div>

        <div v-if="loading" class="space-y-4">
          <div v-for="i in 5" :key="i" class="flex items-center space-x-3 animate-pulse">
            <div class="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div class="w-12 h-6 bg-gray-200 rounded"></div>
          </div>
        </div>

        <div v-else-if="popularItems.length" class="space-y-4">
          <div 
            v-for="(item, index) in popularItems.slice(0, 5)" 
            :key="item.name"
            class="flex items-center space-x-3"
          >
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <span class="font-bold text-amber-600">#{{ index + 1 }}</span>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 truncate">{{ item.name }}</p>
              <p class="text-sm text-gray-500">{{ item.orders }} замовленнь</p>
            </div>
            <div class="text-right">
              <p class="font-medium text-gray-900">{{ formatPrice(item.revenue) }}</p>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8">
          <UIcon name="i-lucide-utensils" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p class="text-gray-500">Статистика поки що недоступна</p>
        </div>
      </div>
    </div>

    <!-- Быстрые действия -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Швидкі дії</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <UButton 
          to="/admin/orders?status=pending" 
          class="bg-orange-500 hover:bg-orange-600 justify-start" 
          icon="i-lucide-clock"
          block
        >
          Нові замовлення ({{ stats?.pendingOrders || 0 }})
        </UButton>
        <UButton 
          to="/admin/menu/create" 
          class="bg-green-500 hover:bg-green-600 justify-start" 
          icon="i-lucide-plus-circle"
          block
        >
          Додати страву
        </UButton>
        <UButton 
          to="/admin/analytics" 
          variant="outline" 
          class="border-gray-300 text-gray-600 hover:bg-gray-50 justify-start" 
          icon="i-lucide-bar-chart-3"
          block
        >
          Аналітика
        </UButton>
        <UButton 
          to="/admin/customers" 
          variant="outline" 
          class="border-gray-300 text-gray-600 hover:bg-gray-50 justify-start" 
          icon="i-lucide-users"
          block
        >
          Кліенти
        </UButton>
      </div>
    </div>

    <!-- Ошибка загрузки -->
    <div v-if="error && error.statusCode !== 401" class="bg-red-50 border border-red-200 rounded-xl p-6">
      <div class="flex items-center">
        <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-red-500 mr-3" />
        <div>
          <h3 class="text-sm font-medium text-red-800">Помилка завантаження даних</h3>
          <p class="text-sm text-red-600 mt-1">{{ error.message || 'Не вдалося завантажити дані дашборда' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>