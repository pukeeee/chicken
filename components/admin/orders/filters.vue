<script setup lang="ts">
import type { StatusDropdownItem } from '~/types/order'

interface Props {
  searchQuery: string
  selectedStatus: string
  statusConfig: Record<string, any>
  statusDropdownItems: StatusDropdownItem[][]
}

defineProps<Props>()

defineEmits<{
  'update:searchQuery': [value: string]
  clearFilters: []
}>()
</script>

<template>
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="flex flex-col sm:flex-row gap-4">
        
        <!-- Поиск -->
        <div class="flex-1">
          <UInput
            :model-value="searchQuery"
            @update:model-value="$emit('update:searchQuery', $event)"
            placeholder="№ замовлення, ім'я клієнта або телефон"
            icon="i-lucide-search"
            size="lg"
            class="w-85"
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
              class="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
          @click="$emit('clearFilters')"
          icon="i-lucide-x"
          variant="outline"
          size="lg"
        >
          Очистити
        </UButton>
      </div>
    </div>
</template>