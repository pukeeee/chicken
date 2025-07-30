<script setup>
import { onMounted } from 'vue'
import { useCartStore } from '~/stores/cart'

onMounted(() => {
  useCart()
})
</script>

<template>
  <NuxtLayout />
</template>
