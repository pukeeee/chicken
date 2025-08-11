export default defineNuxtRouteMiddleware(async (to) => {
  // Проверяем только пользовательские роуты
  if (!to.path.startsWith('/users')) {
    return
  }

  // Получаем состояние авторизации
  const { isAuthenticated, checkAuth } = useAuth()
  
  // Проверяем авторизацию при переходе на защищенную страницу
  if (import.meta.client) {
    // На клиенте сначала проверяем текущее состояние
    if (!isAuthenticated.value) {
      // Пытаемся восстановить сессию из cookie
      await checkAuth()
      
      // Если после проверки пользователь все еще не авторизован
      if (!isAuthenticated.value) {
        return navigateTo('/')
      }
    }
  } else {
    // На сервере проверяем наличие токена в cookie
    const tokenCookie = useCookie('user_token')
    if (!tokenCookie.value) {
      return navigateTo('/')
    }
    
    // Дополнительно проверяем токен на сервере через новый API
    try {
      await $fetch('/api/users/', {
        method: 'GET'
      })
    } catch (error) {
      // Если токен недействителен, редиректим
      return navigateTo('/')
    }
  }
})
