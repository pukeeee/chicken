<!-- <template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <a class="navbar-brand d-flex align-items-center" href="#">
        <img src="/logo.png" alt="Курочка гриль" width="40" class="me-2" />
        Курочка Гриль
      </a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Перемкнути навігацію"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a class="nav-link active" aria-current="page" href="#">Меню</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Контакти</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Інформація</a>
          </li>
        </ul>
        <div class="d-flex">
          <button class="btn btn-outline-light me-2" type="button">Увійти</button>
          <button class="btn btn-warning" type="button">Зареєструватися</button>
        </div>
      </div>
    </div>
  </nav>
</template> -->
<template>
  <header class="h-15 flex justify-between items-center px-4 py-2 bg-pink-300 shadow-md">
    <h1 class="text-xl font-bold text-white flex items-center gap-2">
      <img src="/logo.png" alt="Лого" class="w-10 h-10 object-contain" />
      Кур0чка
    </h1>
    <nav class="flex gap-4">
      <div class="mr-4">
        <UButton to="/" class="bg-pink-500 mr-4 hover:bg-pink-600">Меню</UButton>
        <UButton to="/" class="bg-pink-500 hover:bg-pink-600">Доставка</UButton>
      </div>
      <UButton to="/cart" class="bg-pink-500 hover:bg-pink-600" icon="i-heroicons-shopping-cart" />
      <UButton to="/signup" class="bg-pink-500 hover:bg-pink-600">Увійти</UButton>
    </nav>
  </header>
</template>