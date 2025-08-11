import { checkDatabaseHealth } from '~/server/database/health'

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
