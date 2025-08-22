import { removeToken } from '~~/server/repositories/user.repository'
import { successSchema, type SuccessResponse } from '~~/shared/validation/schemas'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user

    if (user?.id) {
      // Видаляємо токен з бази даних, якщо він є
      await removeToken(user.id)
    }
  } finally {
    // У будь-якому випадку видаляємо cookie
    setCookie(event, 'user_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // видалити
    })
  }

  const response: SuccessResponse = { success: true }

  return successSchema.parse(response)
})
