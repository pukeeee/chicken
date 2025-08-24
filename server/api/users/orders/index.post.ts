import { orderSchemas, type OrderCreateInput } from '~~/shared/validation/schemas'
import { orderService } from '~~/server/services/users/orderService'
import { ValidationError, UnauthorizedError } from '~~/server/services/errorService'
import { createLogger } from '~~/server/utils/logger'
import type { OrderCreationResponse } from '~~/server/types/order.types'

/**
 * API-ендпоінт для створення нового замовлення.
 */
export default defineEventHandler(async (event) => {
  const logger = createLogger({
    path: event.path,
    method: event.method,
    ip: getRequestIP(event, { xForwardedFor: true }),
  })

  // Крок 1: Перевірка аутентифікації користувача.
  // Middleware auth.api.ts має додавати об'єкт user в контекст запиту.
  const user = event.context.user
  if (!user || !user.id) {
    logger.warn('Спроба створення замовлення без авторизації')
    throw new UnauthorizedError('Для створення замовлення потрібна авторизація.')
  }

  logger.info({ userId: user.id }, 'Обробка запиту на створення замовлення')

  // Крок 2: Читання та базова перевірка тіла запиту.
  let body: OrderCreateInput
  try {
    body = await readBody<OrderCreateInput>(event)
  } catch {
    logger.warn('Невірний формат тіла запиту')
    throw new ValidationError('Невірний формат даних запиту.')
  }

  if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
    throw new ValidationError('Тіло запиту не може бути порожнім.')
  }

  // Крок 3: Валідація вхідних даних за допомогою схеми Zod.
  const validationResult = orderSchemas.create.safeParse(body)
  if (!validationResult.success) {
    logger.warn({
      validationErrors: validationResult.error.issues,
      userId: user.id,
    }, 'Помилка валідації даних замовлення')

    // Форматування помилок для зручної обробки на клієнті.
    const fieldErrors = validationResult.error.issues.reduce((acc, issue) => {
      const path = issue.path.join('.')
      if (!acc[path]) {
        acc[path] = []
      }
      acc[path].push(issue.message)
      return acc
    }, {} as Record<string, string[]>)

    throw new ValidationError('Помилка валідації даних замовлення.', fieldErrors)
  }

  // Крок 4: Виклик сервісу для створення замовлення.
  const newOrder = await orderService.createNewOrder(user.id, validationResult.data)

  // Крок 5: Встановлення статусу відповіді 201 (Created).
  setResponseStatus(event, 201)

  logger.info({
    orderId: newOrder.id,
    userId: user.id,
    total: newOrder.total.toString(), // Перетворюємо Decimal на string для логування
  }, 'Замовлення успішно створено в API')

  // Крок 6: Повернення очищених даних, необхідних для клієнта.
  // Це запобігає витоку зайвої інформації, такої як повні дані користувача або категорії.
  const response: OrderCreationResponse = {
    id: newOrder.id,
    status: newOrder.status,
    total: newOrder.total,
    createdAt: newOrder.createdAt,
    items: newOrder.items.map(item => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      product: {
        id: item.product.id,
        name: item.product.name,
        image: item.product.image,
      },
    })),
  }

  return orderSchemas.createResponse.parse(response)
})