import type { User } from "~/types/auth"
import { setToken } from "~/server/repositories/user.repository"
import { getUserByPhone, createUser } from "~/server/repositories/user.repository"

export const loginService = {
  /**
   * Проверяет существование пользователя по номеру телефона
   * @param phone - номер телефона
   * @returns пользователь или null
   */
  async findUserByPhone(phone: string): Promise<User | null> {
    const user = await getUserByPhone(phone)
    
    console.log(`[DB STUB] Checking user existence for phone: ${phone}`)
    return user || null
  },

  /**
   * Создает нового пользователя
   * @param phone - номер телефона
   * @returns созданный пользователь
   */
  async createUser(phone: string): Promise<User> {
    const newUser = await createUser(phone)

    console.log(`[DB STUB] Creating new user for phone: ${phone}`)
    
    return newUser
  },

  /**
   * Получает или создает пользователя по номеру телефона
   * @param phone - номер телефона
   * @returns пользователь (существующий или новый)
   */
  async getOrCreateUser(phone: string): Promise<User> {
    let user = await this.findUserByPhone(phone)
    
    if (!user) {
      console.log(`User not found for phone ${phone}, creating new user`)
      user = await this.createUser(phone)
    } else {
      console.log(`Existing user found for phone ${phone}`)
    }
    
    return user
  },

  /**
   * Сохраняет токен пользователя в БД
   * @param userId - ID пользователя
   * @param token - JWT токен
   */
  async saveUserToken(userId: string | number, token: string): Promise<void> {
    // Используем существующий метод из repository
    await setToken(Number(userId), token)
    console.log(`Token saved for user ${userId}`)
  }
}