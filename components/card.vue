<template>
  <div class="container mt-4">
    <div class="row row-cols-1 row-cols-md-3 g-4">
      <div class="col" v-for="n in 6" :key="n">
        <div class="card h-100" @click="handleClick(n)" style="cursor:pointer;">
          <img src="/menu.jpg" class="card-img-top" alt="Курочка гриль" />
          <div class="card-body">
            <h5 class="card-title">Курочка №{{ n }}</h5>
            <p class="card-text">Соковита курочка гриль. Ціна: 200₴</p>
          </div>
          <div class="card-footer">
            <button class="btn btn-warning w-100">До кошика</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['open'])
function handleClick(id) {
  emit('open', id)
}
</script>