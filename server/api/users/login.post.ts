import { codeService } from '~/server/services/users/codeService'
import { loginService } from '~/server/services/users/loginService'
import { createToken } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { phone, code } = body

    // Валидация входных данных
    if (!phone || typeof phone !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Номер телефону обов\'язковий'
      })
    }

    if (!code || typeof code !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Код підтвердження обов\'язковий'
      })
    }

    // Проверяем код через codeService
    const isCodeValid = await codeService.verify(phone, code)
    
    if (!isCodeValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Невірний код підтвердження'
      })
    }

    // Получаем или создаем пользователя через loginService
    const user = await loginService.getOrCreateUser(phone)

    if (!user) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Помилка створення користувача'
      })
    }

    // Генерируем JWT токен
    const token = createToken({ 
      id: user.id, 
      role: user.role || 'USER',
      phone: user.phone 
    })

    // Сохраняем токен в БД
    await loginService.saveUserToken(user.id, token)

    // Устанавливаем cookie с токеном
    setCookie(event, 'user_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30 // 30 дней
    })

    // console.log('🍪 Cookie set: user_token =', token.substring(0, 20) + '...')

    return {
      success: true,
      message: 'Успішний вхід в систему',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString()
      }
    }

  } catch (error: any) {
    console.error('Login API error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Внутрішня помилка сервера'
    })
  }
})