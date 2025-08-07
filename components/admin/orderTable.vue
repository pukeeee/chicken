<script setup lang="ts">
interface Order {
  id: string
  customerName: string
  customerPhone: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  createdAt: string
  deliveryAddress?: string
  paymentMethod: 'cash' | 'card' | 'online'
}

defineProps<{
  orders: Order[]
  loading?: boolean
}>()

const emit = defineEmits<{
  'update-status': [orderId: string, status: Order['status']]
  'view-order': [order: Order]
}>()

const statusConfig: Record<Order['status'], { label: string; color: 'warning' | 'info' | 'success' | 'neutral' | 'error'; icon: string }> = {
  pending: { label: 'Ожидает', color: 'warning', icon: 'i-lucide-clock' },
  preparing: { label: 'Готовится', color: 'info', icon: 'i-lucide-chef-hat' },
  ready: { label: 'Готов', color: 'success', icon: 'i-lucide-check-circle' },
  delivered: { label: 'Доставлен', color: 'neutral', icon: 'i-lucide-truck' },
  cancelled: { label: 'Отменен', color: 'error', icon: 'i-lucide-x-circle' }
}

const paymentConfig = {
  cash: { label: 'Наличные', icon: 'i-lucide-banknote' },
  card: { label: 'Карта', icon: 'i-lucide-credit-card' },
  online: { label: 'Онлайн', icon: 'i-lucide-smartphone' }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'UAH'
  }).format(price)
}

const getStatusOptions = (currentStatus: Order['status']) => {
  const statuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'] as const
  return statuses.map(status => ({
    label: statusConfig[status].label,
    value: status,
    disabled: status === currentStatus
  }))
}

const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
  emit('update-status', orderId, newStatus)
}

const viewOrderDetails = (order: Order) => {
  emit('view-order', order)
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">Заказы</h2>
          <p class="text-sm text-gray-500">Управление заказами клиентов</p>
        </div>
        <div class="flex items-center gap-2">
          <UButton
            icon="i-lucide-filter"
            variant="outline"
            size="sm"
            class="text-gray-600"
          >
            Фильтр
          </UButton>
          <UButton
            icon="i-lucide-download"
            variant="outline"
            size="sm"
            class="text-gray-600"
          >
            Экспорт
          </UButton>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="p-8 text-center">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
      <p class="text-gray-500">Загрузка заказов...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="!orders.length" class="p-8 text-center">
      <UIcon name="i-lucide-package-x" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">Заказов пока нет</h3>
      <p class="text-gray-500">Как только появятся новые заказы, они отобразятся здесь</p>
    </div>

    <!-- Orders table -->
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
          <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50">
            <!-- Order info -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div>
                <div class="text-sm font-medium text-gray-900">#{{ order.id }}</div>
                <div class="text-sm text-gray-500">{{ formatDate(order.createdAt) }}</div>
              </div>
            </td>

            <!-- Customer -->
            <td class="px-6 py-4">
              <div>
                <div class="text-sm font-medium text-gray-900">{{ order.customerName }}</div>
                <div class="text-sm text-gray-500">{{ order.customerPhone }}</div>
                <div v-if="order.deliveryAddress" class="text-xs text-gray-400 mt-1 max-w-xs truncate">
                  {{ order.deliveryAddress }}
                </div>
              </div>
            </td>

            <!-- Items -->
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900">
                <div v-for="(item, index) in order.items.slice(0, 2)" :key="index" class="flex justify-between">
                  <span>{{ item.name }} x{{ item.quantity }}</span>
                </div>
                <div v-if="order.items.length > 2" class="text-xs text-gray-500 mt-1">
                  +{{ order.items.length - 2 }} товаров
                </div>
              </div>
            </td>

            <!-- Total -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-semibold text-gray-900">
                {{ formatPrice(order.total) }}
              </div>
            </td>

            <!-- Status -->
            <td class="px-6 py-4 whitespace-nowrap">
              <UDropdownMenu
                :items="[[...getStatusOptions(order.status).map(option => ({
                  label: option.label,
                  disabled: option.disabled,
                  click: () => updateOrderStatus(order.id, option.value)
                }))]]"
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

            <!-- Payment -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <UIcon :name="paymentConfig[order.paymentMethod].icon" class="w-4 h-4 text-gray-400" />
                <span class="text-sm text-gray-600">{{ paymentConfig[order.paymentMethod].label }}</span>
              </div>
            </td>

            <!-- Actions -->
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex items-center justify-end gap-2">
                <UButton
                  @click="viewOrderDetails(order)"
                  icon="i-lucide-eye"
                  variant="ghost"
                  size="sm"
                  class="text-gray-400 hover:text-gray-600"
                />
                <UButton
                  icon="i-lucide-phone"
                  variant="ghost"
                  size="sm"
                  class="text-gray-400 hover:text-green-600"
                />
                <UButton
                  icon="i-lucide-more-horizontal"
                  variant="ghost"
                  size="sm"
                  class="text-gray-400 hover:text-gray-600"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination could go here -->
    <div class="px-6 py-3 bg-gray-50 border-t border-gray-200">
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Показано <span class="font-medium">{{ orders.length }}</span> заказов
        </div>
        <div class="flex items-center gap-2">
          <!-- Pagination buttons would go here -->
        </div>
      </div>
    </div>
  </div>
</template>