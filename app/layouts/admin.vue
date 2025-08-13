<script setup lang="ts">
import { ref } from 'vue'
import AdminSidebar from '~/components/admin/adminSidebar.vue'
import AdminHeader from '~/components/admin/adminHeader.vue'

// Состояние для сворачивания сайдбара
const sidebarCollapsed = ref(false)

// Meta для страницы
useHead({
  titleTemplate: '%s Adminka',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

// Получаем заголовок текущей страницы из роута
const route = useRoute()
const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/admin': 'Дашборд',
    '/admin/orders': 'Замовлення',
    '/admin/menu': 'Меню',
    '/admin/customers': 'Клієнти',
    '/admin/analytics': 'Аналітика',
    '/admin/settings': 'Налаштування',
  }
  return titles[route.path] || 'Адмін панель'
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <AdminSidebar 
      v-model:collapsed="sidebarCollapsed" 
    />

    <!-- Header -->
    <AdminHeader 
      :title="pageTitle"
      :sidebar-collapsed="sidebarCollapsed"
    />

    <!-- Main content -->
    <main 
      :class="[
        'pt-16 transition-all duration-300',
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      ]"
    >
      <div class="p-6">
        <slot />
      </div>
    </main>

    <!-- Toast notifications would go here -->
    <!-- <UNotifications /> -->
  </div>
</template>

<style>
/* Ensure smooth transitions */
* {
  transition-property: margin, width, left;
  transition-duration: 300ms;
  transition-timing-function: ease-in-out;
}
</style>