import { getUserById } from '../../repositories/user.repository'
import type { User, PublicUser } from '~/app/types/auth'
import jwt from 'jsonwebtoken'

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