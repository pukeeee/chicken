<script setup>
import adminMiddleware from '~/middlewares/admin'

definePageMeta({
  layout: 'admin',
  middleware: [adminMiddleware]
})
</script>

<template>
<div>
    <h1 >ADMINKA suka</h1>
</div>
</template>