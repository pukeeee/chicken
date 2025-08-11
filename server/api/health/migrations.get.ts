import { checkMigrations } from '~/server/database/migrations'

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
