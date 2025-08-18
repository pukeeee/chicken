<script setup lang="ts">
import { useAuth } from '~/composables/auth/useAuth'
import { useAuthGuard } from '~/composables/auth/useAuthGuard'
import { useUserProfile } from '~/composables/user/useUserProfile'
import { formatDate } from '~/utils/formatters'

// Защита роута
useAuthGuard()

// Данные пользователя и выход из системы
const { user, logout } = useAuth()

// Логика профиля
const {
  isEditing,
  editForm,
  validationErrors,
  startEditing,
  cancelEditing,
  saveProfile,
  isLoading,
  hasChanges
} = useUserProfile()

const handleLogout = async () => {
  await logout()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Хлебные крошки -->
    <div class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center space-x-2 py-4 text-sm">
          <NuxtLink to="/" class="text-amber-600 hover:text-amber-700">
            Головна
          </NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="w-4 h-4 text-gray-400" />
          <span class="text-gray-500">Особистий кабінет</span>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Заголовок страницы -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Особистий кабінет</h1>
        <p class="mt-2 text-gray-600">Керуйте своїм профілем та замовленнями</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Боковая панель навигации -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center space-x-3 mb-6">
              <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <UIcon name="i-lucide-user" class="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">
                  {{ user?.name || 'Користувач' }}
                </h3>
                <p class="text-sm text-gray-500">{{ user?.phone }}</p>
              </div>
            </div>

            <nav class="space-y-2">
              <NuxtLink 
                to="/users/" 
                class="flex items-center space-x-3 px-3 py-2 rounded-md bg-amber-50 text-amber-700 font-medium"
              >
                <UIcon name="i-lucide-user" class="w-5 h-5" />
                <span>Профіль</span>
              </NuxtLink>
              
              <NuxtLink 
                to="/users/orders" 
                class="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <UIcon name="i-lucide-shopping-bag" class="w-5 h-5" />
                <span>Мої замовлення</span>
              </NuxtLink>
              
              <button 
                @click="handleLogout"
                class="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors"
              >
                <UIcon name="i-lucide-log-out" class="w-5 h-5" />
                <span>Вийти</span>
              </button>
            </nav>
          </div>
        </div>

        <!-- Основной контент -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow">
            <!-- Заголовок секции -->
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-900">Інформація профілю</h2>
              <UButton 
                v-if="user && !isEditing"
                @click="startEditing"
                color="neutral"
                variant="outline"
                size="sm"
                icon="i-lucide-edit"
              >
                Редагувати
              </UButton>
            </div>

            <div class="p-6">
              <template v-if="!user">
                <div class="flex items-center justify-center p-8">
                  <UIcon name="i-lucide-loader" class="animate-spin text-4xl text-amber-500" />
                </div>
              </template>

              <template v-else>
                <template v-if="!isEditing">
                  <!-- Режим просмотра -->
                  <div class="space-y-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Ім'я
                      </label>
                      <p class="text-gray-900">{{ user.name || 'Не вказано' }}</p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Телефон
                      </label>
                      <p class="text-gray-900">{{ user.phone }}</p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <p class="text-gray-900">{{ user.email || 'Не вказано' }}</p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Дата реєстрації
                      </label>
                      <p class="text-gray-900">{{ formatDate(user.createdAt) }}</p>
                    </div>
                  </div>
                </template>

                <template v-else>
                  <!-- Режим редактирования -->
                  <form @submit.prevent="saveProfile" class="space-y-6">
                    <UFormField label="Ім'я" name="name" :error="validationErrors.name">
                      <UInput
                        v-model="editForm.name"
                        placeholder="Введіть ваше ім'я"
                        :disabled="isLoading"
                      />
                    </UFormField>

                    <UFormField label="Телефон" name="phone">
                      <UInput
                        :model-value="user.phone"
                        disabled
                        :ui="{ base: 'bg-gray-50' }"
                      />
                      <template #help>
                        <span class="text-xs text-gray-500">
                          Телефон не можна змінити
                        </span>
                      </template>
                    </UFormField>

                    <UFormField label="Email" name="email" :error="validationErrors.email">
                      <UInput
                        v-model="editForm.email"
                        type="email"
                        placeholder="Введіть ваш email"
                        :disabled="isLoading"
                      />
                    </UFormField>

                    <div class="flex justify-end space-x-3 pt-4">
                      <UButton
                        type="button"
                        color="neutral"
                        variant="outline"
                        @click="cancelEditing"
                        :disabled="isLoading"
                      >
                        Скасувати
                      </UButton>
                      <UButton
                        type="submit"
                        color="neutral"
                        :loading="isLoading"
                        :disabled="!hasChanges"
                      >
                        Зберегти
                      </UButton>
                    </div>
                  </form>
                </template>
              </template>
            </div>
          </div>

          <!-- Статистика -->
          <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <UIcon name="i-lucide-shopping-bag" class="w-6 h-6 text-green-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Всього замовлень</p>
                  <p class="text-2xl font-semibold text-gray-900">0</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <UIcon name="i-lucide-heart" class="w-6 h-6 text-blue-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Улюблені страви</p>
                  <p class="text-2xl font-semibold text-gray-900">0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>