<script setup>
import { onMounted } from 'vue'

onMounted(() => {
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
