import { getUserByToken } from '../services/users/usersService'

export default defineEventHandler(async (event) => {
  // Пропускаем не-API запросы
  if (!event.node.req.url?.startsWith('/api/')) {
    return
  }

  // Пропускаем публичные API
  if (event.node.req.url?.includes('/api/users/login') || 
      event.node.req.url?.includes('/api/users/verify')) {
    return
  }

  // console.log(' Auth middleware debug:')
  // console.log('- Request URL:', event.node.req.url)
  
  try {
    // Получаем токен из cookie
    const token = getCookie(event, 'user_token')
    
    // console.log('- Token from cookie:', token ? 'EXISTS' : 'NOT_FOUND')
    
    if (token) {
      // Проверяем токен и получаем пользователя
      const user = await getUserByToken(token)
      
      // console.log('- User from getUserByToken:', user ? 'FOUND' : 'NOT_FOUND')
      
      if (user) {
        // Добавляем пользователя в контекст
        event.context.user = user
        event.context.isAuthenticated = true
        
        // console.log(' User authenticated and added to context:', user.phone)
      } else {
        // console.log(' User not found or invalid token')
      }
    } else {
      // console.log(' No token in cookie')
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    // Не прерываем запрос, просто не добавляем пользователя
  }
})
