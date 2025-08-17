import { getUserById, getUsersOrderByUserId } from '~~/server/repositories/user.repository'
import type { User, PublicUser } from '~~/shared/types/auth'
import jwt from 'jsonwebtoken'
import { Order } from '~~/shared/types/order'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

/**
 * Получить пользователя по токену
 */
export const getUserByToken = async (token: string): Promise<PublicUser | null> => {
  try {
    // Декодируем JWT токен
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number, role: string, phone: string }
    
    // console.log('🔍 JWT decoded:', { id: decoded.id, role: decoded.role, phone: decoded.phone })
    
    // Получаем пользователя из БД
    const user = await getUserById(decoded.id)
    
    if (!user || !user.isActive) {
      // console.log('❌ User not found or inactive:', decoded.id)
      return null
    }
    
    // console.log('✅ User found in DB:', user.phone)
    
    // Возвращаем только публичные данные
    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString()
    }
  } catch (error) {
    // console.error('Error getting user by token:', error)
    return null
  }
}

/**
 * Преобразовать полного пользователя в публичного
 */
export const toPublicUser = (user: User): PublicUser => {
  return {
    id: user.id,
    phone: user.phone,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString()
  }
}

export const fetchUsersOrders = async (userId: number): Promise<Order[]> => {
  const orders = await getUsersOrderByUserId(userId)

  // Prisma returns Date objects, but our shared Order type expects strings.
  // We need to manually serialize the dates to strings.
  return orders.map(order => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
    // updatedAt: order.updatedAt?.toISOString() || null,
    items: order.items.map(item => ({
      ...item,
      product: {
        ...item.product,
        createdAt: item.product.createdAt.toISOString(),
      }
    }))
  }))
}