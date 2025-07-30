import { verifyToken } from "../utils/jwt"

export default defineEventHandler(async (event) => {
    // Проверяем только админские роуты
    if (!event.path.startsWith('/admin')) {
        return
    }

    // Пропускаем страницу логина
    if (event.path === '/admin/login') {
        return
    }

    // Получаем cookie с сервера
    let token = getCookie(event, 'admin_token')
    if (!token) {
        // Редирект на страницу логина
        return sendRedirect(event, '/admin/login', 302)
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
        // Редирект на страницу логина при неверном токене
        return sendRedirect(event, '/admin/login', 302)
    }
})