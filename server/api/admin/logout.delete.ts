import { removeToken } from '~~/server/repositories/user.repository'
import { successSchema, type SuccessResponse } from '~~/shared/validation/schemas'

export default defineEventHandler(async (event) => {
  const user = event.context.auth

  if (user?.id) {
    // Удаляем токен из базы данных, если он есть
    await removeToken(user.id)
  }

  // В любом случае удаляем cookie
  setCookie(event, 'admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0, // удалить
  })

  const response: SuccessResponse = { success: true }

  return successSchema.parse(response)
})
