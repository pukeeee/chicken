export default defineNuxtRouteMiddleware(async (to) => {
  // Проверяем только пользовательские роуты
  if (!to.path.startsWith('/users')) return

  const authStore = useAuthStore()
  
  // Инициализируем store если еще не инициализирован
  if (!authStore.isInitialized) {
    await authStore.initialize()
  }

  // Если не авторизован после инициализации - редиректим
  if (!authStore.isAuthenticated) {
    return navigateTo('/')
  }
})
