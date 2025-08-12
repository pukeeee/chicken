<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { DropdownMenuItem } from '@nuxt/ui'

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

const dropdownOpen = ref(false)
const showLoginModal = ref(false)

const { 
  isAuthenticated, 
  isInitialized,
  isLoading,
  userName,
  logout 
} = useAuth()


// Открыть модалку входа
const openLoginModal = () => {
  showLoginModal.value = true
}

// Обработка успешного входа
const handleLoginSuccess = () => {
  showLoginModal.value = false
}

// Обработка выхода из системы
const handleLogout = async () => {
  await logout()
}

// Вычисляемое свойство для определения, что показывать
const shouldShowAuthButton = computed(() => {
  return isInitialized.value && !isAuthenticated.value
})

const shouldShowUserMenu = computed(() => {
  return isInitialized.value && isAuthenticated.value
})
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
      
      <!-- Десктоп: рендерим только на клиенте, чтобы избежать SSR/CSR мисматча -->
      <ClientOnly>
        <template #fallback>
          <div class="w-20 h-10 bg-amber-400 rounded"></div>
        </template>

        <!-- Показываем кнопку входа для неавторизованных -->
        <template v-if="shouldShowAuthButton">
          <UButton 
            @click="openLoginModal" 
            class="bg-amber-500 hover:bg-amber-600"
            icon="i-lucide-user"
            :loading="isLoading"
          >
            Увійти
          </UButton>
        </template>
        
        <!-- Показываем дропдаун для авторизованных -->
        <template v-else-if="shouldShowUserMenu">
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
              :loading="isLoading"
            >
              {{ userName }}
              <UIcon name="i-lucide-chevron-down" class="w-4 h-4 ml-1" />
            </UButton>
          </UDropdownMenu>
        </template>
      </ClientOnly>
    </nav>
    
    <!-- Мобильное меню (бургер через UDropdownMenu) -->
    <ClientOnly>
      <div class="sm:hidden">
        <UDropdownMenu
          v-if="isInitialized"
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
            :loading="isLoading"
            @click.stop
          />
        </UDropdownMenu>
        <div v-else class="w-10 h-10 bg-amber-400 rounded"></div>
      </div>
    </ClientOnly>

    <!-- Модалка входа -->
    <UserLoginModal 
      v-model="showLoginModal"
      @success="handleLoginSuccess"  
    />
  </header>
</template>