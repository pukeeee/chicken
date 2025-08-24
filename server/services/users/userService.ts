import { 
  getUserById, 
  getUsersOrderByUserId, 
  updateUserById, 
  getUserByEmail 
} from '~~/server/repositories/user.repository'
import jwt from 'jsonwebtoken'
import { ValidationError } from '~~/server/services/errorService'
import type { AuthUpdateProfileInput, UserPublic, UserOrder } from '~~/shared/validation/schemas'
import { invalidateUserCache } from '~~/server/utils/userCache'
import { User } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

/**
 * Отримує дані користувача за JWT токеном.
 * Використовується для перевірки автентифікації на стороні сервера.
 * @param token - JWT токен.
 * @returns Публічні дані користувача або null, якщо токен невалідний або користувач неактивний.
 */
export const getUserByToken = async (token: string): Promise<UserPublic | null> => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number, role: string, phone: string }
    
    const user = await getUserById(decoded.id)
    
    if (!user || !user.isActive) {
      return null
    }
    
    return toPublicUser(user)

  } catch {
    // Повертаємо null при будь-якій помилці верифікації токена
    return null
  }
}

/**
 * Оновлює профіль користувача, виконуючи бізнес-логіку та інвалідуючи кеш.
 * @param userId - ID користувача для оновлення.
 * @param data - Валідовані дані для оновлення (name, email).
 * @returns Оновлений повний об'єкт користувача.
 * @throws {ValidationError} Якщо email вже зайнятий іншим користувачем.
 */
export async function updateUserProfile(userId: number, data: AuthUpdateProfileInput) {
  // Ключова бізнес-логіка: перевірка унікальності email.
  if (data.email) {
    const existingUser = await getUserByEmail(data.email)
    if (existingUser && existingUser.id !== userId) {
      throw new ValidationError('Цей email вже використовується іншим акаунтом.')
    }
  }

  // Крок 1: Оновлюємо дані в базі даних.
  const updatedUser = await updateUserById(userId, data)

  // Крок 2: Інвалідуємо (видаляємо) кеш для цього користувача.
  // Це гарантує, що при наступному запиті дані будуть завантажені з БД.
  invalidateUserCache(updatedUser.id)

  return updatedUser
}

/**
 * Конвертує повний об'єкт користувача (з паролем і т.д.) в публічний об'єкт.
 * @param user - Повний об'єкт користувача з Prisma.
 * @returns Об'єкт користувача з полями, безпечними для передачі на фронтенд.
 */
export const toPublicUser = (user: User): UserPublic => {
  return {
    id: user.id,
    phone: user.phone,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString() // <--- Перетворюємо Date на string
  }
}

/**
 * Отримує історію замовлень користувача.
 * @param userId - ID користувача.
 * @returns Масив замовлень з деталізацією.
 */
export const fetchUsersOrders = async (userId: number): Promise<UserOrder[]> => {
  const orders = await getUsersOrderByUserId(userId)

  // Prisma повертає об'єкти Date, але наш спільний тип Order очікує рядки.
  // Prisma також повертає Decimal, але наш спільний тип Order очікує number.
  return orders.map(order => ({
    ...order,
    total: order.total.toNumber(), // Перетворюємо Decimal на number
    createdAt: order.createdAt.toISOString(),
    items: order.items.map(item => ({
      ...item,
      price: item.price.toNumber(), // Перетворюємо Decimal на number
      product: {
        ...item.product,
        price: item.product.price.toNumber(), // Перетворюємо Decimal на number
        createdAt: item.product.createdAt.toISOString(),
      }
    }))
  }))
}
