import { removeToken } from '~~/server/repositories/user.repository'

export default defineEventHandler(async (event) => {
  try {
    // Если пользователь авторизован, удаляем токен из БД
    if (event.context.user && event.context.isAuthenticated) {
      await removeToken(event.context.user.id)
    }
    
    // Удаляем cookie в любом случае
    setCookie(event, 'user_token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 0 // удалить
    })
    
    return { success: true }
    
  } catch (error) {
    console.error('Logout error:', error)
    
    // Все равно удаляем cookie даже при ошибке
    setCookie(event, 'user_token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 0
    })
    
    return { success: true }
  }
})