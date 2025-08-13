<script setup lang="ts">
import { formatDate } from '~/app/utils/formatters'
import { ORDER_STATUS_CONFIG, OrderStatus } from '~/app/constants/orderConstants'
import type { Order } from '~/app/types/order'
import authUser from '~/app/middleware/auth.user'

// Защищаем страницу middleware
definePageMeta({
  middleware: authUser
})

// Получаем данные пользователя из композабла
const { user, logout } = useAuth()

// Моковые данные заказов (в будущем будут загружаться с сервера)
const orders = ref<Order[]>([
  // Пока пустой массив, в будущем здесь будут реальные заказы
])

const isLoading = ref(false)

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
          <!-- Если заказов нет -->
          <div v-if="orders.length === 0 && !isLoading" class="bg-white rounded-lg shadow p-8 text-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UIcon name="i-lucide-shopping-bag" class="w-8 h-8 text-gray-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
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

          <!-- Список заказов (когда они будут) -->
          <div v-else class="space-y-6">
            <div 
              v-for="order in orders" 
              :key="order.id"
              class="bg-white rounded-lg shadow overflow-hidden"
            >
              <!-- Заголовок заказа -->
              <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">
                    Замовлення #{{ order.id }}
                  </h3>
                  <p class="text-sm text-gray-500">
                    {{ formatDate(order.createdAt) }}
                  </p>
                </div>
                <UBadge 
                  :color="getStatusConfig(order.status).color"
                  variant="soft"
                  size="lg"
                >
                  {{ getStatusConfig(order.status).label }}
                </UBadge>
              </div>

              <!-- Содержимое заказа -->
              <div class="px-6 py-4">
                <div class="space-y-3">
                  <div 
                    v-for="item in order.items" 
                    :key="item.id"
                    class="flex items-center justify-between"
                  >
                    <div class="flex items-center space-x-3">
                      <img 
                        :src="item.image || '/images/placeholder-food.jpg'" 
                        :alt="item.product.name"
                        class="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p class="font-medium text-gray-900">{{ item.product.name }}</p>
                        <p class="text-sm text-gray-500">Кількість: {{ item.quantity }}</p>
                      </div>
                    </div>
                    <p class="font-semibold text-gray-900">
                      {{ item.price * item.quantity }} ₴
                    </p>
                  </div>
                </div>

                <!-- Итого -->
                <div class="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span class="text-lg font-semibold text-gray-900">Загалом:</span>
                  <span class="text-xl font-bold text-amber-600">{{ order.total }} ₴</span>
                </div>

                <!-- Адрес доставки -->
                <div v-if="order.deliveryAddress" class="mt-4 pt-4 border-t border-gray-200">
                  <p class="text-sm font-medium text-gray-700 mb-1">Адреса доставки:</p>
                  <p class="text-gray-900">{{ order.deliveryAddress }}</p>
                </div>
              </div>

              <!-- Действия -->
              <div class="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                <UButton 
                  variant="outline" 
                  size="sm"
                  icon="i-lucide-repeat"
                >
                  Повторити замовлення
                </UButton>
                <UButton 
                  variant="outline" 
                  size="sm"
                  icon="i-lucide-phone"
                >
                  Зв'язатися з рестораном
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
