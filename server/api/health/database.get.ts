import { checkDatabaseHealth } from '~~/server/database/health'

/**
 * @summary API-эндпоинт для проверки здоровья базы данных.
 * @description Обрабатывает GET-запросы на `/api/health/database`.
 * Выполняет простую проверку соединения с БД и возвращает статус.
 * @returns {Promise<object>} Объект с состоянием здоровья, временной меткой и статусом.
 */
export default defineEventHandler(async (event) => {
  try {
    const isHealthy = await checkDatabaseHealth()
    
    return {
      healthy: isHealthy,
      timestamp: new Date().toISOString(),
      status: isHealthy ? 'OK' : 'ERROR'
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Database health check failed',
      data: { error: error instanceof Error ? error.message : 'Unknown error' }
    })
  }
})
