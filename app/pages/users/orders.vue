<script setup lang="ts">
import { formatDate } from '~/utils/formatters'
import { ORDER_STATUS_CONFIG, OrderStatus } from '~~/shared/constants/orderConstants'
import authUser from '~/middleware/auth.user'

// Защищаем страницу middleware
definePageMeta({
  middleware: authUser
})

// Получаем данные пользователя из композабла
const { user, logout } = useAuth()

// Используем новый композабл для получения заказов
const { orders, isLoading, error, fetchOrders } = useUserOrders()

// Загружаем заказы при монтировании компонента
onMounted(() => {
  fetchOrders()
})

// Выход из системы
const handleLogout = async () => {
  await logout()
}

// Получение конфигурации статуса заказа
const getStatusConfig = (status: string) => {
  // Преобразуем строковый статус в enum
  const statusKey = status.toUpperCase() as keyof typeof OrderStatus
  const orderStatus = OrderStatus[statusKey]
  return ORDER_STATUS_CONFIG[orderStatus] || {
    label: 'Невідомий статус',
    color: 'gray' as const,
    icon: 'i-lucide-help-circle',
    value: 'unknown'
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Хлебные крошки -->
    <div class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center space-x-2 py-4 text-sm">
          <NuxtLink to="/" class="text-amber-600 hover:text-amber-700">
            Головна
          </NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="w-4 h-4 text-gray-400" />
          <NuxtLink to="/users/" class="text-amber-600 hover:text-amber-700">
            Особистий кабінет
          </NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="w-4 h-4 text-gray-400" />
          <span class="text-gray-500">Мої замовлення</span>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Заголовок страницы -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Мої замовлення</h1>
        <p class="mt-2 text-gray-600">Переглядайте історію ваших замовлень</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Боковая панель навигации -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center space-x-3 mb-6">
              <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <UIcon name="i-lucide-user" class="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">
                  {{ user?.name || 'Користувач' }}
                </h3>
                <p class="text-sm text-gray-500">{{ user?.phone }}</p>
              </div>
            </div>

            <nav class="space-y-2">
              <NuxtLink 
                to="/users/" 
                class="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <UIcon name="i-lucide-user" class="w-5 h-5" />
                <span>Профіль</span>
              </NuxtLink>
              
              <NuxtLink 
                to="/users/orders" 
                class="flex items-center space-x-3 px-3 py-2 rounded-md bg-amber-50 text-amber-700 font-medium"
              >
                <UIcon name="i-lucide-shopping-bag" class="w-5 h-5" />
                <span>Мої замовлення</span>
              </NuxtLink>
              
              <button 
                @click="handleLogout"
                class="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors"
              >
                <UIcon name="i-lucide-log-out" class="w-5 h-5" />
                <span>Вийти</span>
              </button>
            </nav>
          </div>
        </div>

        <!-- Основной контент -->
        <div class="lg:col-span-2">
          <!-- Индикатор загрузки -->
          <div v-if="isLoading" class="text-center py-10">
            <UIcon name="i-lucide-loader" class="animate-spin text-4xl text-amber-500" />
            <p class="mt-2 text-gray-600">Завантаження замовлень...</p>
          </div>

          <!-- Сообщение об ошибке -->
          <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p class="font-bold">Помилка завантаження</p>
            <p>Не вдалося завантажити ваші замовлення. Спробуйте оновити сторінку.</p>
          </div>

          <!-- Если заказов нет -->
          <div v-else-if="orders.length === 0" class="bg-white rounded-lg shadow p-8 text-center">
            <div class="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <UIcon name="i-lucide-shopping-bag" class="w-10 h-10 text-gray-400" />
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">
              У вас поки немає замовлень
            </h3>
            <p class="text-gray-600 mb-6">
              Зробіть своє перше замовлення та воно з'явиться тут
            </p>
            <UButton 
              to="/" 
              color="neutral"
              size="lg"
              icon="i-lucide-utensils"
            >
              Переглянути меню
            </UButton>
          </div>

          <!-- Список заказов -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div 
              v-for="order in orders" 
              :key="order.id"
              class="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-lg"
            >
              <!-- Заголовок заказа -->
              <div class="p-4 border-b border-gray-50">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="font-semibold text-gray-900 text-sm">
                    Замовлення #{{ order.id }}
                  </h3>
                  <UBadge 
                    :color="getStatusConfig(order.status).color"
                    variant="soft"
                    size="sm"
                  >
                    {{ getStatusConfig(order.status).label }}
                  </UBadge>
                </div>
                <p class="text-xs text-gray-500">
                  {{ formatDate(order.createdAt) }}
                </p>
              </div>

              <!-- Содержимое заказа -->
              <div class="p-4">
                <!-- Товары -->
                <div class="space-y-2 mb-4">
                  <div 
                    v-for="item in order.items" 
                    :key="item.id"
                    class="flex items-center justify-between text-sm"
                  >
                    <div class="flex items-center space-x-2 flex-1 min-w-0">
                      <!-- <img 
                        :src="item.image || '/images/placeholder-food.jpg'" 
                        :alt="item.product.name"
                        class="w-8 h-8 rounded-md object-cover flex-shrink-0"
                      /> -->
                      <div class="min-w-0 flex-1">
                        <p class="font-medium text-gray-900 truncate">{{ item.product.name }}</p>
                        <p class="text-xs text-gray-500">× {{ item.quantity }}</p>
                      </div>
                    </div>
                    <p class="font-semibold text-gray-900 text-sm ml-2">
                      {{ item.price * item.quantity }} ₴
                    </p>
                  </div>
                </div>

                <!-- Итого -->
                <div class="flex justify-between items-center pt-3 border-t border-gray-50 mb-4">
                  <span class="font-semibold text-gray-900">Загалом:</span>
                  <span class="text-lg font-bold text-amber-600">{{ order.total }} ₴</span>
                </div>

                <!-- Адрес доставки -->
                <div v-if="order.deliveryAddress" class="mb-4">
                  <p class="text-xs font-medium text-gray-700 mb-1">Адреса:</p>
                  <p class="text-xs text-gray-600 line-clamp-2">{{ order.deliveryAddress }}</p>
                </div>

                <!-- Действия -->
                <div class="flex space-x-2">
                  <UButton 
                    variant="outline" 
                    size="xs"
                    icon="i-lucide-repeat"
                    class="flex-1"
                  >
                    Повторити
                  </UButton>
                  <UButton 
                    variant="outline" 
                    size="xs"
                    icon="i-lucide-phone"
                    class="flex-1"
                  >
                    Зв'язок
                  </UButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
