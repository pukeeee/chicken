import { toPublicUser } from '~~/server/services/users/userService'
import { updateUserById } from '~~/server/repositories/user.repository'
import { authSchemas } from '~~/shared/validation/schemas'
import { validateBody, createValidationError, ValidationErrors } from '~~/server/utils/validation'

export default defineEventHandler(async (event) => {
  try {
    // Проверяем, есть ли пользователь в контексте (установлен middleware)
    if (!event.context.user || !event.context.isAuthenticated) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized: User not authenticated'
      })
    }
    
    const currentUser = event.context.user
    
    // Валидация тела запроса с помощью Zod
    const validationResult = await validateBody(event, authSchemas.updateProfile)
    
    if (!validationResult.success) {
      throw createValidationError(validationResult)
    }
    
    const { name, email } = validationResult.data!
    
    // Обновляем пользователя в БД
    const updatedUser = await updateUserById(currentUser.id, {
      name: name || null,
      email: email || null
    })
    
    if (!updatedUser) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update user'
      })
    }
    
    return {
      success: true,
      user: toPublicUser(updatedUser)
    }
    
  } catch (err: any) {
    // console.error('Error in /api/users PATCH:', err)
    
    if (err.statusCode) {
      throw err
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
