<script setup>
import { onMounted } from 'vue'

onMounted(async () => {
  // Инициализируем корзину
  useCart()
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
