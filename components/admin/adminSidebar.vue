<script setup lang="ts">
interface MenuItem {
  label: string
  icon: string
  to: string
  badge?: number
}

const props = defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  'update:collapsed': [value: boolean]
}>()

const menuItems: MenuItem[] = [
  {
    label: 'Дашборд',
    icon: 'i-lucide-layout-dashboard',
    to: '/admin'
  },
  {
    label: 'Заказы',
    icon: 'i-lucide-shopping-bag',
    to: '/admin/orders',
    badge: 5
  },
  {
    label: 'Меню',
    icon: 'i-lucide-utensils',
    to: '/admin/menu'
  },
  {
    label: 'Клиенты',
    icon: 'i-lucide-users',
    to: '/admin/customers'
  },
  {
    label: 'Аналитика',
    icon: 'i-lucide-bar-chart-3',
    to: '/admin/analytics'
  },
  {
    label: 'Настройки',
    icon: 'i-lucide-settings',
    to: '/admin/settings'
  }
]

const toggleSidebar = () => {
  emit('update:collapsed', !props.collapsed)
}
</script>

<template>
  <aside 
    :class="[
      'fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-sm transition-all duration-300 z-40',
      collapsed ? 'w-16' : 'w-64'
    ]"
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200">
      <div v-if="!collapsed" class="flex items-center gap-2 flex-1">
        <img src="/logo.png" alt="Лого" class="w-8 h-8 object-contain" />
        <span class="font-bold text-lg text-amber-600">Chicken</span>
      </div>
      <img v-else src="/logo.png" alt="Лого" class="w-8 h-8 object-contain" />
      
      <UButton
        @click="toggleSidebar"
        :icon="collapsed ? 'i-lucide-panel-right-open' : 'i-lucide-panel-left-close'"
        variant="ghost"
        size="sm"
        class="text-gray-500 hover:text-gray-700 flex-shrink-0"
        :class="collapsed ? 'mx-auto' : ''"
      />
    </div>

    <!-- Navigation -->
    <nav class="p-2 space-y-1">
      <NuxtLink
        v-for="item in menuItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors group"
        active-class="bg-amber-100 text-amber-700 font-medium"
      >
        <UIcon 
          :name="item.icon" 
          class="w-5 h-5 flex-shrink-0"
          :class="collapsed ? 'mx-auto' : ''"
        />
        
        <div v-if="!collapsed" class="flex items-center justify-between flex-1">
          <span class="truncate">{{ item.label }}</span>
          <UBadge 
            v-if="item.badge" 
            :label="item.badge.toString()" 
            color="success" 
            variant="soft"
            size="xs"
          />
        </div>
      </NuxtLink>
    </nav>

    <!-- Bottom section -->
    <div class="absolute bottom-4 left-0 right-0 px-2">
      <div 
        :class="[
          'flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50',
          collapsed ? 'justify-center' : ''
        ]"
      >
        <div class="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
          <UIcon name="i-lucide-user" class="w-4 h-4 text-white" />
        </div>
        <div v-if="!collapsed" class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">Админ</p>
          <p class="text-xs text-gray-500 truncate">admin@kurochka.com</p>
        </div>
      </div>
    </div>
  </aside>
</template>