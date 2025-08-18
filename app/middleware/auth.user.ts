/**
 * Middleware для защиты пользовательских роутов
 * Упрощен благодаря использованию useAuthGuard в компонентах
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Проверяем только пользовательские роуты
  if (!to.path.startsWith('/users')) return

  // Быстрая проверка наличия токена
  const userToken = useCookie('user_token')
  if (!userToken.value) {
    return navigateTo('/')
  }

  // Полная проверка будет выполнена в useAuthGuard на странице
})