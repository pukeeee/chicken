import { codeService } from '~~/server/services/users/codeService'
import { authSchemas } from '~~/shared/validation/schemas'
import { validateBody, createValidationError } from '~~/server/utils/validation'

export default defineEventHandler(async (event) => {
  try {
    // Валидация входных данных с помощью Zod
    const validationResult = await validateBody(event, authSchemas.sendCode)

    if (!validationResult.success) {
      throw createValidationError(validationResult)
    }

    const { phone } = validationResult.data!

    // Генерируем и сохраняем код
    const code = await codeService.createAndStore(phone)
    
    // В реальном приложении здесь был бы вызов SMS-сервиса
    console.log(`📱 OTP code for ${phone}: ${code}`)

    return {
      success: true,
      message: 'Код підтвердження надіслано'
    }
  } catch (err: any) {
    console.error('Verify API error:', err)
    
    if (err.statusCode) {
      throw err
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Внутрішня помилка сервера'
    })
  }
})