import type { User, AuthState } from '~/types/auth'

// Глобальное состояние аутентификации
const authState = reactive<AuthState>({
  user: null,
  isAuthenticated: false,
  isLoading: false
})

export const useAuth = () => {
  const toast = useToast()

  // Геттеры состояния
  const user = computed(() => authState.user)
  const isAuthenticated = computed(() => authState.isAuthenticated)
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
    return code.length === 4 && /^\d{4}$/.test(code)
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
      
      // Генерируем код (серверная логика, временно здесь)
      const code = Math.floor(1000 + Math.random() * 9000).toString()
      
      // Логируем код в консоль (временное решение)
      console.log(`🔐 Verification code for ${phone}: ${code}`)
      
      // Имитируем задержку
      await new Promise(resolve => setTimeout(resolve, 1000))
      
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
        description: 'Код має містити 4 цифри',
        color: 'error'
      })
      return { success: false }
    }

    try {
      authState.isLoading = true
      
      // Имитируем задержку
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Просто логируем успешный вход
      console.log(`✅ User with phone ${phone} successfully logged in`)
      
      // Обновляем состояние (минимально)
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
      
      // Очищаем состояние
      authState.user = null
      authState.isAuthenticated = false
      
      console.log('🚪 User logged out')
      
      toast.add({
        title: 'Успішно',
        description: 'Ви вийшли з системи',
        color: 'success'
      })
      
    } catch (error) {
      console.error('Error during logout:', error)
      toast.add({
        title: 'Помилка',
        description: 'Помилка при виході з системи',
        color: 'error'
      })
    } finally {
      authState.isLoading = false
    }
  }

  /**
   * Проверка токена и восстановление сессии
   */
  const checkAuth = async (): Promise<void> => {
    // Заглушка - ничего не делаем
    console.log('checkAuth called - stub implementation')
  }

  /**
   * Обновление данных пользователя
   */
  const updateUser = async (userData: Partial<User>): Promise<User | null> => {
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
      
      // Обновляем только в памяти
      const updatedUser: User = {
        ...authState.user,
        ...userData,
        updatedAt: new Date().toISOString()
      }
      
      authState.user = updatedUser
      
      toast.add({
        title: 'Успішно',
        description: 'Дані користувача оновлено',
        color: 'success'
      })
      
      return updatedUser
      
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