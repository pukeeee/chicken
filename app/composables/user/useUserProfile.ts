import { useAuth } from "../auth/useAuth"
import { authSchemas } from '~~/shared/validation/schemas'
import type { ZodError } from 'zod'

/**
 * Форматирует ошибки Zod в плоский объект, удобный для форм
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
 * Композабл для работы с профилем пользователя, использующий Zod для валидации
 */
export const useUserProfile = () => {
  const { user, updateProfile, isLoading } = useAuth()

  // Состояние формы и ошибок
  const isEditing = ref(false)
  const editForm = ref({ name: '', email: '' })
  const validationErrors = ref<Record<string, string>>({})

  // Инициализация и сброс формы
  const resetForm = () => {
    if (user.value) {
      editForm.value = {
        name: user.value.name || '',
        email: user.value.email || '',
      }
    }
    validationErrors.value = {}
  }

  // Следим за пользователем, чтобы инициализировать форму
  watch(user, resetForm, { immediate: true })

  // Вычисляемые свойства
  const hasChanges = computed(() => {
    if (!user.value) return false
    return (
      editForm.value.name !== (user.value.name || '') ||
      editForm.value.email !== (user.value.email || '')
    )
  })

  // Действия
  const startEditing = () => {
    resetForm()
    isEditing.value = true
  }

  const cancelEditing = () => {
    resetForm()
    isEditing.value = false
  }

  const saveProfile = async () => {
    // 1. Валидация
    const validationResult = authSchemas.updateProfile.safeParse(editForm.value)
    
    if (!validationResult.success) {
      validationErrors.value = formatZodErrors(validationResult.error)
      return false
    }
    
    validationErrors.value = {}

    // 2. Обновление
    const result = await updateProfile({
      name: editForm.value.name,
      email: editForm.value.email,
    })

    if (result) {
      isEditing.value = false
      return true
    }
    return false
  }

  // Сброс при размонтировании
  onUnmounted(() => {
    isEditing.value = false
  })

  return {
    // Состояние
    isEditing: readonly(isEditing),
    editForm, // делаем его изменяемым из компонента
    validationErrors: readonly(validationErrors),
    
    // Вычисляемые свойства
    hasChanges: readonly(hasChanges),
    
    // Действия
    startEditing,
    cancelEditing,
    saveProfile,
    
    // Флаги
    isLoading: readonly(isLoading),
  }
}
