<script setup>
import { useCartStore } from '~/stores/cart'

const cart = useCartStore()

// Заглушки для кнопок
function onIncrease(item) {
  console.log(`Збільшити кількість для: ${item.name}`)
}
function onDecrease(item) {
  console.log(`Зменшити кількість для: ${item.name}`)
}
function onRemove(item) {
  console.log(`Видалити з кошика: ${item.name}`)
}
function onCheckout() {
  console.log('Завершити замовлення')
}
</script>

<template>
  <div class="max-w-3xl mx-auto py-10">
    <h1 class="text-2xl font-bold mb-6">Кошик</h1>
    <div class="overflow-x-auto rounded-lg shadow">
      <table class="min-w-full bg-white">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-4 py-3 text-left">Товар</th>
            <th class="px-4 py-3 text-center">Кількість</th>
            <th class="px-4 py-3 text-center">Ціна</th>
            <th class="px-4 py-3 text-center">Видалити</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in cart.items" :key="item.id" class="border-b hover:bg-gray-50">
            <td class="px-4 py-3">{{ item.name }}</td>
            <td class="px-4 py-3 text-center">
              <div class="flex items-center justify-center gap-2">
                <UButton
                  variant="solid"
                  icon="i-heroicons-minus"
                  size="sm"
                  class="transition rounded-full bg-pink-500 hover:bg-pink-600"
                  @click="cart.changeQuantity(item.id, -1)"
                />
                <span class="mx-2">{{ item.quantity }}</span>
                <UButton
                  variant="solid"
                  icon="i-heroicons-plus"
                  size="sm"
                  class="transition rounded-full bg-pink-500 hover:bg-pink-600"
                  @click="cart.changeQuantity(item.id, 1)"
                />
              </div>
            </td>
            <td class="px-4 py-3 text-center">{{ item.price * item.quantity }} ₴</td>
            <td class="px-4 py-3 text-center">
              <UButton
                variant="solid"
                icon="i-heroicons-trash"
                size="sm"
                class="px-4 transition bg-pink-500 hover:bg-pink-600"
                @click="cart.removeFromCart(item.id)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex justify-end mt-4 text-xl font-bold">
      Всього: {{ cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0) }} ₴
    </div>
    <div class="flex justify-end mt-6">
      <UButton
        color="primary"
        size="lg"
        class="px-8 py-2 bg-pink-500 hover:bg-pink-600"
        @click="onCheckout"
      >Завершити замовлення</UButton>
    </div>
  </div>
</template>