import { verifyToken } from '../utils/jwt'
import { getUserById } from '../repositories/user.repository'

export default defineEventHandler(async (event) => {
  // Обрабатываем только API запросы
  const url = event.node.req.url || ''
  if (!url.startsWith('/api/')) return

  // Публичные API endpoints, которые не требуют токена
  const publicPaths = [
    '/api/menu',
    '/api/users/login',
    '/api/users/verify',
    '/api/admin/login'
  ]
  
  if (publicPaths.some(path => url.startsWith(path))) {
    return
  }

  // Определяем тип API (admin или user)
  const isAdminAPI = url.startsWith('/api/admin/')
  const isUserAPI = url.startsWith('/api/users/')
  
  // Если это не API пользователей или админов, которое требует защиты, пропускаем
  if (!isAdminAPI && !isUserAPI) return

  // Получаем соответствующий токен
  const tokenName = isAdminAPI ? 'admin_token' : 'user_token'
  let token = getCookie(event, tokenName)

  // Для тестирования в dev-режиме разрешаем токен из заголовка
  if (!token && (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')) {
    const auth = getRequestHeader(event, 'Authorization')
    if (auth?.startsWith('Bearer ')) {
      token = auth.slice(7)
    }
  }

  if (!token) {
    throw createError({ 
      statusCode: 401, 
      statusMessage: 'Authentication required' 
    })
  }

  try {
    // Верифицируем токен
    const payload = verifyToken(token) as { id: number, role: string, phone?: string }
    
    // Проверяем роль для админ API
    if (isAdminAPI && payload.role !== 'ADMIN') {
      throw createError({ 
        statusCode: 403, 
        statusMessage: 'Admin access required' 
      })
    }

    // Получаем пользователя из БД для проверки активности
    const user = await getUserById(payload.id)
    if (!user || !user.isActive) {
      throw createError({ 
        statusCode: 401, 
        statusMessage: 'User not found or inactive' 
      })
    }

    // Добавляем данные в контекст в зависимости от типа API
    if (isAdminAPI) {
      event.context.auth = payload
    } else {
      event.context.user = {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString()
      }
      event.context.isAuthenticated = true
    }

  } catch (err: any) {
    // Удаляем невалидный токен из cookie
    setCookie(event, tokenName, '', { maxAge: -1, path: '/' })
    
    throw createError({ 
      statusCode: 401, 
      statusMessage: err.message || 'Invalid or expired token' 
    })
  }
})
