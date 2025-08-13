<script setup>
    import Header from '~/components/header.vue'
    import Footer from '~/components/footer.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-1">
      <NuxtPage />
    </main>
    <Footer />
  </div>
</template>