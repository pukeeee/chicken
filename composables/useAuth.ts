// composables/useAuth.ts
interface User {
    id: number
    phone: string
    name?: string
    email?: string
    createdAt: string
    updatedAt: string
  }
  
  interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
  }
  
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
     * Отправка кода подтверждения на номер телефона
     */
    const sendVerificationCode = async (phone: string): Promise<void> => {
      try {
        authState.isLoading = true
        
        // Временная заглушка - генерируем случайный 4-значный код
        const code = Math.floor(1000 + Math.random() * 9000).toString()
        
        // В реальном приложении здесь будет API запрос
        // const response = await $fetch('/api/auth/send-code', {
        //   method: 'POST',
        //   body: { phone }
        // })
        
        // Временно логируем код в консоль
        console.log(`🔐 Verification code for ${phone}: ${code}`)
        
        // Сохраняем код в localStorage для проверки (временное решение)
        if (process.client) {
          localStorage.setItem('verification_code', code)
          localStorage.setItem('verification_phone', phone)
          localStorage.setItem('code_sent_at', Date.now().toString())
        }
        
        // Имитируем задержку сети
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error('Error sending verification code:', error)
        throw new Error('Не вдалося надіслати код підтвердження')
      } finally {
        authState.isLoading = false
      }
    }
  
    /**
     * Проверка кода и вход/регистрация пользователя
     */
    const verifyCodeAndLogin = async (phone: string, code: string): Promise<User> => {
      try {
        authState.isLoading = true
        
        // Временная проверка кода из localStorage
        if (process.client) {
          const storedCode = localStorage.getItem('verification_code')
          const storedPhone = localStorage.getItem('verification_phone')
          const codeSentAt = localStorage.getItem('code_sent_at')
          
          // Проверяем, что код не истек (5 минут)
          const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
          if (codeSentAt && parseInt(codeSentAt) < fiveMinutesAgo) {
            throw new Error('Код підтвердження застарів')
          }
          
          // Временно принимаем любой 4-значный код для разработки
          if (code.length !== 4 || !/^\d{4}$/.test(code)) {
            throw new Error('Невірний код підтвердження')
          }
          
          // В реальном приложении здесь будет API запрос
          // const response = await $fetch('/api/auth/verify-code', {
          //   method: 'POST',
          //   body: { phone, code }
          // })
          
          // Создаем мок пользователя
          const mockUser: User = {
            id: Math.floor(Math.random() * 1000000),
            phone: phone,
            name: `User ${phone.slice(-4)}`,
            email: `user${phone.slice(-4)}@example.com`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          
          // Имитируем задержку сети
          await new Promise(resolve => setTimeout(resolve, 1500))
          
          // Обновляем состояние
          authState.user = mockUser
          authState.isAuthenticated = true
          
          // Сохраняем данные пользователя
          if (process.client) {
            localStorage.setItem('auth_user', JSON.stringify(mockUser))
            localStorage.setItem('auth_token', `mock_token_${mockUser.id}`)
            
            // Очищаем временные данные кода
            localStorage.removeItem('verification_code')
            localStorage.removeItem('verification_phone')
            localStorage.removeItem('code_sent_at')
          }
          
          return mockUser
        }
        
        throw new Error('Помилка при перевірці коду')
        
      } catch (error) {
        console.error('Error verifying code:', error)
        throw error instanceof Error ? error : new Error('Невірний код підтвердження')
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
        
        // В реальном приложении здесь будет API запрос
        // await $fetch('/api/auth/logout', { method: 'POST' })
        
        // Очищаем состояние
        authState.user = null
        authState.isAuthenticated = false
        
        // Очищаем localStorage
        if (process.client) {
          localStorage.removeItem('auth_user')
          localStorage.removeItem('auth_token')
        }
        
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
      if (!process.client) return
      
      try {
        authState.isLoading = true
        
        const storedUser = localStorage.getItem('auth_user')
        const storedToken = localStorage.getItem('auth_token')
        
        if (storedUser && storedToken) {
          // В реальном приложении здесь будет проверка токена на сервере
          // const response = await $fetch('/api/auth/verify-token', {
          //   headers: { Authorization: `Bearer ${storedToken}` }
          // })
          
          const user = JSON.parse(storedUser) as User
          authState.user = user
          authState.isAuthenticated = true
        }
        
      } catch (error) {
        console.error('Error checking auth:', error)
        // Очищаем невалидные данные
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_token')
      } finally {
        authState.isLoading = false
      }
    }
  
    /**
     * Обновление данных пользователя
     */
    const updateUser = async (userData: Partial<User>): Promise<User> => {
      if (!authState.user) {
        throw new Error('Користувач не авторизований')
      }
      
      try {
        authState.isLoading = true
        
        // В реальном приложении здесь будет API запрос
        // const response = await $fetch(`/api/users/${authState.user.id}`, {
        //   method: 'PATCH',
        //   body: userData
        // })
        
        const updatedUser: User = {
          ...authState.user,
          ...userData,
          updatedAt: new Date().toISOString()
        }
        
        authState.user = updatedUser
        
        // Обновляем в localStorage
        if (process.client) {
          localStorage.setItem('auth_user', JSON.stringify(updatedUser))
        }
        
        return updatedUser
        
      } catch (error) {
        console.error('Error updating user:', error)
        throw new Error('Не вдалося оновити дані користувача')
      } finally {
        authState.isLoading = false
      }
    }
  
    // Инициализация при монтировании
    if (process.client) {
      checkAuth()
    }
  
    return {
      // State
      user: readonly(user),
      isAuthenticated: readonly(isAuthenticated),
      isLoading: readonly(isLoading),
      
      // Actions
      sendVerificationCode,
      verifyCodeAndLogin,
      logout,
      checkAuth,
      updateUser
    }
  }