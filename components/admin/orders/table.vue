<script setup lang="ts">
import type { Order } from '~/types/order'
import TableRow from './tableRow.vue'

interface Props {
  orders: Order[]
  totalOrders: number
  loading: boolean
  searchQuery: string
  selectedStatus: string
  statusConfig: Record<string, any>
  paymentConfig: Record<string, any>
}

defineProps<Props>()

defineEmits<{
  updateStatus: [orderId: string | number, status: string]
  viewOrder: [order: Order]
  callCustomer: [phone: string]
  printOrder: [orderId: string | number]
  duplicateOrder: [orderId: string | number]
  clearFilters: []
}>()
</script>

<template>
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

    <!-- Таблица заказов -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Замовлення
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Клієнт
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Товари
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Сума
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Статус
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Оплата
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Дія
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <TableRow
            v-for="order in orders"
            :key="order.id"
            :order="order"
            :status-config="statusConfig"
            :payment-config="paymentConfig"
            @update-status="(orderId, status) => $emit('updateStatus', orderId, status)"
            @view-order="$emit('viewOrder', $event)"
            @call-customer="$emit('callCustomer', $event)"
            @print-order="$emit('printOrder', $event)"
            @duplicate-order="$emit('duplicateOrder', $event)"
          />
        </tbody>
      </table>
    </div>

    
  </div>
</template>