import { defineStore } from 'pinia'
import type { AuthState, PublicUser } from '~~/shared/types/auth'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated && !!state.user,
    userName: (state) => state.user?.name || state.user?.phone || 'Користувач',
    userPhone: (state) => state.user?.phone || null,
    needsAuth: (state) => !state.isAuthenticated && state.isInitialized,
  },

  actions: {
    /**
     * Инициализация состояния авторизации
     * Проверяет наличие валидного токена и загружает данные пользователя
     */
    async initialize(): Promise<void> {
      // DEBUG: Начало инициализации
      // console.log('[Auth] Initializing...');
      
      if (this.isInitialized) {
        // console.log('[Auth] Already initialized.');
        return;
      }

      const userToken = useCookie('user_token');
      // console.log(`[Auth] Token found: ${!!userToken.value}`);
      
      if (!userToken.value) {
        this.isAuthenticated = false;
        this.user = null;
        this.isInitialized = true;
        // console.log('[Auth] No token. Initialization complete.');
        return;
      }

      // Если токен есть, но пользователь уже авторизован, не делаем лишний запрос
      if (this.isAuthenticated && this.user) {
        this.isInitialized = true;
        // console.log('[Auth] Already authenticated. Initialization complete.');
        return;
      }

      await this.fetchUser();
      
      // Устанавливаем флаг инициализации только после завершения всех асинхронных операций
      this.isInitialized = true;
      // console.log(`[Auth] User fetch complete. Initialized. Authenticated: ${this.isAuthenticated}`);
    },

    /**
     * Загрузка данных пользователя с сервера
     */
    async fetchUser(): Promise<void> {
      // console.log('[Auth] Fetching user...');
      this.isLoading = true;
      try {
        const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined;
        
        const response = await $fetch<{ success: boolean, user: PublicUser }>('/api/users/', {
          method: 'GET',
          headers,
        });
        
        if (response.success && response.user) {
          this.user = response.user;
          this.isAuthenticated = true;
          // console.log('[Auth] User fetched successfully:', response.user.name);
        } else {
          // console.log('[Auth] Fetch user responded with an error, clearing auth.');
          this.clearAuth();
        }
        
      } catch (error: any) {
        // console.error('[Auth] Auth check failed:', error.message);
        this.clearAuth();
      } finally {
        this.isLoading = false;
        // Флаг isInitialized теперь устанавливается в action `initialize`
      }
    },

    /**
     * Отправка кода подтверждения
     */
    async sendVerificationCode(phone: string): Promise<{ success: boolean }> {
      try {
        this.isLoading = true;
        
        await $fetch('/api/users/verify', {
          method: 'POST',
          body: { phone }
        });
        
        this.showToast('success', 'Код підтвердження надіслано', `Код надіслано на номер ${phone}`);
        return { success: true };
        
      } catch (error: any) {
        // console.error('Error sending verification code:', error);
        this.showToast('error', 'Помилка', 'Не вдалося надіслати код підтвердження');
        return { success: false };
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Вход в систему с проверочным кодом
     */
    async verifyCodeAndLogin(phone: string, code: string): Promise<{ success: boolean; user?: PublicUser }> {
      try {
        this.isLoading = true;

        const response = await $fetch<{ user: PublicUser }>('/api/users/login', {
          method: 'POST',
          body: { phone, code }
        });
        
        // Устанавливаем состояние напрямую
        this.user = response.user;
        this.isAuthenticated = true;

        this.showToast('success', 'Успішно!', 'Ви ввійшли у свій акаунт');
        return { success: true, user: response.user };
        
      } catch (error: any) {
        // console.error('Error verifying code:', error);
        this.showToast('error', 'Помилка', 'Невірний код підтвердження');
        return { success: false };
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Выход из системы
     */
    async logout(): Promise<void> {
      try {
        await $fetch('/api/users/logout', { method: 'DELETE' });
      } catch (error) {
        // console.error('Logout error:', error);
      }
      
      this.clearAuth();
      this.showToast('info', 'Ви вийшли', 'Ви успішно вийшли зі свого акаунту');
      await navigateTo('/');
    },

    /**
     * Обновление данных пользователя
     */
    async updateUser(userData: Partial<PublicUser>): Promise<PublicUser | null> {
      if (!this.user) {
        this.showToast('error', 'Помилка', 'Користувач не авторизований');
        return null;
      }
      
      try {
        this.isLoading = true;
        
        const response = await $fetch<{ user: PublicUser }>('/api/users/', {
          method: 'PATCH',
          body: {
            name: userData.name,
            email: userData.email
          }
        });
        
        this.user = response.user;
        this.showToast('success', 'Збережено', 'Ваші дані успішно оновлено');
        return response.user;
        
      } catch (error: any) {
        // console.error('Error updating user:', error);
        this.showToast('error', 'Помилка', 'Не вдалося оновити дані користувача');
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Принудительная проверка авторизации
     */
    async checkAuth(): Promise<boolean> {
      await this.fetchUser();
      return this.isAuthenticated;
    },

    /**
     * Очистка состояния авторизации
     */
    clearAuth(): void {
      // console.log('[Auth] Clearing authentication state.');
      this.user = null;
      this.isAuthenticated = false;
      
      const userToken = useCookie('user_token');
      userToken.value = null;
    },

    /**
     * Проверка роли пользователя (для будущего использования)
     */
    hasRole(role: string): boolean {
      // В текущей реализации роли нет в PublicUser
      // Можно добавить при необходимости
      return false;
    },

    /**
     * Вспомогательный метод для показа уведомлений
     */
    showToast(color: 'success' | 'error' | 'info' | 'warning', title: string, description?: string): void {
      const toast = useToast();
      toast.add({ title, description, color });
    }
  },
})