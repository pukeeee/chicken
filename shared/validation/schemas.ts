import { z } from 'zod'
import { OrderStatus, PaymentMethod } from '../constants/orderConstants'

// Базовые схемы для повторного использования
const phoneSchema = z
  .string()
  .regex(/^\+380\d{9}$/, 'Невірний формат номера телефону')
  .refine(
    (phone) => phone.length === 13,
    'Номер телефону має містити 13 символів'
  )

const codeSchema = z
  .string()
  .length(6, 'Код має містити рівно 6 символів')
  .regex(/^[123456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/, 'Код містить недопустимі символи')

const emailSchema = z
  .email('Невірний формат email адреси')
  .optional()
  .or(z.literal(''))

const nameSchema = z
  .string()
  .min(1, 'Ім\'я не може бути порожнім')
  .max(100, 'Ім\'я занадто довге (максимум 100 символів)')
  .optional()
  .or(z.literal(''))

// Схемы для авторизации
export const authSchemas = {
  // Отправка кода
  sendCode: z.object({
    phone: phoneSchema
  }),

  // Вход в систему
  login: z.object({
    phone: phoneSchema,
    code: codeSchema
  }),

  // Обновление профиля пользователя
  updateProfile: z.object({
    name: nameSchema,
    email: emailSchema
  }),

  // Только телефон (для различных проверок)
  phone: z.object({
    phone: phoneSchema
  }),

  // Только код
  code: z.object({
    code: codeSchema
  })
}

// Схемы для заказов
export const orderSchemas = {
  // Создание заказа
  create: z.object({
    customerName: z.string().min(1, 'Ім\'я клієнта обов\'язкове'),
    customerPhone: phoneSchema,
    customerEmail: emailSchema,
    deliveryAddress: z.string().min(1, 'Адреса доставки обов\'язкова'),
    paymentMethod: z.enum(PaymentMethod, {
      message: 'Оберіть спосіб оплати'
    }),
    items: z.array(
      z.object({
        productId: z.number().positive('ID продукту має бути позитивним'),
        quantity: z.number().min(1, 'Кількість має бути не менше 1'),
        price: z.number().positive('Ціна має бути позитивною')
      })
    ).min(1, 'Замовлення має містити хоча б один товар'),
    total: z.number().positive('Загальна сума має бути позитивною')
  }),

  // Обновление заказа (все поля опциональные)
  update: z.object({
    status: z.enum(OrderStatus).optional(),
    customerName: z.string().min(1).optional(),
    customerPhone: phoneSchema.optional(),
    customerEmail: emailSchema.optional(),
    deliveryAddress: z.string().min(1).optional(),
    paymentMethod: z.enum(PaymentMethod).optional(),
    total: z.number().positive().optional()
  }),

  // Фильтры для поиска заказов
  filters: z.object({
    status: z.string().optional(),
    search: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional()
  })
}

// Схемы для продуктов и меню
export const menuSchemas = {
  // Создание продукта
  createProduct: z.object({
    name: z.string().min(1, 'Назва продукту обов\'язкова'),
    price: z.number().positive('Ціна має бути позитивною'),
    categoryId: z.number().positive('Оберіть категорію'),
    description: z.string().optional(),
    image: z.url({ message: 'Невірний формат URL зображення' }).optional()
  }),

  // Создание категории
  createCategory: z.object({
    name: z.string().min(1, 'Назва категорії обов\'язкова'),
    order: z.number().nonnegative('Порядок не може бути від\'ємним').optional()
  })
}

// Схемы для администратора
export const adminSchemas = {
  // Вход администратора
  login: z.object({
    username: z.string().min(1, 'Логін обов\'язковий'),
    password: z.string().min(6, 'Пароль має містити мінімум 6 символів')
  }),

  // Создание пользователя
  createUser: z.object({
    phone: phoneSchema,
    name: nameSchema,
    email: emailSchema,
    role: z.enum(['USER', 'ADMIN']).default('USER')
  })
}

// Типы TypeScript из схем Zod
export type AuthSendCodeInput = z.infer<typeof authSchemas.sendCode>
export type AuthLoginInput = z.infer<typeof authSchemas.login>
export type AuthUpdateProfileInput = z.infer<typeof authSchemas.updateProfile>

export type OrderCreateInput = z.infer<typeof orderSchemas.create>
export type OrderUpdateInput = z.infer<typeof orderSchemas.update>
export type OrderFiltersInput = z.infer<typeof orderSchemas.filters>

export type MenuCreateProductInput = z.infer<typeof menuSchemas.createProduct>
export type MenuCreateCategoryInput = z.infer<typeof menuSchemas.createCategory>

export type AdminLoginInput = z.infer<typeof adminSchemas.login>
export type AdminCreateUserInput = z.infer<typeof adminSchemas.createUser>

// Вспомогательные функции для работы с отдельными полями
export const fieldSchemas = {
  phone: phoneSchema,
  code: codeSchema,
  email: emailSchema,
  name: nameSchema
}