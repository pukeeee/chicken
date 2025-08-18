/**
 * @file Централизованный сервис для управления toast-уведомлениями.
 * Предоставляет набор методов для вывода стандартизированных уведомлений
 * по всему приложению.
 */

/**
 * Внутренняя функция для получения экземпляра useToast.
 * Должна вызываться в контексте setup-функции компонента или composable.
 * @returns Экземпляр useToast.
 */
const getToaster = () => {
  return useToast()
}

/**
 * Предопределенные стили и иконки для разных типов уведомлений.
 * Это позволяет поддерживать консистентность UI.
 */
const toastDefaults = {
  success: { color: 'success', icon: 'i-lucide-check-circle' },
  error: { color: 'error', icon: 'i-lucide-x-circle' },
  info: { color: 'info', icon: 'i-lucide-info' },
} as const;

/**
 * Объект `toastService` содержит все методы для отображения уведомлений.
 */
export const toastService = {
  // --- Уведомления об аутентификации ---

  /**
   * Уведомление об успешном входе в систему.
   */
  loginSuccess() {
    getToaster().add({
      title: 'Успішно!',
      description: 'Ви ввійшли у свій акаунт.',
      ...toastDefaults.success,
    })
  },
  
  /**
   * Уведомление об ошибке при входе (неверный код).
   */
  loginError() {
    getToaster().add({
      title: 'Помилка входу',
      description: 'Невірний код підтвердження.',
      ...toastDefaults.error,
    })
  },

  /**
   * Уведомление об успешном выходе из системы.
   */
  logoutSuccess() {
    getToaster().add({
      title: 'Ви вийшли',
      description: 'Ви успішно вийшли зі свого акаунту.',
      ...toastDefaults.info,
    })
  },

  /**
   * Уведомление об успешной отправке кода подтверждения.
   * @param {string} phone - Номер телефона, на который был отправлен код.
   */
  verificationCodeSent(phone: string) {
    getToaster().add({
      title: 'Код надіслано',
      description: `Код підтвердження надіслано на номер ${phone}.`,
      ...toastDefaults.success,
    })
  },

  /**
   * Уведомление об ошибке при отправке кода подтверждения.
   */
  verificationCodeError() {
    getToaster().add({
      title: 'Помилка',
      description: 'Не вдалося надіслати код підтвердження.',
      ...toastDefaults.error,
    })
  },

  // --- Уведомления о профиле пользователя ---

  /**
   * Уведомление об успешном обновлении профиля.
   */
  profileUpdateSuccess() {
    getToaster().add({
      title: 'Збережено',
      description: 'Ваші дані успішно оновлено.',
      ...toastDefaults.success,
    })
  },

  /**
   * Уведомление об ошибке при обновлении профиля.
   */
  profileUpdateError() {
    getToaster().add({
      title: 'Помилка',
      description: 'Не вдалося оновити дані користувача.',
      ...toastDefaults.error,
    })
  },
  
  /**
   * Уведомление о попытке выполнить действие без авторизации.
   */
  unauthorizedError() {
     getToaster().add({
      title: 'Помилка',
      description: 'Користувач не авторизований.',
      ...toastDefaults.error,
    })
  },

  // --- Общие уведомления ---

  /**
   * Общее уведомление об ошибке.
   * @param {string} [message] - Опциональное сообщение для уточнения ошибки.
   */
  genericError(message?: string) {
    getToaster().add({
      title: 'Сталася помилка',
      description: message || 'Щось пішло не так. Спробуйте ще раз.',
      ...toastDefaults.error,
    })
  },
}