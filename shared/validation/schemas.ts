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
  .length(9, 'Номер має складатися з 9 цифр')
  .regex(/^\d{9}$/, 'Номер може містити лише цифри')
  .transform(val => `+380${val}`)

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
// СХЕМИ ДЛЯ АВТЕНТИФІКАЦІЇ ТА ПРОФІЛЮ
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

// =================================================================
// СХЕМИ ДЛЯ МЕНЮ
// =================================================================

/**
 * Спрощена схема продукту для відображення в списку меню.
 */
const menuProductSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  price: z.number(),
  image: z.string().nullable(),
})

/**
 * Схема категорії, що містить масив продуктів.
 */
const menuCategorySchema = z.object({
  id: z.number().int(),
  name: z.string(),
  products: z.array(menuProductSchema),
})

/**
 * Повна схема продукту з усіма полями з БД (скалярними).
 */
const menuProductDetailsSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  image: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(), // Prisma повертає об'єкт Date
  categoryId: z.number().int().nullable(),
})

/**
 * Схеми, що стосуються меню.
 */
export const menuSchemas = {
  /**
   * Спрощена схема продукту для списків.
   */
  product: menuProductSchema,
  /**
   * Схема категорії з продуктами.
   */
  category: menuCategorySchema,
  /**
   * Схема для відповіді API, що повертає повне меню (категорії з продуктами).
   */
  response: z.object({
    success: z.literal(true),
    data: z.array(z.lazy(() => menuCategorySchema)),
  }),
  /**
   * Повна схема одного продукту.
   */
  productDetails: menuProductDetailsSchema,
  /**
   * Схема для відповіді API, що повертає один деталізований продукт.
   */
  productResponse: z.object({
    success: z.literal(true),
    data: z.lazy(() => menuProductDetailsSchema),
  }),
}

// =================================================================
// СХЕМИ ДЛЯ КОРИСТУВАЧА
// =================================================================

/**
 * Схема з публічними даними користувача, безпечними для передачі на клієнт.
 */
const userPublicSchema = z.object({
  id: z.number().int(),
  phone: z.string(),
  name: z.string().nullable(),
  email: z.email().nullable(),
  createdAt: z.date(), // Prisma повертає об'єкт Date
})

/**
 * Схема одного замовлення для особистого кабінету користувача.
 */
const userOrderSchema = z.object({
  id: z.number().int(),
  userId: z.number().int(),
  customerName: z.string(),
  customerPhone: z.string(),
  customerEmail: z.email(),
  deliveryAddress: z.string(),
  paymentMethod: z.enum(Object.values(PaymentMethod) as [string, ...string[]]),
  status: z.enum(Object.values(OrderStatus) as [string, ...string[]]),
  total: z.number(),
  createdAt: z.iso.datetime(), // У відповідь API йде рядок
  items: z.array(z.object({
    id: z.number().int(),
    orderId: z.number().int(),
    productId: z.number().int(),
    quantity: z.number().int(),
    price: z.number(),
    product: z.lazy(() => menuSchemas.productDetails.extend({
        createdAt: z.iso.datetime(), // У відповідь API йде рядок
    })),
  })),
})

/**
 * Схеми, що стосуються користувача.
 */
export const userSchemas = {
  /**
   * Публічні дані користувача.
   */
  public: userPublicSchema,
  /**
   * Одне замовлення користувача.
   */
  order: userOrderSchema,
  /**
   * Схема для успішної відповіді з даними користувача.
   */
  successResponse: z.object({
    success: z.literal(true),
    user: z.lazy(() => userPublicSchema),
  }),
  /**
   * Схема для відповіді при оновленні профілю користувача.
   */
  updateResponse: z.object({
    user: z.lazy(() => userPublicSchema),
  }),
  /**
   * Схема для відповіді при успішному вході користувача.
   */
  loginResponse: z.object({
    success: z.literal(true),
    message: z.string(),
    user: z.lazy(() => userPublicSchema.extend({
      createdAt: z.iso.datetime(), // У відповідь API йде рядок
    })),
  }),
  /**
   * Схема для відповіді зі списком замовлень користувача.
   */
  ordersResponse: z.array(z.lazy(() => userOrderSchema)),
  /**
   * Схема для відповіді при запиті коду підтвердження.
   */
  verifyResponse: z.object({
    success: z.literal(true),
    message: z.string(),
  }),
}

