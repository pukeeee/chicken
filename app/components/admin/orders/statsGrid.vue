<script setup lang="ts">
import type { OrderStats } from '~~/shared/types/order'

interface Props {
  orderStats: OrderStats | null
  statusConfig: Record<string, any>
}

defineProps<Props>()
</script>

<template>
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
</template>
