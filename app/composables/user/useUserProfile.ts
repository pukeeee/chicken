import { useAuth } from '../auth/useAuth'
import { authSchemas } from '~~/shared/validation/schemas'
import type { ZodError } from 'zod'
import { toastService } from '~~/app/services/toastService'

/**
 * Форматує помилки Zod у плоский об'єкт, де ключ - це шлях до поля.
 * @param error - Об'єкт помилки Zod.
 * @returns Record<string, string> - Об'єкт з помилками.
 */
const formatZodErrors = (error: ZodError) => {
  const errors: Record<string, string> = {}
  error.issues.forEach(issue => {
    const path = issue.path.join('.')
    if (!errors[path]) {
      errors[path] = issue.message
    }
  })
  return errors
}

/**
 * Композабл для роботи з профілем користувача, що використовує ручне керування станом редагування та валідацією.
 */
export const useUserProfile = () => {
  const { user, updateProfile, isLoading } = useAuth()

  // Стан для керування режимом редагування
  const isEditing = ref(false)
  // Стан для даних форми
  const editForm = ref({ name: '', email: null as string | null })
  // Стан для помилок валідації
  const validationErrors = ref<Record<string, string>>({})

  /**
   * Скидає стан форми до поточних даних користувача та очищує помилки.
   */
  const resetForm = () => {
    if (user.value) {
      editForm.value = {
        name: user.value.name ?? '',
        email: user.value.email ?? null,
      }
    }
    validationErrors.value = {}
  }

  // Ініціалізуємо форму при завантаженні та при зміні користувача
  watch(user, resetForm, { immediate: true, deep: true })

  /**
   * Обчислювана властивість, що перевіряє, чи є зміни у формі.
   */
  const hasChanges = computed(() => {
    if (!user.value) return false
    return (
      editForm.value.name !== (user.value.name ?? '') ||
      editForm.value.email !== (user.value.email ?? null)
    )
  })

  /**
   * Вмикає режим редагування.
   */
  const startEditing = () => {
    resetForm()
    isEditing.value = true
  }

  /**
   * Вимикає режим редагування та скидає форму.
   */
  const cancelEditing = () => {
    resetForm()
    isEditing.value = false
  }

  /**
   * Зберігає зміни профілю.
   */
  const saveProfile = async () => {
    // 1. Валідація даних форми
    const validationResult = authSchemas.updateProfile.safeParse(editForm.value)
    
    if (!validationResult.success) {
      validationErrors.value = formatZodErrors(validationResult.error)
      return
    }
    
    validationErrors.value = {}

    // 2. Виклик API для оновлення
    try {
      const result = await updateProfile(editForm.value)

      if (result) {
        toastService.profileUpdateSuccess()
        isEditing.value = false // Вимикаємо режим редагування після успішного збереження
      }
    } catch (error) {
      // Помилка буде оброблена глобально, але ми можемо показати сповіщення
      toastService.profileUpdateError()
    }
  }

  // Переконаємось, що режим редагування вимкнено при покиданні сторінки
  onUnmounted(() => {
    isEditing.value = false
  })

  return {
    isEditing: readonly(isEditing),
    editForm,
    validationErrors: readonly(validationErrors),
    hasChanges: readonly(hasChanges),
    isLoading: readonly(isLoading),
    startEditing,
    cancelEditing,
    saveProfile,
  }
}