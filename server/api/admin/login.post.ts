import {adminLogin} from '../../services/adminService'

export default defineEventHandler(async (event) => {
    const {email, password} = await readBody(event)

    // Валидация полей в теле запроса
    if (!email || !password) {
        throw createError({statusCode: 400, message: 'Email and password are required', fatal: false})
    }

    // Проверка токена юзера
    try{
        const {token} = await adminLogin(email, password)
        
        setCookie(event, 'admin_token', token, {
            httpOnly: true, // Недоступен через JavaScript
            secure: true, // Только по HTTPS
            sameSite: 'strict', // Защита от CSRF
            maxAge: 60 * 60 * 24 // 1 день
        })
    }
    catch (error: any) {
        throw createError({statusCode: error.statusCode || 500, message: error.message || 'Internal Server Error', fatal: false})
    }
})

// TODO: npm install unrate
// import { createRateLimiter } from 'unrate'

// const limiter = createRateLimiter({
//   windowMs: 60 * 1000, // 1 минута
//   max: 5, // максимум 5 запросов
//   message: 'Слишком много попыток. Подождите 1 минуту.',
  // по IP
//   key: (event) => getRequestHeader(event, 'x-forwarded-for') || getRequestIP(event)
// })

// export default defineEventHandler(async (event) => {
//   await limiter(event)

  // твой код логина
// })

// const limiter = createRateLimiter({
//     windowMs: 15 * 60 * 1000, // 15 минут
//     max: 5,
//     message: 'Слишком много попыток для этого email',
//     key: async (event) => {
//       const body = await readBody(event)
//       return body.email // ограничиваем по email
//     }
//   })