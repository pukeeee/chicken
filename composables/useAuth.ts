import type { User, AuthState, PublicUser } from '~/types/auth'

// Глобальное состояние аутентификации
const authState = reactive<AuthState>({
  user: null,
  isAuthenticated: false,
  isLoading: false
})

// Добавляем отладку для отслеживания изменений состояния
// watch(() => authState.isAuthenticated, (newValue, oldValue) => {
//   console.log('🔄 authState.isAuthenticated changed from', oldValue, 'to', newValue)
// })

// watch(() => authState.user, (newValue, oldValue) => {
//   console.log('🔄 authState.user changed from', oldValue?.phone || 'null', 'to', newValue?.phone || 'null')
// })

export const useAuth = () => {
  const toast = useToast()

  // Геттеры состояния
  const user = computed(() => {
    // console.log('🔄 computed user called, returning:', authState.user?.phone || 'null')
    return authState.user
  })
  const isAuthenticated = computed(() => {
    // console.log('🔄 computed isAuthenticated called, returning:', authState.isAuthenticated)
    return authState.isAuthenticated
  })
  const isLoading = computed(() => authState.isLoading)

  /**
   * Валидация номера телефона (украинский формат)
   */
  const isPhoneValid = (phone: string): boolean => {
    const phoneRegex = /^\+380\d{9}$/
    return phoneRegex.test(phone)
  }

  /**
   * Валидация кода подтверждения
   */
  const isCodeValid = (code: string): boolean => {
    return code.length === 6 && /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/.test(code)
  }

  /**
   * Форматирование номера телефона
   */
  const formatPhone = (value: string): string => {
    // Удаляем все нецифровые символы
    let digits = value.replace(/\D/g, '')
    
    // Если начинается с 380, добавляем +
    if (digits.startsWith('380')) {
      digits = '+' + digits
    }
    // Если начинается с 80, заменяем на +380
    else if (digits.startsWith('80')) {
      digits = '+3' + digits
    }
    // Если начинается с 0, заменяем на +380
    else if (digits.startsWith('0')) {
      digits = '+38' + digits
    }
    // Если только цифры без кода страны
    else if (digits.length <= 9 && !digits.startsWith('380')) {
      digits = '+380' + digits
    }
    
    return digits.slice(0, 13) // Максимум +380XXXXXXXXX
  }

  /**
   * Отправка кода подтверждения на номер телефона
   */
  const sendVerificationCode = async (phone: string): Promise<{ success: boolean; step?: string }> => {
    if (!isPhoneValid(phone)) {
      toast.add({
        title: 'Помилка',
        description: 'Введіть коректний номер телефону',
        color: 'error'
      })
      return { success: false }
    }

    try {
      authState.isLoading = true
      
      const data = await $fetch('/api/users/verify', {
        method: 'POST',
        body: {phone}
      })
      
      toast.add({
        title: 'Успішно',
        description: `Код підтвердження надіслано на номер ${phone}`,
        color: 'success'
      })
      
      return { success: true, step: 'code' }
      
    } catch (error) {
      console.error('Error sending verification code:', error)
      toast.add({
        title: 'Помилка',
        description: 'Не вдалося надіслати код підтвердження',
        color: 'error'
      })
      return { success: false }
    } finally {
      authState.isLoading = false
    }
  }

  /**
   * Проверка кода и вход/регистрация пользователя
   */
  const verifyCodeAndLogin = async (phone: string, code: string): Promise<{ success: boolean; user?: User }> => {
    if (!isCodeValid(code)) {
      toast.add({
        title: 'Помилка',
        description: 'Код має містити 6 символів',
        color: 'error'
      })
      return { success: false }
    }

    try {
      authState.isLoading = true

      const data = await $fetch('/api/users/login',{
        method: 'POST',
        body: {phone, code}
      })
      
      // Обновляем состояние
      authState.user = data.user
      authState.isAuthenticated = true
      
      toast.add({
        title: 'Успішно',
        description: 'Ви увійшли в систему',
        color: 'success'
      })
      
      return { success: true }
      
    } catch (error) {
      console.error('Error verifying code:', error)
      toast.add({
        title: 'Помилка',
        description: 'Невірний код підтвердження',
        color: 'error'
      })
      return { success: false }
    } finally {
      authState.isLoading = false
    }
  }

  /**
   * Выход из системы
   */
  const logout = async (): Promise<void> => {
    try {
      authState.isLoading = true
      
      // Отправляем запрос на сервер для удаления токена
      await $fetch('/api/users/logout', {
        method: 'DELETE'
      })

      // Очищаем состояние
      authState.user = null
      authState.isAuthenticated = false
      
      // console.log('🚪 User logged out')
      
      toast.add({
        title: 'Успішно',
        description: 'Ви вийшли з системи',
        color: 'success'
      })

      // TODO проверка чтобы не было редиректа если юзер не в личном кабинете
      // Редирект на главную страницу
      await navigateTo('/')
      
    } catch (error) {
      // console.error('Error during logout:', error)
      toast.add({
        title: 'Помилка',
        description: 'Помилка при виході з системи',
        color: 'error'
      })
    } finally {
      authState.isLoading = false
    }
  }

  // Интерфейс для ответа API проверки авторизации
  interface CheckAuthResponse {
    success: boolean
    user: PublicUser
  }

  /**
   * Проверка токена и восстановление сессии
   */
  const checkAuth = async (): Promise<void> => {
    try {
      // console.log('🔍 checkAuth debug:')
      // console.log('- Starting auth check')
      
      authState.isLoading = true
      
      // Токен будет автоматически отправлен в httpOnly cookie
      const data = await $fetch<CheckAuthResponse>('/api/users/', {
        method: 'GET'
      })
      
      // console.log('🔍 API response data:', data)
      
      // Проверяем успешность ответа
      if (data.success && data.user) {
        // Восстанавливаем состояние пользователя
        authState.user = data.user
        authState.isAuthenticated = true
        
        // console.log('✅ Auth restored for user:', data.user.phone)
        // console.log('✅ authState.isAuthenticated set to:', authState.isAuthenticated)
      } else {
        // Если ответ неуспешный, очищаем состояние
        authState.user = null
        authState.isAuthenticated = false
        
        // console.log('❌ Auth check returned false success')
      }
      
    } catch (error: any) {
      // console.error('❌ Auth check failed:', error)
      
      // Очищаем состояние при ошибке
      authState.user = null
      authState.isAuthenticated = false
      
      // console.log('❌ Auth state cleared due to error')
    } finally {
      authState.isLoading = false
      // console.log('🔍 Final authState.isAuthenticated:', authState.isAuthenticated)
    }
  }

  /**
   * Обновление данных пользователя
   */
  const updateUser = async (userData: Partial<PublicUser>): Promise<PublicUser | null> => {
    if (!authState.user) {
      toast.add({
        title: 'Помилка',
        description: 'Користувач не авторизований',
        color: 'error'
      })
      return null
    }
    
    try {
      authState.isLoading = true
      
      // Отправляем данные на сервер
      const data = await $fetch('/api/users/', {
        method: 'PATCH',
        body: {
          name: userData.name,
          email: userData.email
        }
      })
      
      // Обновляем состояние пользователя
      authState.user = data.user
      
      toast.add({
        title: 'Успішно',
        description: 'Дані користувача оновлено',
        color: 'success'
      })
      
      return data.user
      
    } catch (error) {
      console.error('Error updating user:', error)
      toast.add({
        title: 'Помилка',
        description: 'Не вдалося оновити дані користувача',
        color: 'error'
      })
      return null
    } finally {
      authState.isLoading = false
    }
  }

  return {
    // State
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    isLoading: readonly(isLoading),
    
    // Validation helpers
    isPhoneValid,
    isCodeValid,
    formatPhone,
    
    // Actions
    sendVerificationCode,
    verifyCodeAndLogin,
    logout,
    checkAuth,
    updateUser
  }
}