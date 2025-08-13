<script setup lang="ts">
import { computed } from 'vue'
import type { Order, OrderUpdateData } from '~~/shared/types/order'
import { formatDate, formatPrice } from '~/utils/formatters'
import { 
  OrderStatus, 
  ORDER_STATUS_CONFIG, 
  PaymentMethod, 
  PAYMENT_METHOD_CONFIG
} from '~~/shared/constants/orderConstants'

interface Props {
  order: Order
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updateOrder: [orderId: string | number, updateData: OrderUpdateData]
  updateOrderModal: [order: Order]
  viewOrder: [order: Order]
  callCustomer: [phone: string]
  printOrder: [orderId: string | number]
  duplicateOrder: [orderId: string | number]
}>()

// Создаем computed property для пунктов меню статусов
const statusMenuItems = computed(() => [
  Object.entries(ORDER_STATUS_CONFIG).map(([statusKey, config]) => ({
    label: config.label,
    onSelect: () => emit('updateOrder', props.order.id, { status: statusKey as OrderStatus }),
    disabled: props.order.status === statusKey
  }))
])

// Создаем computed property для меню действий
const actionMenuItems = computed(() => [
  [
    { 
      label: 'Перегляд', 
      icon: 'i-lucide-eye', 
      onSelect: () => emit('viewOrder', props.order) 
    },
    { 
      label: 'Редагувати', 
      icon: 'i-lucide-pencil-line', 
      onSelect: () => emit('updateOrderModal', props.order) 
    },
    { 
      label: 'Друк', 
      icon: 'i-lucide-printer', 
      onSelect: () => emit('printOrder', props.order.id) 
    },
    { 
      label: 'Дублювати', 
      icon: 'i-lucide-copy', 
      onSelect: () => emit('duplicateOrder', props.order.id) 
    }
  ],
  [
    { 
      label: 'Скасувати замовлення', 
      icon: 'i-lucide-x-circle', 
      onSelect: () => emit('updateOrder', props.order.id, { status: OrderStatus.CANCELLED }),
      disabled: props.order.status === OrderStatus.CANCELLED 
    }
  ]
])

// Получаем конфигурацию для текущего способа оплаты
const paymentConfig = computed(() => {
  if (!props.order.paymentMethod) return null
  const method = props.order.paymentMethod as PaymentMethod
  return Object.values(PaymentMethod).includes(method) 
    ? PAYMENT_METHOD_CONFIG[method] 
    : null
})

// Получаем конфигурацию для текущего статуса
const statusConfig = computed(() => {
  const status = props.order.status as OrderStatus
  return Object.values(OrderStatus).includes(status) 
    ? ORDER_STATUS_CONFIG[status] 
    : null
})
</script>

<template>
  <tr class="hover:bg-gray-50 transition-colors">
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
        <div class="text-sm font-medium text-gray-900">{{ order.customerName || 'Не указано' }}</div>
        <div class="text-sm text-gray-500">{{ order.customerPhone || 'Не указано' }}</div>
        <div v-if="order.deliveryAddress" class="text-xs text-gray-400 mt-1 max-w-xs truncate">
          📍 {{ order.deliveryAddress }}
        </div>
      </div>
    </td>

    <!-- Товары -->
    <td class="px-6 py-4">
      <div class="text-sm text-gray-900">
        <div v-for="(item, index) in order.items.slice(0, 2)" :key="index" class="flex justify-between">
          <span class="truncate mr-2">{{ item.product?.name || 'Товар' }}</span>
          <span class="text-gray-500">x{{ item.quantity }}</span>
        </div>
        <div v-if="order.items.length > 2" class="text-xs text-gray-500 mt-1">
          +{{ order.items.length - 2 }} ще
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
      <UDropdownMenu :items="statusMenuItems">
        <UBadge
          :label="statusConfig?.label || order.status"
          :color="statusConfig?.color || 'neutral'"
          variant="soft"
          class="cursor-pointer"
        >
          <template #leading>
            <UIcon 
              :name="statusConfig?.icon || 'i-lucide-circle'" 
              class="w-3 h-3" 
            />
          </template>
        </UBadge>
      </UDropdownMenu>
    </td>

    <!-- Оплата -->
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="flex items-center gap-2">
        <UIcon 
          :name="paymentConfig?.icon || 'i-lucide-credit-card'" 
          class="w-4 h-4 text-gray-400" 
        />
        <span class="text-sm text-gray-600">
          {{ paymentConfig?.label || 'Не указано' }}
        </span>
      </div>
    </td>

    <!-- Действия -->
    <td class="px-6 py-4 whitespace-nowrap text-right">
      <div class="flex items-center justify-end gap-2">
        <UButton
          @click="emit('viewOrder', order)"
          icon="i-lucide-eye"
          variant="ghost"
          size="sm"
          class="text-gray-400 hover:text-blue-600"
        />
        <UButton
          @click="emit('updateOrderModal', order)"
          icon="i-lucide-pencil-line"
          variant="ghost"
          size="sm"
          class="text-gray-400 hover:text-purple-600"
        />
        <UButton
          v-if="order.customerPhone"
          @click="emit('callCustomer', order.customerPhone)"
          icon="i-lucide-phone"
          variant="ghost"
          size="sm"
          class="text-gray-400 hover:text-green-600"
        />
        <UDropdownMenu :items="actionMenuItems">
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
</template>