// =================================================================
// СХЕМИ ДЛЯ ЗАМОВЛЕНЬ (АДМІН-ПАНЕЛЬ)
// =================================================================

/**
 * Схема одного замовлення для списку в адмін-панелі.
 */
const orderAdminItemSchema = z.object({
  id: z.number().int(),
  userId: z.number().int(),
  customerName: z.string(),
  customerPhone: z.string(),
  customerEmail: z.email(),
  deliveryAddress: z.string(),
  paymentMethod: z.enum(Object.values(PaymentMethod) as [string, ...string[]]),
  status: z.enum(Object.values(OrderStatus) as [string, ...string[]]),
  total: z.number(),
  createdAt: z.date(), // Prisma повертає об'єкт Date
  items: z.array(z.object({
    quantity: z.number().int(),
    product: z.object({
      name: z.string(),
    }),
  })),
})

/**
 * Схема детальної інформації про замовлення з усіма зв'язками для адмін-панелі.
 */
const orderAdminDetailsSchema = z.object({
  id: z.number().int(),
  userId: z.number().int(),
  customerName: z.string(),
  customerPhone: z.string(),
  customerEmail: z.email(),
  deliveryAddress: z.string(),
  paymentMethod: z.enum(Object.values(PaymentMethod) as [string, ...string[]]),
  status: z.enum(Object.values(OrderStatus) as [string, ...string[]]),
  total: z.number(),
  createdAt: z.date(), // Prisma повертає об'єкт Date
  items: z.array(z.object({
    id: z.number().int(),
    orderId: z.number().int(),
    productId: z.number().int(),
    quantity: z.number().int(),
    price: z.number(),
    product: menuProductDetailsSchema,
  })),
  payment: z.object({
    id: z.number().int(),
    orderId: z.number().int(),
    amount: z.number(),
    method: z.enum(Object.values(PaymentMethod) as [string, ...string[]]),
    status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']),
    createdAt: z.date(), // Prisma повертає об'єкт Date
  }).nullable(),
  user: userPublicSchema,
})

/**
 * Схеми, що стосуються замовлень.
 */
export const orderSchemas = {
  /**
   * Валідація вхідних даних при створенні нового замовлення.
   */
  create: z.object({
    customerName: nameSchema,
    customerPhone: phoneSchema,
    customerEmail: emailSchema.min(1, { message: "Email є обов'язковим полем" }),
    deliveryAddress: z.string().min(5, 'Адреса доставки має бути детальнішою'),
    paymentMethod: z.enum(Object.values(PaymentMethod) as [string, ...string[]]),
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
   * Валідація вхідних даних при оновленні замовлення адміністратором.
   */
  update: z
    .object({
      status: z.enum(Object.values(OrderStatus) as [string, ...string[]]).optional(),
      customerName: nameSchema.optional(),
      customerPhone: phoneSchema.optional(),
      customerEmail: emailSchema.optional(),
      deliveryAddress: z.string().min(5, 'Адреса доставки має бути детальнішою').optional(),
      paymentMethod: z.enum(Object.values(PaymentMethod) as [string, ...string[]]).optional(), 
      items: z.array( // Спрощено
        z.object({
          productId: z.number().int().positive(), // ID продукту
          quantity: z.number().int().min(1), // Кількість
        })
      ).optional(),
    })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Має бути принаймні одне поле для оновлення',
    }),
  /**
   * Валідація параметрів для фільтрації та пагінації замовлень в адмін-панелі.
   */
  filters: z.object({
    status: z.enum(Object.values(OrderStatus) as [string, ...string[]]).optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),
  /**
   * Схема одного замовлення для списку в адмін-панелі.
   */
  adminItem: orderAdminItemSchema,
  /**
   * Схема для відповіді API зі списком замовлень для адмін-панелі.
   */
  adminListResponse: z.object({
    success: z.literal(true),
    orders: z.array(z.lazy(() => orderAdminItemSchema)),
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    totalPages: z.number().int(),
    orderStats: z.record(z.enum(Object.values(OrderStatus) as [string, ...string[]]), z.number().int()),
  }),
  /**
   * Схема детальної інформації про замовлення для адмін-панелі.
   */
  adminDetails: orderAdminDetailsSchema,
  /**
   * Схема для відповіді API при оновленні замовлення адміністратором.
   */
  adminUpdateResponse: z.object({
    success: z.literal(true),
    data: z.lazy(() => orderAdminDetailsSchema),
  }),
  /**
   * Схема для відповіді API при успішному створенні замовлення користувачем.
   */
  createResponse: z.object({
    id: z.number().int(),
    status: z.enum(Object.values(OrderStatus) as [string, ...string[]]),
    total: z.number(),
    createdAt: z.iso.datetime(), // Prisma повертає Date, але сервіс серіалізує в рядок. Краще валідувати рядок.
    items: z.array(z.object({
      id: z.number().int(),
      quantity: z.number().int(),
      price: z.number(),
      product: z.object({
        id: z.number().int(),
        name: z.string(),
        image: z.string().nullable(),
      }),
    })),
  }),

  /**
   * Схема для внутрішньої передачі даних при створенні позиції замовлення.
   */
  itemCreate: z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().min(1),
    price: z.number(),
  }),
}

