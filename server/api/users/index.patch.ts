import { toPublicUser, updateUserProfile } from '~~/server/services/users/userService'
import { authSchemas, userSchemas, type UserUpdateResponse } from '~~/shared/validation/schemas'
import { validateBody, createValidationError } from '~~/server/utils/validation'
import { UnauthorizedError } from '~~/server/services/errorService'

/**
 * Обробник PATCH-запиту для оновлення профілю користувача.
 */
export default defineEventHandler(async (event) => {
  try {
    // Крок 1: Перевірка автентифікації.
    if (!event.context.user?.id) {
      throw new UnauthorizedError('Потрібна автентифікація')
    }
    
    const user = event.context.user

    // Крок 2: Валідація тіла запиту.
    const validationResult = await validateBody(event, authSchemas.updateProfile)
    if (!validationResult.success) {
      throw createValidationError(validationResult)
    }

    // Крок 3: Виклик сервісу для оновлення даних.
    const updatedUser = await updateUserProfile(user.id, validationResult.data!)

    // Крок 4: Формування та валідація відповіді.
    const response: UserUpdateResponse = {
      user: toPublicUser(updatedUser)
    }

    return userSchemas.updateResponse.parse(response)

  } catch (error) {
    // Глобальний errorHandler перехопить помилку
    throw error
  }
})