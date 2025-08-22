import { adminLogin } from '~~/server/services/adminService'
import { adminSchemas, type AdminLoginResponse } from '~~/shared/validation/schemas'
import { createValidationError, validateBody } from '~~/server/utils/validation'

export default defineEventHandler(async (event) => {
  try {
    // Крок 1: Валідація тіла запиту
    const validationResult = await validateBody(event, adminSchemas.login)
    if (!validationResult.success) {
      throw createValidationError(validationResult)
    }

    const { email, password } = validationResult.data!

    // Крок 2: Виклик сервісу для логіну
    const { token } = await adminLogin(email, password)

    // Крок 3: Встановлення cookie
    setCookie(event, 'admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Використовувати secure cookies в продакшені
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 день
    })

    // Крок 4: Повернення успішної відповіді
    const response: AdminLoginResponse = { success: true }

    // Валідація відповіді (хороша практика)
    return adminSchemas.loginResponse.parse(response)

  } catch (error) {
    // Глобальний errorHandler перехопить помилку
    // AppError та ValidationError будуть оброблені з правильними статус-кодами
    throw error
  }
})