// =================================================================
// СХЕМИ ДЛЯ АДМІНІСТРАТИВНОЇ ПАНЕЛІ
// =================================================================

/**
 * Схеми, що стосуються адміністративної панелі.
 */
export const adminSchemas = {
  /**
   * Валідація даних для входу адміністратора.
   */
  login: z.object({
    email: emailSchema,
    password: z.string().min(6, 'Пароль має містити мінімум 6 символів'),
  }),
  /**
   * Схема для успішної відповіді після входу адміністратора.
   */
  loginResponse: z.object({
    success: z.literal(true),
  }),
  /**
   * Валідація даних для створення нового користувача адміністратором.
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
 * Універсальна схема для простої успішної відповіді.
 */
export const successSchema = z.object({
  success: z.literal(true),
});

/**
 * Колекція базових схем для можливого перевикористання.
 */
export const fieldSchemas = {
  phone: phoneSchema,
  code: codeSchema,
  email: emailSchema,
  name: nameSchema,
}

/**
 * Універсальна схема для валідації ID в параметрах запиту.
 */
export const idSchema = z.object({
  id: z.coerce.number().int().positive('ID має бути позитивним цілим числом'),
})

// =================================================================
// TYPESCRIPT ТИПИ ЗІ СХЕМ ZOD
// =================================================================

// ... (типи залишаються без змін)

export type AuthSendCodeInput = z.infer<typeof authSchemas.sendCode>
export type AuthLoginInput = z.infer<typeof authSchemas.login>
export type AuthUpdateProfileInput = z.infer<typeof authSchemas.updateProfile>

export type OrderCreateInput = z.infer<typeof orderSchemas.create>
export type OrderUpdateInput = z.infer<typeof orderSchemas.update>
export type OrderFiltersInput = z.infer<typeof orderSchemas.filters>
export type OrderAdminItem = z.infer<typeof orderSchemas.adminItem>
export type OrderAdminListResponse = z.infer<typeof orderSchemas.adminListResponse>
export type OrderAdminDetails = z.infer<typeof orderSchemas.adminDetails>
export type OrderAdminUpdateResponse = z.infer<typeof orderSchemas.adminUpdateResponse>
export type OrderCreateResponse = z.infer<typeof orderSchemas.createResponse>
export type OrderItemCreateInput = z.infer<typeof orderSchemas.itemCreate>

export type AdminLoginInput = z.infer<typeof adminSchemas.login>
export type AdminLoginResponse = z.infer<typeof adminSchemas.loginResponse>
export type AdminCreateUserInput = z.infer<typeof adminSchemas.createUser>

export type MenuProduct = z.infer<typeof menuSchemas.product>
export type MenuCategory = z.infer<typeof menuSchemas.category>
export type MenuResponse = z.infer<typeof menuSchemas.response>
export type MenuProductDetails = z.infer<typeof menuSchemas.productDetails>
export type MenuProductResponse = z.infer<typeof menuSchemas.productResponse>

export type UserPublic = z.infer<typeof userSchemas.public>
export type UserSuccessResponse = z.infer<typeof userSchemas.successResponse>
export type UserUpdateResponse = z.infer<typeof userSchemas.updateResponse>
export type UserLoginResponse = z.infer<typeof userSchemas.loginResponse>
export type UserVerifyResponse = z.infer<typeof userSchemas.verifyResponse>
export type UserOrder = z.infer<typeof userSchemas.order>
export type UserOrdersResponse = z.infer<typeof userSchemas.ordersResponse>

export type IdInput = z.infer<typeof idSchema>

export type SuccessResponse = z.infer<typeof successSchema>