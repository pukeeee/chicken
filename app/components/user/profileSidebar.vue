<script setup lang="ts">
import type { PublicUser } from '~~/shared/types/auth';

// Компонент тепер приймає дані користувача через props
defineProps<{
  user: PublicUser | null
}>()

// Компонент повідомляє батька про подію виходу
const emit = defineEmits<{
  (e: 'logout'): void
}>()

const handleLogout = () => {
  emit('logout')
}

// Визначаємо активний маршрут для підсвічування кнопок
const route = useRoute()
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
    <!-- Блок з інформацією про користувача -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center space-x-4">
        <UAvatar :alt="user?.name?.charAt(0) || 'U'" size="md" />
        <div class="truncate">
          <h3 class="font-semibold text-gray-900 dark:text-white truncate">
            {{ user?.name || 'Користувач' }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ user?.phone }}</p>
        </div>
      </div>
    </div>

    <!-- Навігація -->
    <nav class="p-2 space-y-1">
      <UButton
        to="/users"
        icon="i-lucide-user-cog"
        label="Профіль"
        variant="ghost"
        class="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        :class="{ 'bg-gray-100 dark:bg-gray-700': route.path === '/users' }"
      />
      <UButton
        to="/users/orders"
        icon="i-lucide-shopping-bag"
        label="Мої замовлення"
        variant="ghost"
        class="flex items-center space-x-3 px-3 py-2 rounded-md bg-amber-50 text-amber-700 font-medium"
        :class="{ 'bg-gray-100 dark:bg-gray-700': route.path === '/users/orders' }"
      />
      <UButton
        @click="handleLogout"
        icon="i-lucide-log-out"
        label="Вийти"
        variant="ghost"
        class="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors"
      />
    </nav>
  </div>
</template>
