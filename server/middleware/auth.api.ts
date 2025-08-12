import { verifyToken } from '../utils/jwt'
import { getUserById } from '../repositories/user.repository'
import jwt from 'jsonwebtoken'

// Кэш пользователей для избежания повторных запросов к БД
const userCache = new Map<number, { user: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 минут

export default defineEventHandler(async (event) => {
  const url = event.node.req.url || ''

  // Обрабатываем только API запросы
  if (!url.startsWith('/api/')) {
    return
  }

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

  // Если токена нет, просто выходим. Эндпоинт сам решит, что делать.
  // Выбрасываем ошибку только если это не запрос на проверку статуса пользователя.
  if (!token) {
    if (url.startsWith('/api/users')) { // Более широкое правило для /api/users/*
      return
    }
    throw createError({ 
      statusCode: 401, 
      statusMessage: 'Authentication required' 
    })
  }

  try {
    const payload = verifyToken(token) as { id: number, role: string, phone?: string }
    
    // Проверяем роль для админ API
    if (isAdminAPI && payload.role !== 'ADMIN') {
      throw createError({ 
        statusCode: 403, 
        statusMessage: 'Admin access required' 
      })
    }

    // Проверяем кэш пользователя
    const now = Date.now()
    const cachedUser = userCache.get(payload.id)
    
    let user
    if (cachedUser && (now - cachedUser.timestamp) < CACHE_TTL) {
      user = cachedUser.user
    } else {
      // Получаем пользователя из БД
      user = await getUserById(payload.id)
      if (user) {
        // Кэшируем пользователя
        userCache.set(payload.id, { user, timestamp: now })
      }
    }

    if (!user) {
      // Удаляем из кэша неактивного пользователя
      userCache.delete(payload.id)
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
    
    // Если это ошибка JWT, очищаем кэш пользователя
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret', { ignoreExpiration: true }) as { id: number }
      userCache.delete(payload.id)
    }
    
    throw createError({ 
      statusCode: 401, 
      statusMessage: err.message || 'Invalid or expired token' 
    })
  }

  // Периодическая очистка кэша (каждые 10 минут)
  if (Math.random() < 0.001) { // 0.1% шанс на каждый запрос
    const now = Date.now()
    for (const [id, cachedUser] of userCache.entries()) {
      if (now - cachedUser.timestamp > CACHE_TTL) {
        userCache.delete(id)
      }
    }
  }
})