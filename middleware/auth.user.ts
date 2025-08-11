export default defineNuxtRouteMiddleware(async (to) => {
  // Проверяем только пользовательские роуты
  if (!to.path.startsWith('/users')) return

  const { isAuthenticated, checkAuth } = useAuth()

  // Если уже авторизован — пропускаем
  if (isAuthenticated.value) return

  // Быстрая проверка наличия токена
  const userToken = useCookie('user_token')
  if (!userToken.value) {
    return navigateTo('/')
  }

  // Если токен есть, но состояние ещё не установлено — проверяем сессию
  try {
    await checkAuth()
    if (!isAuthenticated.value) {
      return navigateTo('/')
    }
  } catch (error) {
    return navigateTo('/')
  }
})
