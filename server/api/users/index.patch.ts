import { toPublicUser, updateUserProfile } from '~~/server/services/users/userService'
import { authSchemas } from '~~/shared/validation/schemas'
import { validateBody, createValidationError } from '~~/server/utils/validation'

/**
 * Обробник PATCH-запиту для оновлення профілю користувача.
 */
export default defineEventHandler(async (event) => {
  // Крок 1: Перевірка автентифікації.
  // Middleware `auth.api.ts` має додати об'єкт `user` в контекст.
  // Ця перевірка є додатковим рівнем безпеки.
  if (!event.context.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Потрібна автентифікація',
    })
  }
  
  const user = event.context.user

  // Крок 2: Валідація тіла запиту.
  const validationResult = await validateBody(event, authSchemas.updateProfile)
  if (!validationResult.success) {
    throw createValidationError(validationResult)
  }

  // Крок 3: Виклик сервісу для оновлення даних.
  const updatedUser = await updateUserProfile(user.id, validationResult.data!)

  // Крок 4: Повернення публічних даних клієнту у форматі, який очікує стор.
  return { user: toPublicUser(updatedUser) }
})
