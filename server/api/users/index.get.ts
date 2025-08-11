import { getUserByToken } from '../../services/users/userService'

export default defineEventHandler(async (event) => {
  try {
    // console.log('🔍 Debug /api/users GET:')
    // console.log('- event.context.user:', event.context.user ? 'EXISTS' : 'NOT_FOUND')
    // console.log('- event.context.isAuthenticated:', event.context.isAuthenticated)
    
    // Проверяем, есть ли пользователь в контексте (установлен middleware)
    if (!event.context.user || !event.context.isAuthenticated) {
      // Если пользователь не авторизован, возвращаем успех с пустыми данными
      // Это нужно для корректной работы на клиенте
      return {
        success: false,
        message: 'User not authenticated'
      }
    }
    
    const user = event.context.user
    // console.log('✅ User from context:', user.phone)
    
    return {
      success: true,
      user
    }
    
  } catch (err: any) {
    // console.error('Error in /api/users GET:', err)
    
    if (err.statusCode) {
      throw err
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})