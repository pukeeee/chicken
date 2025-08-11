import { prisma } from './client'

/**
 * @summary Проверяет доступность и работоспособность базы данных.
 * @description Выполняет самый простой и быстрый SQL-запрос (`SELECT 1`), чтобы убедиться,
 * что соединение с базой данных может быть установлено и она отвечает на запросы.
 * @returns {Promise<boolean>} `true`, если соединение успешно, иначе `false`.
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}