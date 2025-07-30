<script setup>
definePageMeta({
  layout: 'admin'
})

const { data, error } = await useFetch('/api/admin/orders')

// Если есть ошибка авторизации, перенаправляем на логин
if (error.value?.statusCode === 401) {
  await navigateTo('/admin/login')
}

async function logout() {
  try {
    await $fetch('/api/admin/logout', { method: 'DELETE' })
    await navigateTo('/admin/login')
  } catch (err) {
    console.error('Logout error:', err)
  }
}
</script>

<template>
<div>
    <div class="flex justify-between items-center m-6">
        <h1>ADMINKA suka</h1>
        <div>
          <UButton to="/" class="bg-amber-500 mr-4 hover:bg-amber-600">Меню</UButton>
          <UButton @click="logout" class="bg-amber-500 hover:bg-amber-600" icon="i-heroicons-lock-open"></UButton>
        </div>
    </div>
    
    <div v-if="error">
        <p>Ошибка: {{ error.message }}</p>
    </div>
    <div v-else>
        <p>{{ data }}</p>
    </div>
</div>
</template>