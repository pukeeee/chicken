<script setup lang="ts">
interface Props {
  error: any
  title?: string
  defaultMessage?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Помилка завантаження замовлень',
  defaultMessage: 'Сталася невідома помилка'
})
</script>

<template>
    <div v-if="error && error.statusCode !== 401" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <div class="flex items-center">
        <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-red-500 mr-3" />
        <div>
          <h3 class="text-sm font-medium text-red-800">{{ title }}</h3>
          <p class="text-sm text-red-600 mt-1">{{ error.message || defaultMessage }}</p>
        </div>
      </div>
    </div>
</template>