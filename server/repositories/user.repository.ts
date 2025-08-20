import prisma from '~~/server/database/client'
import type { AuthUpdateProfileInput } from '~~/shared/validation/schemas'

/**
 * Знаходить користувача за його email.
 * @param email - Email користувача.
 * @returns Об'єкт користувача або null, якщо не знайдено.
 */
export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  })
}

/**
 * Знаходить користувача за його ID.
 * @param id - ID користувача.
 * @returns Об'єкт користувача або null, якщо не знайдено.
 */
export async function getUserById(id: number) {
  return await prisma.user.findUnique({
    where: { id },
  })
}

/**
 * Знаходить користувача за його номером телефону.
 * @param phone - Номер телефону користувача.
 * @returns Об'єкт користувача або null, якщо не знайдено.
 */
export async function getUserByPhone(phone: string) {
  return await prisma.user.findUnique({
    where: { phone },
  })
}

/**
 * Встановлює або оновлює токен для скидання пароля або сесії.
 * @param id - ID користувача.
 * @param token - Токен для встановлення.
 * @returns Оновлений об'єкт користувача.
 */
export async function setToken(id: number, token: string) {
  return await prisma.user.update({
    where: { id },
    data: { token },
  })
}

/**
 * Видаляє токен у користувача (наприклад, після виходу з системи).
 * @param id - ID користувача.
 * @returns Оновлений об'єкт користувача.
 */
export async function removeToken(id: number) {
  return await prisma.user.update({
    where: { id },
    data: { token: null },
  })
}

/**
 * Створює нового користувача тільки за номером телефону.
 * @param phone - Номер телефону для реєстрації.
 * @returns Створений об'єкт користувача.
 */
export async function createUser(phone: string) {
  return await prisma.user.create({
    data: {
      phone,
    },
  })
}

/**
 * Оновлює дані користувача за його ID.
 * @param id - ID користувача, якого потрібно оновити.
 * @param data - Об'єкт з даними для оновлення (name, email).
 * @returns Оновлений об'єкт користувача.
 */
export async function updateUserById(id: number, data: AuthUpdateProfileInput) {
  return await prisma.user.update({
    where: { id },
    data,
  })
}

/**
 * Отримує всі замовлення конкретного користувача.
 * @param userId - ID користувача, чиї замовлення потрібно отримати.
 * @returns Масив замовлень з детальною інформацією про товари.
 */
export async function getUsersOrderByUserId(userId: number) {
  return await prisma.order.findMany({
    where: { userId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  })
}
