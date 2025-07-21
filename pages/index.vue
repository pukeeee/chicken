<script setup lang="ts">
import { ref, onMounted, computed, shallowRef } from 'vue'
import type { TabsItem } from '@nuxt/ui'
import Menu from '~/components/menu.vue'
import MenuModal from '~/components/menuModal.vue'
import { useRoute, useRouter } from 'vue-router'
import type { Product, Category } from '~/dto/types'

const route = useRoute()
const router = useRouter()

const showModal = computed(() => !!route.query.modal)
const modalId = computed(() => {
  const val = route.query.modal
  if (Array.isArray(val)) return val[0] ?? undefined
  if (val === null || val === undefined) return undefined
  return val as string | number | undefined
})

function openModal(id: number) {
  router.push({ query: { modal: id } })
}
function closeModal() {
  router.push({ query: {} })
}

const categories = ref<Category[]>([])
const tabItems = shallowRef<TabsItem[]>([])
const selectedTab = ref(0)

onMounted(async () => {
  const { data } = await $fetch('/api/menu')
  categories.value = data
  tabItems.value = data.map((cat: any) => ({
    label: cat.name
  }))
  selectedTab.value = 0
})
</script>

<template>
  <div>
    <UTabs
      v-if="tabItems.length"
      v-model="selectedTab"
      color="neutral"
      variant="link"
      :content="false"
      class="w-full"
      :items="tabItems"
    />
    <Menu
      v-if="categories[selectedTab]"
      :items="categories[selectedTab].products"
      @open="openModal"
    />
    <MenuModal v-if="showModal" :id="modalId" @close="closeModal" />
  </div>
</template>