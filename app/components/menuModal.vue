<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  id: [String, Number]
})

const emit = defineEmits(['close'])
function close() {
  emit('close')
}

const menuItem = ref(null)
const loading = ref(false)
const error = ref(null)

async function fetchMenuItem(id) {
  if (!id) return
  loading.value = true
  error.value = null
  try {
    menuItem.value = await $fetch(`/api/menu/${id}`)
  } catch (e) {
    error.value = 'Ошибка загрузки блюда'
    menuItem.value = null
  } finally {
    loading.value = false
  }
}

// Следим за изменением id и сразу подгружаем блюдо
watch(
  () => props.id,
  (newId) => {
    fetchMenuItem(newId)
  },
  { immediate: true }
)
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" @click.self="close">
    <div class="relative bg-white border-2 border-amber-300 rounded-2xl shadow-2xl max-w-lg w-full p-6 flex flex-col md:flex-row gap-6 animate-fade-in">
      <!-- Кнопка закрытия -->
      <button
        class="absolute top-4 right-4 text-amber-500 hover:text-amber-700 text-3xl font-bold transition"
        @click="close"
        aria-label="Закрыть"
      >&times;</button>
      <!-- Картинка -->
      <img
        v-if="menuItem"
        class="w-40 h-60 object-cover object-top rounded-xl border border-amber-200 shadow md:w-40 md:h-60 max-w-xs"
        :src="menuItem.image"
        :alt="menuItem.name"
      />
      <!-- Информация -->
      <div v-if="menuItem" class="flex-1 flex flex-col justify-between">
        <div>
          <h2 class="text-3xl font-extrabold text-amber-700 mb-2">{{ menuItem.name }}</h2>
          <p class="text-gray-700 mb-4">{{ menuItem.description }}</p>
          <div class="text-lg font-semibold text-amber-600 mb-4">Ціна: <b>{{ menuItem.price }}₴</b></div>
        </div>
        <UButton
          class="bg-amber-500 text-white font-bold rounded-lg px-8 py-3 shadow hover:bg-amber-600 transition w-full"
          icon="i-heroicons-shopping-cart"
        >
          До кошика
        </UButton>
      </div>
      <div v-if="loading" class="w-full text-center py-8">Загрузка...</div>
      <div v-if="error" class="w-full text-center py-8 text-red-500">{{ error }}</div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: scale(0.96);}
  to { opacity: 1; transform: scale(1);}
}
.animate-fade-in {
  animation: fade-in 0.25s cubic-bezier(.4,0,.2,1);
}
</style>