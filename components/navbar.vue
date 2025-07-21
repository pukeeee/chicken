<script setup lang="ts">
import { ref } from 'vue'
import type { DropdownMenuItem } from '@nuxt/ui'

const dropdownOpen = ref(false)

const items = ref<DropdownMenuItem[]>([
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
    to: '/signup'
  }
])

</script>

<template>
  <header class="h-15 flex justify-between items-center px-4 py-2 bg-pink-300 shadow-md">
    <h1 class="text-xl font-bold text-white flex items-center gap-2">
      <img src="/logo.png" alt="Лого" class="w-10 h-10 object-contain" />
      Кур0чка
    </h1>
    <!-- Десктоп меню -->
    <nav class="hidden sm:flex gap-4">
      <div class="mr-4">
        <UButton to="/" class="bg-pink-500 mr-4 hover:bg-pink-600">Меню</UButton>
        <UButton to="/delivery" class="bg-pink-500 hover:bg-pink-600">Доставка</UButton>
      </div>
      <UButton to="/cart" class="bg-pink-500 hover:bg-pink-600" icon="i-heroicons-shopping-cart" />
      <UButton to="/signup" class="bg-pink-500 hover:bg-pink-600">Увійти</UButton>
    </nav>
    <!-- Мобильное меню (бургер через UDropdownMenu) -->
    <ClientOnly>
      <div class="sm:hidden">
        <UDropdownMenu
          v-model:open="dropdownOpen"
          :items="items"
          :content="{ align: 'end', side: 'bottom', sideOffset: 8 }"
          :ui="{
            content: 'bg-pink-100 text-pink-900',
            item: 'hover:bg-pink-200',
            itemLeadingIcon: 'text-pink-500'
          }"
          :overlay="false"
        >
          <UButton
            icon="i-lucide-menu"
            class="bg-pink-500 hover:bg-pink-600 text-white"
            variant="solid"
            @click.stop
          />
        </UDropdownMenu>
      </div>
    </ClientOnly>
  </header>
</template>