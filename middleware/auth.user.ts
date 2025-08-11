export default defineNuxtRouteMiddleware(async (to) => {
  // Проверяем только пользовательские роуты
  if (!to.path.startsWith('/users')) return

  const { isAuthenticated, checkAuth } = useAuth()

  // Если уже проверена авторизация и пользователь авторизован
  if (isAuthenticated.value) return

  // Быстрая проверка наличия токена
  const userToken = useCookie('user_token')
  if (!userToken.value) {
    return navigateTo('/')
  }

  // Проверяем авторизацию (с кэшированием)
  if (import.meta.client) {
    try {
      await checkAuth()
      if (!isAuthenticated.value) {
        return navigateTo('/')
      }
    } catch (error) {
      return navigateTo('/')
    }
  }
})
