<script setup>
import { onMounted } from 'vue'
import { useCartStore } from '~/stores/cart'

onMounted(() => {
  const cart = useCartStore()
  cart.loadFromLocalStorage()
})
</script>

<template>
  <NuxtLayout />
</template>
