<script setup lang="ts">
interface Props {
  loading?: boolean
}

defineProps<Props>()

defineEmits<{
  refresh: []
  export: []
}>()
</script>

<template>
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Керування замовленнями</h1>
        <p class="text-gray-600 mt-1">Переглядайте та керуйте всіма замовленнями</p>
      </div>
      <div class="flex items-center gap-3">
        <UButton 
          @click="$emit('refresh')" 
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
</template>