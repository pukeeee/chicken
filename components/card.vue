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
        v-for="n in 6"
        :key="n"
        class="hover:shadow-xl transition-shadow cursor-pointer border-2 border-pink-300"
        @click="handleClick(n)"
      >
        <template #header>
          <img
            src="/menu.jpg"
            alt="Курочка гриль"
            class="w-full h-64 object-top rounded-t-lg"
          />
        </template>
        <div class="flex flex-col gap-2">
          <h3 class="text-2xl font-bold text-pink-700">Курочка №{{ n }}</h3>
          <p class="text-gray-600">
            Соковита курочка гриль. Ціна:
            <span class="font-semibold text-pink-600">200₴</span>
          </p>
        </div>
        <template #footer>
          <div class="flex justify-center">
            <UButton
              class="bg-pink-500 text-white font-bold rounded px-8 py-2 shadow hover:bg-pink-600 transition mt-2 cursor-pointer"
              @click.stop="addToCart(n)"
            >
              До кошика
            </UButton>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['open'])
const showToast = ref(false)
const toastText = ref('')

function handleClick(id: number) {
  emit('open', id)
}

function addToCart(id: number) {
  toastText.value = `Курочка №${id} додана до кошика!`
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 1000)
}
</script>