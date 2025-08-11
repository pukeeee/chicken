import { prisma } from './client'

/**
 * @summary Проверяет статус миграций Prisma.
 * @description Эта функция выполняет прямой SQL-запрос к таблице `_prisma_migrations`,
 * чтобы определить, есть ли миграции, которые еще не были успешно применены (т.е. `finished_at` is NULL).
 * @returns {Promise<boolean>} `true`, если все миграции применены, иначе `false`.
 */
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