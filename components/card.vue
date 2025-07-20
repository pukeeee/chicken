<script setup lang="ts">
import { ref, onMounted } from 'vue'

const emit = defineEmits(['open'])
const showToast = ref(false)
const toastText = ref('')
const menuItems = ref<{ id: number; name: string; description: string | null; price: number; image: string | null }[]>([])

function handleClick(id: number) {
  emit('open', id)
}

function addToCart(name: string) {
  toastText.value = `${name} додана до кошика!`
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 1000)
}

// Загружаем данные с API
onMounted(async () => {
  try {
    const { data } = await $fetch('/api/menu')
    menuItems.value = data
  } catch (error) {
    console.error('Ошибка загрузки меню:', error)
  }
})
</script>

<template>
  <div class="container mx-auto mt-8">
    <!-- Toast -->
    <div
      v-if="showToast"
      class="fixed top-8 left-1/2 -translate-x-1/2 bg-pink-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition"
    >
      {{ toastText }}
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
      <UCard
        v-for="item in menuItems"
        :key="item.id"
        class="hover:shadow-xl transition-shadow cursor-pointer border-2 border-pink-300"
        @click="handleClick(item.id)"
      >
        <template #header>
          <img
            :src="item.image || '/logo.png'"
            :alt="item.name"
            class="w-full h-64 object-top rounded-t-lg"
          />
        </template>
        <div class="flex flex-col gap-2">
          <h3 class="text-2xl font-bold text-pink-700">{{ item.name }}</h3>
          <p class="text-gray-600">
            Ціна:
            <span class="font-semibold text-pink-600">{{ item.price }}₴</span>
          </p>
        </div>
        <template #footer>
          <div class="flex justify-center">
            <UButton
              class="bg-pink-500 text-white font-bold rounded px-8 py-2 shadow hover:bg-pink-600 transition mt-2 cursor-pointer"
              @click.stop="addToCart(item.name)"
            >
              До кошика
            </UButton>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>