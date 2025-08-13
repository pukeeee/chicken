/**
 * Composable для работы с авторизацией через Pinia store
 * Предоставляет удобный интерфейс для компонентов
 */
export const useAuth = () => {
  const authStore = useAuthStore()

  return {
    // Состояние (реактивные ссылки на store)
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isLoading: computed(() => authStore.isLoading),
    isInitialized: computed(() => authStore.isInitialized),
    
    // Геттеры
    isLoggedIn: computed(() => authStore.isLoggedIn),
    userName: computed(() => authStore.userName),
    userPhone: computed(() => authStore.userPhone),
    needsAuth: computed(() => authStore.needsAuth),
    
    // Хелперы валидации
    isPhoneValid: authStore.isPhoneValid,
    isCodeValid: authStore.isCodeValid,
    formatPhone: authStore.formatPhone,
    
    // Основные действия
    initialize: authStore.initialize,
    checkAuth: authStore.checkAuth,
    sendVerificationCode: authStore.sendVerificationCode,
    verifyCodeAndLogin: authStore.verifyCodeAndLogin,
    logout: authStore.logout,
    updateUser: authStore.updateUser,
    clearAuth: authStore.clearAuth,
    hasRole: authStore.hasRole
  }
}