// server/database/client.ts - улучшенная версия
import { PrismaClient } from '@prisma/client'

// Глобальная переменная для предотвращения множественных подключений
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Создаем клиент с настройками
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
  
  errorFormat: 'pretty',
  
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

// В development сохраняем подключение глобально
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

export default prisma