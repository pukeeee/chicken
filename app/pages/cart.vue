<script setup>
import { useCartStore } from '~/app/stores/cart'

const cart = useCartStore()

function onCheckout() {
  console.log('Завершити замовлення')
}
</script>

<template>
  <div class="max-w-3xl mx-auto py-10 px-2">
    <h1 class="text-2xl font-bold mb-6">Кошик</h1>
    <!-- Desktop table -->
    <div class="overflow-x-auto rounded-lg shadow hidden sm:block">
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
                  class="transition rounded-full bg-amber-500 hover:bg-amber-600"
                  @click="cart.changeQuantity(item.id, -1)"
                />
                <span class="mx-2">{{ item.quantity }}</span>
                <UButton
                  variant="solid"
                  icon="i-heroicons-plus"
                  size="sm"
                  class="transition rounded-full bg-amber-500 hover:bg-amber-600"
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
                class="px-4 transition bg-amber-500 hover:bg-amber-600"
                @click="cart.removeFromCart(item.id)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Mobile cards -->
    <div class="flex flex-col gap-4 sm:hidden">
      <div
        v-for="item in cart.items"
        :key="item.id"
        class="bg-white rounded-lg shadow p-4 flex flex-col gap-2"
      >
        <div class="flex justify-between items-center">
          <span class="font-bold text-amber-700">{{ item.name }}</span>
          <UButton
            variant="solid"
            icon="i-heroicons-trash"
            size="sm"
            class="transition bg-amber-500 hover:bg-amber-600"
            @click="cart.removeFromCart(item.id)"
          />
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-600">Ціна:</span>
          <span class="font-semibold text-amber-600">{{ item.price * item.quantity }} ₴</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-600">Кількість:</span>
          <div class="flex items-center gap-2">
            <UButton
              variant="solid"
              icon="i-heroicons-minus"
              size="sm"
              class="rounded-full bg-amber-500 hover:bg-amber-600"
              @click="cart.changeQuantity(item.id, -1)"
            />
            <span class="mx-2">{{ item.quantity }}</span>
            <UButton
              variant="solid"
              icon="i-heroicons-plus"
              size="sm"
              class="rounded-full bg-amber-500 hover:bg-amber-600"
              @click="cart.changeQuantity(item.id, 1)"
            />
          </div>
        </div>
      </div>
    </div>
    <!-- Итог и кнопка -->
    <div class="flex flex-col items-end mt-6 gap-4">
      <div class="text-xl font-bold">
        Всього: {{ cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0) }} ₴
      </div>
      <UButton
        color="primary"
        size="lg"
        class="px-8 py-2 bg-amber-500 hover:bg-amber-600 w-full sm:w-auto"
        @click="onCheckout"
      >Завершити замовлення</UButton>
    </div>
  </div>
</template>