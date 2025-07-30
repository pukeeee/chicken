import { verifyToken } from "../utils/jwt"

export default defineEventHandler(async (event) => {
    // Проверяем только админские API
    if (!event.path.startsWith('/api/admin')) {
        return
    }

    // Пропускаем логин API
    if (event.path === '/api/admin/login') {
        return
    }

    // Получаем cookie с сервера
    let token = getCookie(event, 'admin_token')
    if (!token) {
        throw createError({ statusCode: 401, statusMessage: 'Не авторизован' })
    }

    // TODO: токен в заголовке для теста
    const env = process.env.ENV
    if (env === 'development' || env === 'test') {
        const auth = getRequestHeader(event, 'Authorization')
        if (auth?.startsWith('Bearer ')) {
          token = auth.split(' ')[1]
        }
    }
    
    try {
        const payload = verifyToken(token!)
        event.context.auth = payload
    } catch (err) {
        throw createError({ statusCode: 401, statusMessage: 'Неверный или просроченный токен' })
    }
})