import { prisma } from './client'

export const checkMigrations = async (): Promise<boolean> => {
  try {
    // Проверяем, что все миграции применены
    const pendingMigrations = await prisma.$queryRaw`
      SELECT * FROM _prisma_migrations 
      WHERE finished_at IS NULL
    `
    return Array.isArray(pendingMigrations) && pendingMigrations.length === 0
  } catch (error) {
    console.error('Migration check failed:', error)
    return false
  }
}