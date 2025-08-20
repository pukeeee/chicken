import type { User } from '@prisma/client'

/**
 * Простий кеш в пам'яті для зберігання об'єктів користувачів, 
 * щоб зменшити кількість запитів до бази даних.
 */

// TTL (Time To Live) - час життя запису в кеші (5 хвилин)
const CACHE_TTL = 5 * 60 * 1000

// Сам кеш, що зберігає користувача та час додавання
const userCache = new Map<number, { user: User; timestamp: number }>()

/**
 * Отримує користувача з кешу, якщо він існує і не прострочений.
 * @param id - ID користувача.
 * @returns Об'єкт користувача або null.
 */
export function getCachedUser(id: number): User | null {
  const cached = userCache.get(id)
  if (!cached) {
    return null
  }

  // Перевірка, чи не застарів кеш
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    userCache.delete(id) // Видаляємо застарілий запис
    return null
  }

  return cached.user
}

/**
 * Додає або оновлює запис про користувача в кеші.
 * @param user - Об'єкт користувача для кешування.
 */
export function setCachedUser(user: User): void {
  userCache.set(user.id, { user, timestamp: Date.now() })
}

/**
 * Примусово видаляє запис про користувача з кешу.
 * Використовується при оновленні або видаленні користувача.
 * @param id - ID користувача, кеш якого потрібно інвалідувати.
 */
export function invalidateUserCache(id: number): void {
  userCache.delete(id)
}
