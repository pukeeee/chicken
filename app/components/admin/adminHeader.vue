<script setup lang="ts">
interface Props {
  title: string
  sidebarCollapsed: boolean
}

const props = defineProps<Props>()

async function logout() {
  console.log("logout")
  try {
    await $fetch('/api/admin/logout', { method: 'DELETE' })
    await navigateTo('/admin/login')
  } catch (err) {
    console.error('Logout error:', err)
  }
}

// Получаем текущее время для приветствия
const currentTime = new Date()
const hour = currentTime.getHours()
const greeting = computed(() => {
  if (hour < 12) return 'Доброго ранку'
  if (hour < 17) return 'Доброго дня'
  if (hour < 21) return 'Доброго вечора'
  return 'Доброї ночі'
})

// Создаем массив элементов для dropdown
const dropdownItems = computed(() => [
  [{
    label: 'Профіль',
    icon: 'i-lucide-user',
    to: '/admin/profile'
  }],
  [{
    label: 'Налаштування',
    icon: 'i-lucide-settings',
    to: '/admin/settings'
  }],
  [{
    label: 'Вихід',
    icon: 'i-lucide-log-out',
    async onSelect() {
      await logout()
    }
  }]
])
</script>

<template>
  <header 
    :class="[
      'fixed top-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm transition-all duration-300 z-30',
      sidebarCollapsed ? 'left-16' : 'left-64'
    ]"
  >
    <div class="flex items-center justify-between h-full px-6">
      <!-- Left section -->
      <div class="flex items-center gap-4">
        <div>
          <h1 class="text-xl font-semibold text-gray-900">{{ title }}</h1>
          <p class="text-sm text-gray-500">{{ greeting }}, ласкаво просимо до панелі управління</p>
        </div>
      </div>

      <!-- Right section -->
      <div class="flex items-center gap-3">
        <!-- Notifications -->
        <UButton
          icon="i-lucide-bell"
          variant="ghost"
          size="sm"
          class="text-gray-500 hover:text-gray-700 relative"
        >
          <UBadge 
            label="3" 
            color="warning" 
            variant="solid"
            size="xs"
            class="absolute -top-1 -right-1"
          />
        </UButton>

        <!-- Go to client site -->
        <UButton
          to="/"
          target="_blank"
          icon="i-lucide-external-link"
          variant="outline"
          size="sm"
          class="text-gray-600 hover:text-amber-600 border-gray-300 hover:border-amber-300"
        >
          Сайт
        </UButton>

        <!-- User menu dropdown -->
        <UDropdownMenu
          :items="dropdownItems"
          :ui="{
            content: 'bg-white shadow-lg border border-gray-200',
            item: 'hover:bg-gray-50',
            itemLeadingIcon: 'text-gray-400'
          }"
        >
          <UButton variant="ghost" size="sm" class="p-1">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                <UIcon name="i-lucide-user" class="w-4 h-4 text-white" />
              </div>
              <UIcon name="i-lucide-chevron-down" class="w-4 h-4 text-gray-400" />
            </div>
          </UButton>
        </UDropdownMenu>
      </div>
    </div>
  </header>
</template>