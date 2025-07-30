<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'admin-login'
})

const email = ref('')
const password = ref('')
const error = ref('')

async function login() {
  try {
    await $fetch('/api/admin/login', {
      method: 'POST',
      body: { 
        email: email.value, 
        password: password.value 
      }
    })

    // После успешного логина перенаправляем на админку
    navigateTo('/admin')
  }
  catch (err: any) {
    error.value = err.data?.message || 'Помилка входу'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-amber-50">
    <form
      class="bg-white p-8 rounded-lg shadow-md w-full max-w-xs flex flex-col gap-4"
      @submit.prevent="login"
    >
      <h2 class="text-2xl font-bold text-amber-600 text-center mb-2">Вхід в адмінку</h2>
      <UInput
        v-model="email"
        placeholder="Логін"
        icon="i-heroicons-user"
        size="lg"
        required
      />
      <UInput
        v-model="password"
        placeholder="Пароль"
        icon="i-heroicons-lock-closed"
        type="password"
        size="lg"
        required
      />
      <div v-if="error" class="text-red-500 text-sm text-center">{{ error }}</div>
      <UButton
        type="submit"
        color="primary"
        class="bg-amber-500 hover:bg-amber-600 w-full"
        size="lg"
      >
        Увійти
      </UButton>
    </form>
  </div>
</template>
