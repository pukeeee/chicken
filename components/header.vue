<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { DropdownMenuItem } from '@nuxt/ui'

const dropdownOpen = ref(false)

// Элементы мобильного меню для неавторизованных пользователей
const guestMenuItems = ref<DropdownMenuItem[]>([
  {
    label: 'Меню',
    icon: 'i-lucide-list',
    to: '/'
  },
  {
    label: 'Доставка',
    icon: 'i-lucide-truck',
    to: '/delivery'
  },
  {
    label: 'Корзина',
    icon: 'i-heroicons-shopping-cart',
    to: '/cart'
  },
  {
    label: 'Увійти',
    icon: 'i-lucide-user',
    onSelect: () => openLoginModal()
  }
])

// Элементы мобильного меню для авторизованных пользователей
const authMenuItems = ref<DropdownMenuItem[]>([
  {
    label: 'Меню',
    icon: 'i-lucide-list',
    to: '/'
  },
  {
    label: 'Доставка',
    icon: 'i-lucide-truck',
    to: '/delivery'
  },
  {
    label: 'Корзина',
    icon: 'i-heroicons-shopping-cart',
    to: '/cart'
  },
  {
    label: 'Особистий кабінет',
    icon: 'i-lucide-user',
    to: '/users/'
  },
  {
    label: 'Мої замовлення',
    icon: 'i-lucide-shopping-bag',
    to: '/users/orders'
  },
  {
    label: 'Вийти',
    icon: 'i-lucide-log-out',
    onSelect: () => handleLogout()
  }
])

// Элементы дропдауна для авторизованных пользователей (десктоп)
const userDropdownItems = ref<DropdownMenuItem[]>([
  {
    label: 'Особистий кабінет',
    icon: 'i-lucide-user',
    to: '/users/'
  },
  {
    label: 'Мої замовлення',
    icon: 'i-lucide-shopping-bag',
    to: '/users/orders'
  },
  {
    label: 'Вийти',
    icon: 'i-lucide-log-out',
    onSelect: () => handleLogout()
  }
])

const { user, isAuthenticated, logout, checkAuth } = useAuth()

const showLoginModal = ref(false)

// Проверяем авторизацию при загрузке компонента
onMounted(async () => {
  // console.log('🔍 Header: onMounted - checking auth...')
  await checkAuth()
  // console.log('🔍 Header: after checkAuth - isAuthenticated:', isAuthenticated.value)
  // console.log('🔍 Header: after checkAuth - user:', user.value)
})

// Следим за изменениями состояния авторизации
watch(isAuthenticated, (newValue) => {
  // console.log('🔍 Header: isAuthenticated changed to:', newValue)
}, { immediate: true })

// Следим за изменениями пользователя
watch(user, (newValue) => {
  // console.log('🔍 Header: user changed to:', newValue?.phone || 'null')
}, { immediate: true })

// Открыть модалку входа
const openLoginModal = () => {
  showLoginModal.value = true
}

// Обработка успешного входа
const handleLoginSuccess = (userData: any) => {
  showLoginModal.value = false
}

// Обработка выхода из системы
const handleLogout = async () => {
  await logout()
}

</script>

<template>
  <header class="h-15 flex justify-between items-center px-4 py-2 bg-amber-300 shadow-md">
    <h1 class="text-xl font-bold text-white flex items-center gap-2">
      <img src="/images/logo.png" alt="Лого" class="w-10 h-10 object-contain" />
      Chicken
    </h1>
    
    <!-- Десктоп меню -->
    <nav class="hidden sm:flex gap-4">
      <div class="mr-4">
        <UButton to="/" class="bg-amber-500 mr-4 hover:bg-amber-600">Меню</UButton>
        <UButton to="/delivery" class="bg-amber-500 hover:bg-amber-600">Доставка</UButton>
      </div>
      <UButton to="/cart" class="bg-amber-500 hover:bg-amber-600" icon="i-heroicons-shopping-cart" />
      
      <!-- Показываем кнопку входа или дропдаун пользователя -->
      <template v-if="!isAuthenticated">
        <UButton 
          @click="openLoginModal" 
          class="bg-amber-500 hover:bg-amber-600"
          icon="i-lucide-user"
        >
          Увійти
        </UButton>
      </template>
      
      <template v-else>
        <!-- Дропдаун для авторизованного пользователя -->
        <UDropdownMenu
          :items="userDropdownItems"
          :content="{ align: 'end', side: 'bottom', sideOffset: 8 }"
          :ui="{
            content: 'bg-white border border-gray-200 shadow-lg',
            item: 'hover:bg-gray-50',
            itemLeadingIcon: 'text-amber-500'
          }"
        >
          <UButton 
            class="bg-amber-500 hover:bg-amber-600"
            icon="i-lucide-user"
            :trailing="true"
          >
            <UIcon name="i-lucide-chevron-down" class="w-4 h-4 ml-1" />
          </UButton>
        </UDropdownMenu>
      </template>
    </nav>
    
    <!-- Мобильное меню (бургер через UDropdownMenu) -->
    <ClientOnly>
      <div class="sm:hidden">
        <UDropdownMenu
          v-model:open="dropdownOpen"
          :items="isAuthenticated ? authMenuItems : guestMenuItems"
          :content="{ align: 'end', side: 'bottom', sideOffset: 8 }"
          :ui="{
            content: 'bg-amber-100 text-amber-900',
            item: 'hover:bg-amber-200',
            itemLeadingIcon: 'text-amber-500'
          }"
          :overlay="false"
        >
          <UButton
            icon="i-lucide-menu"
            class="bg-amber-500 hover:bg-amber-600 text-white"
            variant="solid"
            @click.stop
          />
        </UDropdownMenu>
      </div>
    </ClientOnly>

    <!-- Модалка входа -->
    <UserLoginModal 
      v-model="showLoginModal"
      @success="handleLoginSuccess"  
    />
  </header>
</template>