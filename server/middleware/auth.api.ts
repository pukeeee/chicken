import { verifyToken } from '~~/server/utils/jwt'
import { getUserById } from '~~/server/repositories/user.repository'
import { getCachedUser, setCachedUser, invalidateUserCache } from '~~/server/utils/userCache'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const url = event.node.req.url || ''

  // Обробляємо тільки API запити
  if (!url.startsWith('/api')) {
    return
  }

  // Публічні API ендпоінти, які не вимагають токена
  const publicPaths = [
    '/api/menu',
    '/api/users/login',
    '/api/users/verify',
    '/api/admin/login',
  ]

  if (publicPaths.some((path) => url.startsWith(path))) {
    return
  }

  // Визначаємо тип API (admin або user)
  const isAdminAPI = url.startsWith('/api/admin')
  const isUserAPI = url.startsWith('/api/users')

  if (!isAdminAPI && !isUserAPI) return

  // Отримуємо відповідний токен
  const tokenName = isAdminAPI ? 'admin_token' : 'user_token'
  let token = getCookie(event, tokenName)

  // Для тестування в dev-режимі дозволяємо токен із заголовка
  if (!token && (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')) {
    const auth = getRequestHeader(event, 'Authorization')
    if (auth?.startsWith('Bearer ')) {
      token = auth.slice(7)
    }
  }

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }

  try {
    const payload = verifyToken(token) as { id: number; role: string; phone?: string }

    if (isAdminAPI && payload.role !== 'ADMIN') {
      throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
    }

    // Спочатку перевіряємо кеш
    let user = getCachedUser(payload.id)

    // Якщо в кеші немає, отримуємо з БД і кешуємо
    if (!user) {
      user = await getUserById(payload.id)
      if (user) {
        setCachedUser(user)
      } else {
        // Якщо користувача немає в БД, інвалідуємо кеш на випадок, якщо він там був
        invalidateUserCache(payload.id)
        throw createError({ statusCode: 401, statusMessage: 'User not found or inactive' })
      }
    }

    // Додаємо дані користувача в контекст
    event.context.user = {
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    }
    event.context.isAuthenticated = true

  } catch (err: unknown) {
    // При будь-якій помилці видаляємо невалідний токен
    setCookie(event, tokenName, '', { maxAge: -1, path: '/' })

    // Безпечне отримання message і name
    const errorMessage = (err instanceof Error) ? err.message : String(err);
    const errorName = (err instanceof Error) ? err.name : '';

    // Якщо це помилка JWT, намагаємося інвалідувати кеш
    if (errorName === 'JsonWebTokenError' || errorName === 'TokenExpiredError') {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret', { ignoreExpiration: true }) as { id: number }
        if (payload?.id) {
          invalidateUserCache(payload.id)
        }
      } catch {
        // Ігноруємо помилки, якщо не вдалося навіть розпарсити старий токен
      }
    }

    throw createError({ statusCode: 401, statusMessage: errorMessage || 'Invalid or expired token' })
  }
})
