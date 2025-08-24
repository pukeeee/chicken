import { verifyToken } from '~~/server/utils/jwt'
import { getUserById } from '~~/server/repositories/user.repository'

export default defineEventHandler(async (event) => {
  const url = event.node.req.url || ''
  
  // Пропускаем API запросы (их обрабатывает auth.api.ts)
  if (url.startsWith('/api/')) return
  
  // Проверка админских страниц
  if (url.startsWith('/admin')) {
    // Страница логина доступна всем
    if (url === '/admin/login') return

    const token = getCookie(event, 'admin_token')
    if (!token) {
      return sendRedirect(event, '/admin/login')
    }

    try {
      const payload = verifyToken(token) as { id: number, role: string }
      if (payload.role !== 'ADMIN') {
        throw new Error('Not an admin')
      }
      
      const user = await getUserById(payload.id)
      if (!user || !user.isActive) {
        throw new Error('User is inactive')
      }
    } catch {
      setCookie(event, 'admin_token', '', { maxAge: -1, path: '/' })
      return sendRedirect(event, '/admin/login')
    }
    return
  }

  // Проверка пользовательских страниц
  if (url.startsWith('/users')) {
    const token = getCookie(event, 'user_token')
    if (!token) {
      return sendRedirect(event, '/')
    }

    try {
      const payload = verifyToken(token) as { id: number }
      const user = await getUserById(payload.id)
      if (!user || !user.isActive) {
        throw new Error('User is inactive')
      }
    } catch {
      setCookie(event, 'user_token', '', { maxAge: -1, path: '/' })
      return sendRedirect(event, '/')
    }
    return
  }
})
