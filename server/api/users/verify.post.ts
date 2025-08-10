import { codeService } from '~/server/services/users/codeService'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { phone } = body

    // Валидация номера телефона
    if (!phone || typeof phone !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Номер телефону обов\'язковий'
      })
    }

    // Проверка формата телефона
    const phoneRegex = /^\+380\d{9}$/
    if (!phoneRegex.test(phone)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Невірний формат номера телефону'
      })
    }

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