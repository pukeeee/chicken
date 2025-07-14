<template>
  <div>
    <Navbar />
    <Card @open="openModal" />
    <MenuModal v-if="showModal" :id="modalId" @close="closeModal" />
  </div>
</template>

<script setup>
import Navbar from '~/components/navbar.vue'
import Card from '~/components/card.vue'
import MenuModal from '~/components/menuModal.vue'
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const router = useRouter()

const showModal = computed(() => !!route.query.modal)
const modalId = computed(() => route.query.modal)

function openModal(id) {
  router.push({ query: { modal: id } })
}
function closeModal() {
  router.push({ query: {} })
}
</script>