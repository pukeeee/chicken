import { z } from 'zod'
import { OrderStatus, PaymentMethod } from '../constants/orderConstants'

// =================================================================
// БАЗОВІ СХЕМИ ДЛЯ ПОЛІВ (ПЕРЕВИКОРИСТОВУВАНІ)
// =================================================================

/**
 * Базова схема для валідації номера телефону.
 * Формат: +380xxxxxxxxx
 */
const phoneSchema = z
  .string()
  .regex(/^\+380\d{9}$/, 'Невірний формат номера телефону (очікується +380xxxxxxxxx)')

/**
 * Базова схема для валідації коду підтвердження.
 * 6 символів, капітальні літери та цифри.
 */
const codeSchema = z
  .string()
  .length(6, 'Код має містити рівно 6 символів')
  .regex(/^[123456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/, 'Код містить недопустимі символи')

/**
 * Базова, уніфікована схема для валідації імені.
 * Мін. 2 символи, макс. 100.
 */
const nameSchema = z
  .string()
  .min(2, "Ім'я має містити щонайменше 2 символи")
  .max(100, "Ім'я занадто довге (максимум 100 символів)")

/**
 * Базова схема для валідації email.
 */
const emailSchema = z.email({ message: 'Невірний формат email адреси' })

// =================================================================
// СХЕМИ ДЛЯ СУТНОСТЕЙ
// =================================================================

/**
 * Схеми, що стосуються автентифікації та профілю користувача.
 */
export const authSchemas = {
  /**
   * Валідація запиту на відправку коду підтвердження.
   */
  sendCode: z.object({
    phone: phoneSchema,
  }),

  /**
   * Валідація запиту на вхід в систему.
   */
  login: z.object({
    phone: phoneSchema,
    code: codeSchema,
  }),

  /**
   * Валідація запиту на оновлення профілю користувача.
   * - `partial()`: робить всі поля (name, email) необов'язковими.
   * - `refine()`: перевіряє, що хоча б одне поле було надіслане для оновлення.
   */
  updateProfile: z
    .object({
      name: nameSchema,
      email: emailSchema.nullable(), // Дозволяємо null для видалення email
    })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Має бути принаймні одне поле для оновлення',
    }),
}

/**
 * Схеми, що стосуються замовлень.
 */
export const orderSchemas = {
  /**
   * Валідація даних для створення нового замовлення.
   */
  create: z.object({
    customerName: nameSchema, // Використовуємо уніфіковану схему
    customerPhone: phoneSchema,
    customerEmail: emailSchema.nullable().optional(), // Email може бути відсутнім або null
    deliveryAddress: z.string().min(5, 'Адреса доставки має бути детальнішою'),
    paymentMethod: z.enum(PaymentMethod, { message: 'Оберіть спосіб оплати' }),
    items: z
      .array(
        z.object({
          productId: z.number().int().positive(),
          quantity: z.number().int().min(1),
        })
      )
      .min(1, 'Кошик не може бути порожнім'),
  }),

  /**
   * Валідація даних для оновлення замовлення (використовується адміністратором).
   */
  update: z
    .object({
      status: z.enum(OrderStatus).optional(),
      customerName: nameSchema.optional(), // Використовуємо уніфіковану схему
      customerPhone: phoneSchema.optional(),
      deliveryAddress: z.string().min(5, 'Адреса доставки має бути детальнішою').optional(),
    })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Має бути принаймні одне поле для оновлення',
    }),

  /**
   * Валідація параметрів для фільтрації та пагінації замовлень.
   */
  filters: z.object({
    status: z.enum(OrderStatus).optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),
}

/**
 * Схеми, що стосуються адміністративної панелі.
 */
export const adminSchemas = {
  /**
   * Валідація даних для входу адміністратора.
   */
  login: z.object({
    username: z.string().min(3, 'Логін має містити мінімум 3 символи'),
    password: z.string().min(6, 'Пароль має містити мінімум 6 символів'),
  }),

  /**
   * Валідація даних для створення нового користувача (адміністратором).
   */
  createUser: z.object({
    phone: phoneSchema,
    name: nameSchema.optional(),
    email: emailSchema.nullable().optional(),
    role: z.enum(['USER', 'ADMIN']).default('USER'),
  }),
}

// =================================================================
// ДОПОМІЖНІ СХЕМИ
// =================================================================

/**
 * Експортуємо базові схеми для можливого перевикористання в інших місцях.
 */
export const fieldSchemas = {
  phone: phoneSchema,
  code: codeSchema,
  email: emailSchema,
  name: nameSchema,
}

/**
 * Універсальна схема для валідації ID.
 */
export const idSchema = z.object({
  id: z.coerce.number().int().positive('ID має бути позитивним цілим числом'),
})

// =================================================================
// TYPESCRIPT ТИПИ ЗІ СХЕМ ZOD
// =================================================================

// Типи для автентифікації та профілю
export type AuthSendCodeInput = z.infer<typeof authSchemas.sendCode>
export type AuthLoginInput = z.infer<typeof authSchemas.login>
export type AuthUpdateProfileInput = z.infer<typeof authSchemas.updateProfile>

// Типи для замовлень
export type OrderCreateInput = z.infer<typeof orderSchemas.create>
export type OrderUpdateInput = z.infer<typeof orderSchemas.update>
export type OrderFiltersInput = z.infer<typeof orderSchemas.filters>

// Типи для адміністратора
export type AdminLoginInput = z.infer<typeof adminSchemas.login>
export type AdminCreateUserInput = z.infer<typeof adminSchemas.createUser>

// Тип для ID
export type IdInput = z.infer<typeof idSchema>
