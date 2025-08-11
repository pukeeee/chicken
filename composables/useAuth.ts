import type { User, AuthState, PublicUser } from '~/types/auth'

/**
 * @description Глобальное реактивное состояние аутентификации.
 * Хранит данные текущего пользователя, его статус входа и состояние загрузки.
 * Является центральным источником правды для всего приложения.
 */
const authState = reactive<AuthState>({
  user: null,
  isAuthenticated: false,
  isLoading: false
})

/**
 * @description Главный composable для управления аутентификацией и данными пользователя.
 * Предоставляет полный набор инструментов: от проверки сессии и входа/выхода
 * до валидации и форматирования данных. Инкапсулирует всю логику, связанную с пользователем.
 */
export const useAuth = () => {
  const toast = useToast()

  /**
   * @description Умная проверка сессии пользователя с помощью useLazyAsyncData.
   * - `user-session`: Уникальный ключ. Nuxt использует его для кеширования данных, чтобы не делать лишних запросов.
   * - `() => $fetch(...)`: Асинхронная функция, которая делает запрос к API для получения данных пользователя.
   * - `server: false`: Запрос будет выполняться только на стороне клиента. Это предотвращает выполнение на сервере при SSR.
   * - `immediate: false`: Запрос не будет выполняться автоматически при загрузке компонента. Мы вызываем его вручную через `checkAuth()`.
   * - `transform`: Функция для преобразования полученных данных. Здесь мы обновляем глобальное состояние `authState`.
   */
  const { pending, refresh: refreshAuthSession } = useLazyAsyncData('user-session',
    () => $fetch<{ success: boolean, user?: PublicUser }>('/api/users/'),
    {
      server: false, // Проверять сессию только на клиенте
      immediate: false, // Не запускать сразу при инициализации
      transform: (response) => {
        // Обновляем централизованное состояние
        if (response && response.success && response.user) {
          authState.user = response.user
          authState.isAuthenticated = true
        } else {
          authState.user = null
          authState.isAuthenticated = false
        }
        return response
      },
    }
  )

  // Синхронизируем состояние загрузки из useLazyAsyncData с нашим глобальным состоянием.
  watch(pending, (newValue) => {
    authState.isLoading = newValue
  })

  // --- Геттеры состояния (вычисляемые свойства) ---

  /** @description Реактивные данные текущего пользователя. */
  const user = computed(() => authState.user)
  /** @description Реактивный флаг, указывающий, авторизован ли пользователь. */
  const isAuthenticated = computed(() => authState.isAuthenticated)
  /** @description Реактивный флаг состояния загрузки. */
  const isLoading = computed(() => authState.isLoading)

  // --- Хелперы для валидации и форматирования ---

  /**
   * @description Проверяет, соответствует ли номер телефона украинскому формату.
   * @param {string} phone - Номер телефона для проверки.
   * @returns {boolean} - `true`, если номер валиден.
   */
  const isPhoneValid = (phone: string): boolean => {
    const phoneRegex = /^\+380\d{9}$/
    return phoneRegex.test(phone)
  }

  /**
   * @description Проверяет, является ли код подтверждения валидным (6 символов).
   * @param {string} code - Код для проверки.
   * @returns {boolean} - `true`, если код валиден.
   */
  const isCodeValid = (code: string): boolean => {
    return code.length === 6 && /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/.test(code)
  }

  /**
   * @description Приводит номер телефона к стандартному формату +380XXXXXXXXX.
   * @param {string} value - Введенный номер телефона.
   * @returns {string} - Отформатированный номер.
   */
  const formatPhone = (value: string): string => {
    // Удаляем все нецифровые символы
    let digits = value.replace(/\D/g, '')
    
    // Приводим к стандартному формату
    if (digits.startsWith('380')) {
      digits = '+' + digits
    } else if (digits.startsWith('80')) {
      digits = '+3' + digits
    } else if (digits.startsWith('0')) {
      digits = '+38' + digits
    } else if (digits.length <= 9 && !digits.startsWith('380')) {
      digits = '+380' + digits
    }
    
    return digits.slice(0, 13) // Обрезаем до нужной длины
  }

  // --- Основные действия (Actions) ---

  /**
   * @description Отправляет код подтверждения на указанный номер телефона.
   * @param {string} phone - Номер телефона.
   * @returns {Promise<{success: boolean}>} - Объект с результатом операции.
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
      
      await $fetch('/api/users/verify', {
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
   * @description Проверяет код и выполняет вход/регистрацию пользователя.
   * @param {string} phone - Номер телефона.
   * @param {string} code - Код подтверждения.
   * @returns {Promise<{success: boolean, user?: User}>} - Объект с результатом и данными пользователя.
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

      const data = await $fetch<{user: User}>('/api/users/login',{
        method: 'POST',
        body: {phone, code}
      })
      
      // После успешного входа, обновляем сессию для синхронизации состояния.
      await checkAuth()

      return { success: true, user: data.user }
      
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
   * @description Выполняет выход пользователя из системы.
   */
  const logout = async (): Promise<void> => {
    try {
      authState.isLoading = true
      
      await $fetch('/api/users/logout', {
        method: 'DELETE'
      })

      // Немедленно очищаем состояние на клиенте для мгновенного обновления UI.
      authState.user = null
      authState.isAuthenticated = false

      toast.add({
        title: 'Успішно',
        description: 'Ви вийшли з системи',
        color: 'success'
      })

      // Перенаправляем на главную, чтобы сбросить состояние всех компонентов.
      await navigateTo('/')
      
    } catch (error) {
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
   * @description Проверяет сессию пользователя, запуская `useLazyAsyncData`.
   * Используется для восстановления сессии при загрузке приложения.
   */
  const checkAuth = async (): Promise<void> => {
    await refreshAuthSession()
  }

  /**
   * @description Обновляет данные пользователя (имя, email).
   * @param {Partial<PublicUser>} userData - Объект с новыми данными.
   * @returns {Promise<PublicUser | null>} - Обновленные данные пользователя или null в случае ошибки.
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
      
      const data = await $fetch<{user: PublicUser}>('/api/users/', {
        method: 'PATCH',
        body: {
          name: userData.name,
          email: userData.email
        }
      })
      
      // После обновления данных, обновляем сессию для синхронизации.
      await checkAuth()

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

  // Возвращаем публичный API композабла
  return {
    // Состояние (только для чтения, чтобы предотвратить прямое изменение извне)
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    isLoading: readonly(isLoading),
    
    // Хелперы
    isPhoneValid,
    isCodeValid,
    formatPhone,
    
    // Основные действия
    sendVerificationCode,
    verifyCodeAndLogin,
    logout,
    checkAuth,
    updateUser
  }
}