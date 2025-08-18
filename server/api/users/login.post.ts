import { codeService } from '~~/server/services/users/codeService'
import { loginService } from '~~/server/services/users/loginService'
import { authSchemas } from '~~/shared/validation/schemas'
import { validateBody, createValidationError, ValidationErrors } from '~~/server/utils/validation'

export default defineEventHandler(async (event) => {
  try {
    // Валидация входных данных
    const validationResult = await validateBody(event, authSchemas.login)

    if (!validationResult.success) {
      throw createValidationError(validationResult)
    }
    
    const { phone, code } = validationResult.data!

    // Проверяем код через codeService
    const isCodeValid = await codeService.verify(phone, code)
    
    if (!isCodeValid) {
      throw createError({
        statusCode: 400,
        statusMessage: ValidationErrors.CODE_INVALID
      })
    }

    // Получаем или создаем пользователя через loginService
    const { user, token } = await loginService.getOrCreateUser(phone)

    if (!user) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Помилка створення користувача'
      })
    }

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