<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" @click.self="close">
    <div class="relative bg-white border-2 border-pink-300 rounded-2xl shadow-2xl max-w-lg w-full p-6 flex flex-col md:flex-row gap-6 animate-fade-in">
      <!-- Кнопка закрытия -->
      <button
        class="absolute top-4 right-4 text-pink-500 hover:text-pink-700 text-3xl font-bold transition"
        @click="close"
        aria-label="Закрыть"
      >&times;</button>
      <!-- Картинка -->
      <img
        class="w-40 h-60 object-cover object-top rounded-xl border border-pink-200 shadow md:w-40 md:h-60 w-full max-w-xs"
        :src="imgSrc"
        alt="Курочка гриль"
      />
      <!-- Информация -->
      <div class="flex-1 flex flex-col justify-between">
        <div>
          <h2 class="text-3xl font-extrabold text-pink-700 mb-2">Курочка №{{ id }}</h2>
          <p class="text-gray-700 mb-4">
            Соковита курочка гриль, приготовлена за авторським рецептом. Подається з соусом та овочами.
          </p>
          <div class="text-lg font-semibold text-pink-600 mb-4">Ціна: <b>200₴</b></div>
        </div>
        <UButton
          class="bg-pink-500 text-white font-bold rounded-lg px-8 py-3 shadow hover:bg-pink-600 transition w-full"
          icon="i-heroicons-shopping-cart"
        >
          До кошика
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  id: [String, Number]
})
const emit = defineEmits(['close'])
function close() {
  emit('close')
}
const imgSrc = '/menu.jpg'
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: scale(0.96);}
  to { opacity: 1; transform: scale(1);}
}
.animate-fade-in {
  animation: fade-in 0.25s cubic-bezier(.4,0,.2,1);
}
</style>
