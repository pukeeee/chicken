import { toPublicUser } from '../../services/users/usersService'
import { updateUserById } from '~/server/repositories/user.repository'

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
    
    // Получаем данные для обновления
    const body = await readBody(event)
    const { name, email } = body
    
    // Валидация данных
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email format'
      })
    }
    
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
