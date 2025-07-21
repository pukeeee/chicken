<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'admin'
})

const username = ref('')
const password = ref('')
const error = ref('')

function login() {
  // Пример простой проверки (замени на свой API-запрос)
  if (username.value === 'admin' && password.value === '1234') {
    error.value = ''
    // Здесь можно сделать редирект или сохранить токен
    alert('Вход выполнен!')
  } else {
    error.value = 'Невірний логін або пароль'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-pink-50">
    <form
      class="bg-white p-8 rounded-lg shadow-md w-full max-w-xs flex flex-col gap-4"
      @submit.prevent="login"
    >
      <h2 class="text-2xl font-bold text-pink-600 text-center mb-2">Вхід в адмінку</h2>
      <UInput
        v-model="username"
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
        class="bg-pink-500 hover:bg-pink-600 w-full"
        size="lg"
      >
        Увійти
      </UButton>
    </form>
  </div>
</template>
