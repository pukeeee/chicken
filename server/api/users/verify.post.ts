import { codeService } from '~~/server/services/users/codeService'
import { authSchemas, userSchemas, type UserVerifyResponse } from '~~/shared/validation/schemas'
import { validateBody, createValidationError } from '~~/server/utils/validation'

export default defineEventHandler(async (event) => {
  try {
    // Крок 1: Валідація вхідних даних
    const validationResult = await validateBody(event, authSchemas.sendCode)

    if (!validationResult.success) {
      throw createValidationError(validationResult)
    }

    const { phone } = validationResult.data!

    // Крок 2: Генерація та збереження коду
    const code = await codeService.createAndStore(phone)
    
    // В реальному додатку тут був би виклик SMS-сервісу
    // Для розробки логуємо в консоль
    if (process.env.NODE_ENV === 'development') {
      console.log(`📱 OTP code for ${phone}: ${code}`)
    }

    // Крок 3: Формування та валідація відповіді
    const response: UserVerifyResponse = {
      success: true,
      message: 'Код підтвердження надіслано',
    }

    return userSchemas.verifyResponse.parse(response)

  } catch (error) {
    // Глобальний errorHandler перехопить помилку
    throw error
  }
})
