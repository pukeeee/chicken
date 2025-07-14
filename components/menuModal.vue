<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal-dialog">
      <button class="btn-close" @click="close">&times;</button>
      <div class="modal-body">
        <img class="modal-img" :src="imgSrc" alt="Курочка гриль" />
        <div class="modal-info">
          <h2>Курочка №{{ id }}</h2>
          <p class="modal-desc">Соковита курочка гриль, приготовлена за авторським рецептом. Подається з соусом та овочами.</p>
          <div class="modal-price">Ціна: <b>200₴</b></div>
          <button class="btn btn-warning w-100 mt-3">До кошика</button>
        </div>
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
// Для примера — путь к картинке. Можно сделать динамическим по id!
const imgSrc = '/menu.jpg'
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  backdrop-filter: blur(2px);
}
.modal-dialog {
  background: #fff;
  border-radius: 16px;
  padding: 2rem 2rem 1.5rem 2rem;
  min-width: 320px;
  max-width: 600px;
  width: 100%;
  position: relative;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
}
.btn-close {
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  z-index: 2;
  background: transparent;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  line-height: 1;
  color: #888;
  transition: color 0.2s;
}
.btn-close:hover {
  color: #000;
}
.modal-body {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  align-items: flex-start;
}
.modal-img {
  width: 180px;
  height: 180px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  background: #f8f8f8;
}
.modal-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.modal-desc {
  margin: 1rem 0 0.5rem 0;
  color: #444;
}
.modal-price {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}
@media (max-width: 600px) {
  .modal-body {
    flex-direction: column;
    align-items: center;
  }
  .modal-img {
    width: 100%;
    height: 180px;
  }
}
</style>
