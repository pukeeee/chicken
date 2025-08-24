import { AppError, ValidationError } from '../services/errorService'
import { createLogger } from '../utils/logger'

/**
 * Глобальний плагін Nitro для обробки помилок на сервері.
 *
 * Цей плагін виконує дві ключові задачі:
 * 1. **Правильне логування:** Розпізнає кастомні помилки AppError (навіть "загорнуті")
 *    і логує їх з відповідним рівнем (WARN для 4xx, ERROR для 5xx).
 * 2. **Формування відповіді:** Модифікує об'єкт помилки перед відправкою клієнту,
 *    щоб відповідь була чистою, інформативною та безпечною.
 */
export default defineNitroPlugin((nitroApp) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nitroApp.hooks.hook('error', async (error: any, { event }) => {
    if (!event) {
      return
    }

    // --- 1. ЛОГУВАННЯ ---
    const logger = createLogger()
    const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
    const path = event.path
    const method = event.method

    // Шукаємо нашу "операційну" помилку, навіть якщо вона всередині `cause`.
    const operationalError = error instanceof AppError 
      ? error 
      : error.cause instanceof AppError 
      ? error.cause 
      : null;

    if (operationalError) {
      const statusCode = operationalError.statusCode || 500
      if (statusCode >= 500) {
        logger.error({
          error: { message: operationalError.message, stack: operationalError.stack, code: operationalError.code },
          request: { url: path, method, ip },
        }, 'Application error')
      } else {
        const errorDetails = operationalError instanceof ValidationError ? operationalError.details : undefined
        logger.warn({
          error: { message: operationalError.message, code: operationalError.code, details: errorDetails },
          request: { url: path, method, ip },
        }, 'Client error')
      }
    } else {
      logger.error({
        error: { message: error.message, stack: error.stack },
        request: { url: path, method, ip },
      }, 'Unexpected error')
    }

    // --- 2. ФОРМУВАННЯ ВІДПОВІДІ КЛІЄНТУ ---
    // Модифікуємо вихідний об'єкт `error`, який Nitro використає для відповіді.
    
    // Якщо це наша операційна помилка, переносимо її властивості наверх.
    if (operationalError) {
      error.statusCode = operationalError.statusCode
      error.message = operationalError.message
      // Для помилок валідації, копіюємо деталі в поле `data`.
      if (operationalError instanceof ValidationError) {
        error.data = operationalError.details
      }
    }

    // Встановлюємо стандартний, короткий statusMessage для клієнтських помилок.
    if (error.statusCode >= 400 && error.statusCode < 500) {
      error.statusMessage = 'Client Error'
    }

    // Для всіх серверних помилок у продакшені ховаємо потенційно чутливі дані.
    if (error.statusCode >= 500 && process.env.NODE_ENV === 'production') {
      error.message = 'Internal Server Error'
    }
  })
})
