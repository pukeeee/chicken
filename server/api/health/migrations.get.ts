import { checkMigrations } from '~~/server/database/migrations'

/**
 * @summary API-эндпоинт для проверки статуса миграций базы данных.
 * @description Обрабатывает GET-запросы на `/api/health/migrations`.
 * Проверяет, есть ли непримененные или неудачные миграции.
 * @returns {Promise<object>} Объект со статусом миграций, временной меткой и статусом.
 */
export default defineEventHandler(async (event) => {
  try {
    const areUpToDate = await checkMigrations()
    
    return {
      upToDate: areUpToDate,
      timestamp: new Date().toISOString(),
      status: areUpToDate ? 'UP_TO_DATE' : 'PENDING_OR_FAILED'
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Migration check failed',
      data: { error: error instanceof Error ? error.message : 'Unknown error' }
    })
  }
})
