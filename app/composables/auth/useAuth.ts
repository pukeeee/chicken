import { useAuthStore } from "~/stores/auth"
import { useAuthValidation } from "./useAuthValidation"

/**
 * Главный композабл для работы с авторизацией
 * Предоставляет простой API для компонентов
 */
export const useAuth = () => {
  const authStore = useAuthStore()
  const { normalizePhone } = useAuthValidation()

  // Реактивные свойства из стора
  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isLoading = computed(() => authStore.isLoading)
  const isInitialized = computed(() => authStore.isInitialized)

  // Удобные геттеры
  const userName = computed(() => authStore.userName)
  const userPhone = computed(() => authStore.userPhone)
  const needsAuth = computed(() => authStore.needsAuth)

  /**
   * Отправка кода подтверждения
   */
  const sendVerificationCode = async (phone: string) => {
    const normalizedPhone = normalizePhone(phone)
    return await authStore.sendVerificationCode(normalizedPhone)
  }

  /**
   * Вход в систему с кодом
   */
  const login = async (phone: string, code: string) => {
    const normalizedPhone = normalizePhone(phone)
    return await authStore.verifyCodeAndLogin(normalizedPhone, code)
  }

  /**
   * Выход из системы
   */
  const logout = async () => {
    await authStore.logout()
  }

  /**
   * Обновление профиля пользователя
   */
  const updateProfile = async (userData: { name?: string; email?: string | null; phone?: string }) => {
    return await authStore.updateUser(userData)
  }

  /**
   * Инициализация (вызывается в плагине)
   */
  const initialize = async () => {
    if (!authStore.isInitialized) {
      await authStore.initialize()
    }
  }

  /**
   * Проверка роли пользователя
   */
  const hasRole = (role: string): boolean => {
    return authStore.hasRole(role)
  }

  /**
   * Принудительная проверка авторизации
   */
  const checkAuth = async () => {
    return await authStore.checkAuth()
  }

  /**
   * Очистка состояния авторизации
   */
  const clearAuth = () => {
    authStore.clearAuth()
  }

  return {
    // Состояние
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    isLoading: readonly(isLoading),
    isInitialized: readonly(isInitialized),
    
    // Геттеры
    userName: readonly(userName),
    userPhone: readonly(userPhone),
    needsAuth: readonly(needsAuth),
    
    // Действия
    sendVerificationCode,
    login,
    logout,
    updateProfile,
    initialize,
    checkAuth,
    clearAuth,
    
    // Утилиты
    hasRole
  }
}