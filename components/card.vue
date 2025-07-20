<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCartStore } from '~/stores/cart'

const emit = defineEmits(['open'])
const menuItems = ref<{ id: number; name: string; price: number; image: string | null , categoryId: number | null}[]>([])

const cart = useCartStore()

function handleClick(id: number) {
  emit('open', id)
}

function addToCart(item: { id: number, name: string, price: number }) {
  cart.addToCart(item)
}

function increase(item: { id: number, name: string, price: number }) {
  cart.changeQuantity(item.id, 1)
}
function decrease(item: { id: number, name: string, price: number }) {
  const found = cart.items.find(i => i.id === item.id)
  if (found && found.quantity <= 1) {
    cart.removeFromCart(item.id)
  } else {
    cart.changeQuantity(item.id, -1)
  }
}

function getCartQuantity(id: number) {
  const found = cart.items.find(i => i.id === id)
  return found ? found.quantity : 0
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
          <div class="flex justify-center items-center min-h-[48px]">
            <template v-if="getCartQuantity(item.id) === 0">
              <UButton
                class="bg-pink-500 text-white font-bold rounded px-8 py-2 shadow hover:bg-pink-600 transition mt-2 cursor-pointer"
                @click.stop="addToCart(item)"
              >
                До кошика
              </UButton>
            </template>
            <template v-else>
              <div class="flex items-center gap-2 bg-pink-50 rounded-lg px-3 py-2 shadow mt-2">
                <UButton
                  icon="i-heroicons-minus"
                  size="sm"
                  variant="solid"
                  class="rounded-full bg-pink-500 hover:bg-pink-600"
                  @click.stop="decrease(item)"
                />
                <span class="text-lg font-semibold text-pink-700 min-w-[24px] text-center select-none">
                  {{ getCartQuantity(item.id) }}
                </span>
                <UButton
                  icon="i-heroicons-plus"
                  size="sm"
                  variant="solid"
                  class="rounded-full bg-pink-500 hover:bg-pink-600"
                  @click.stop="increase(item)"
                />
              </div>
            </template>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>