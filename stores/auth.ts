import { defineStore } from 'pinia'
import type { User, AuthState, PublicUser } from '~/types/auth'

interface AuthActions {
  isPhoneValid(phone: string): boolean;
  isCodeValid(code: string): boolean;
  formatPhone(value: string): string;
  fetchUser(): Promise<void>;
  sendVerificationCode(phone: string): Promise<{ success: boolean; step?: string }>;
  verifyCodeAndLogin(phone: string, code: string): Promise<{ success: boolean; user?: User }>;
  logout(): Promise<void>;
  updateUser(userData: Partial<PublicUser>): Promise<PublicUser | null>;
  clearAuth(): void;
  hasRole(role: string): boolean;
}

export const useAuthStore = defineStore<string, AuthState, any, AuthActions>('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false // Новое поле для отслеживания инициализации
  }),

  getters: {
    // Геттеры для удобства
    isLoggedIn: (state: AuthState) => state.isAuthenticated && !!state.user,
    userName: (state: AuthState) => state.user?.name || state.user?.phone || 'Користувач',
    userPhone: (state: AuthState) => state.user?.phone || null,
    needsAuth: (state: AuthState) => !state.isAuthenticated && state.isInitialized,
  },

  actions: {
    // --- Утилиты валидации ---
    isPhoneValid(phone: string): boolean {
      const phoneRegex = /^\+380\d{9}$/
      return phoneRegex.test(phone)
    },

    isCodeValid(code: string): boolean {
      return code.length === 6 && /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/.test(code)
    },

    formatPhone(value: string): string {
      let digits = value.replace(/\D/g, '')
      
      if (digits.startsWith('380')) {
        digits = '+' + digits
      } else if (digits.startsWith('80')) {
        digits = '+3' + digits
      } else if (digits.startsWith('0')) {
        digits = '+38' + digits
      } else if (digits.length <= 9 && !digits.startsWith('380')) {
        digits = '+380' + digits
      }
      
      return digits.slice(0, 13)
    },

    // --- Инициализация состояния из cookie ---
    async fetchUser(): Promise<void> {
      // Если состояние уже инициализировано (например, на сервере), не делаем ничего.
      // Это предотвращает сброс состояния на клиенте, где HttpOnly cookie недоступен.
      if (this.isInitialized) {
        return
      }

      const userToken = useCookie('user_token')

      // Если токена нет, сессия не активна
      if (!userToken.value) {
        this.isAuthenticated = false
        this.user = null
        this.isInitialized = true
        return
      }

      // Если токен есть, но мы уже авторизованы (например, после логина), не делаем лишний запрос
      if (this.isAuthenticated && this.user) {
        this.isInitialized = true
        return
      }

      try {
        this.isLoading = true
        const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
        
        const data = await $fetch<{ success: boolean, user: PublicUser }>('/api/users/', {
          method: 'GET',
          headers,
        })
        
        if (data.success && data.user) {
          this.user = data.user
          this.isAuthenticated = true
        } else {
          this.clearAuth()
        }
        
      } catch (error: any) {
        console.error('Auth check failed, clearing session:', error.message)
        this.clearAuth() // Очищаем cookie, если токен невалидный
      } finally {
        this.isLoading = false
        this.isInitialized = true
      }
    },

    // --- Отправка кода ---
    async sendVerificationCode(phone: string): Promise<{ success: boolean; step?: string }> {
      if (!this.isPhoneValid(phone)) {
        const toast = useToast()
        toast.add({
          title: 'Помилка',
          description: 'Введіть коректний номер телефону',
          color: 'error'
        })
        return { success: false }
      }

      try {
        this.isLoading = true
        
        await $fetch('/api/users/verify', {
          method: 'POST',
          body: { phone }
        })
        
        const toast = useToast()
        toast.add({
          title: 'Успішно',
          description: `Код підтвердження надіслано на номер ${phone}`,
          color: 'success'
        })
        
        return { success: true, step: 'code' }
        
      } catch (error) {
        console.error('Error sending verification code:', error)
        const toast = useToast()
        toast.add({
          title: 'Помилка',
          description: 'Не вдалося надіслати код підтвердження',
          color: 'error'
        })
        return { success: false }
      } finally {
        this.isLoading = false
      }
    },

    // --- Вход ---
    async verifyCodeAndLogin(phone: string, code: string): Promise<{ success: boolean; user?: User }> {
      if (!this.isCodeValid(code)) {
        const toast = useToast()
        toast.add({
          title: 'Помилка',
          description: 'Код має містити 6 символів',
          color: 'error'
        })
        return { success: false }
      }

      try {
        this.isLoading = true

        const data = await $fetch<{user: User}>('/api/users/login', {
          method: 'POST',
          body: { phone, code }
        })
        
        // Устанавливаем состояние напрямую без дополнительного запроса
        this.user = {
          id: data.user.id,
          phone: data.user.phone,
          name: data.user.name,
          email: data.user.email,
          createdAt: data.user.createdAt.toString()
        }
        this.isAuthenticated = true

        const toast = useToast()
        toast.add({
          title: 'Успішно!',
          description: 'Ви ввійшли у свій акаунт.',
          color: 'success'
        })

        return { success: true, user: data.user }
        
      } catch (error) {
        console.error('Error verifying code:', error)
        const toast = useToast()
        toast.add({
          title: 'Помилка',
          description: 'Невірний код підтвердження',
          color: 'error'
        })
        return { success: false }
      } finally {
        this.isLoading = false
      }
    },

    // --- Выход ---
    async logout(): Promise<void> {
      await $fetch('/api/users/logout', { method: 'DELETE' })
      this.clearAuth() // Очищаем состояние и cookie

      const toast = useToast()
      toast.add({
        title: 'Ви вийшли',
        description: 'Ви успішно вийшли зі свого акаунту.',
        color: 'info'
      })

      await navigateTo('/')
    },

    // --- Обновление пользователя ---
    async updateUser(userData: Partial<PublicUser>): Promise<PublicUser | null> {
      if (!this.user) {
        const toast = useToast()
        toast.add({
          title: 'Помилка',
          description: 'Користувач не авторизований',
          color: 'error'
        })
        return null
      }
      
      try {
        this.isLoading = true
        
        const data = await $fetch<{user: PublicUser}>('/api/users/', {
          method: 'PATCH',
          body: {
            name: userData.name,
            email: userData.email
          }
        })
        
        // Обновляем состояние напрямую
        this.user = data.user

        const toast = useToast()
        toast.add({
          title: 'Збережено',
          description: 'Ваші дані успішно оновлено.',
          color: 'success'
        })

        return data.user
        
      } catch (error) {
        console.error('Error updating user:', error)
        const toast = useToast()
        toast.add({
          title: 'Помилка',
          description: 'Не вдалося оновити дані користувача',
          color: 'error'
        })
        return null
      } finally {
        this.isLoading = false
      }
    },

    // --- Очистка состояния ---
    clearAuth(): void {
      this.user = null
      this.isAuthenticated = false
      
      const userToken = useCookie('user_token')
      userToken.value = null
    },

    // --- Проверка роли (для будущего расширения) ---
    hasRole(role: string): boolean {
      // В текущей реализации у пользователей нет ролей в PublicUser
      // Но можно добавить при необходимости
      return false
    }
  },
})