import { userSchemas, type UserSuccessResponse } from '~~/shared/validation/schemas'
import { UnauthorizedError } from '~~/server/services/errorService'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    const isAuthenticated = event.context.isAuthenticated

    if (!user || !isAuthenticated) {
      // Кидаємо стандартизовану помилку.
      // Глобальний обробник її перехопить і відформатує відповідь.
      throw new UnauthorizedError('Користувач не автентифікований')
    }

    const response: UserSuccessResponse = {
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    }

    // Валідуємо відповідь перед відправкою
    return userSchemas.successResponse.parse(response)

  } catch (error) {
    // Всі помилки, включно з UnauthorizedError, будуть оброблені глобальним errorHandler.
    throw error
  }
})
