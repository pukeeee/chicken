<script setup lang="ts">
interface Props {
  currentPage: number
  totalPages: number
  totalOrders: number
  pageSize: number
}

defineProps<Props>()

defineEmits<{
  pageChange: [page: number]
}>()
</script>

<template>
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
              @click="$emit('pageChange', currentPage - 1)"
              :disabled="currentPage <= 1"
              icon="i-lucide-chevron-left"
              variant="outline"
              size="sm"
            />
            
            <div class="flex gap-1">
              <UButton
                v-for="page in Math.min(5, totalPages)"
                :key="page"
                @click="$emit('pageChange', page)"
                :variant="page === currentPage ? 'solid' : 'ghost'"
                :class="page === currentPage ? 'bg-amber-500' : ''"
                size="sm"
              >
                {{ page }}
              </UButton>
            </div>
            
            <UButton
              @click="$emit('pageChange', currentPage + 1)"
              :disabled="currentPage >= totalPages"
              icon="i-lucide-chevron-right"
              variant="outline"
              size="sm"
            />
          </div>
        </div>
      </div>
</template>