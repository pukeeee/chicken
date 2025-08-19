import { z } from 'zod'
import { orderSchemas, type OrderCreateInput } from '~~/shared/validation/schemas'
import { orderService } from '~~/server/services/users/orderService'
import { ValidationError, UnauthorizedError } from '~~/server/services/errorService'

/**
 * API-ендпоінт для створення нового замовлення.
 */
export default defineEventHandler(async (event) => {
  // 1. Перевіряємо, чи користувач автентифікований.
  //    Очікується, що middleware `auth.api.ts` додає об'єкт `user` в контекст.
  const user = event.context.user
  if (!user || !user.id) {
    throw new UnauthorizedError('Для створення замовлення потрібна авторизація.')
  }

  // 2. Читаємо тіло запиту.
  const body = await readBody<OrderCreateInput>(event)

  // 3. Валідуємо вхідні дані за допомогою схеми Zod.
  const validationResult = orderSchemas.create.safeParse(body)
  if (!validationResult.success) {
    // Якщо валідація не пройдена, форматуємо помилки в чистий об'єкт.
    const fieldErrors = validationResult.error.issues.reduce((acc, issue) => {
      const path = issue.path.join('.')
      if (!acc[path]) {
        acc[path] = []
      }
      acc[path].push(issue.message)
      return acc
    }, {} as Record<string, string[]>)

    // Викидаємо нашу кастомну помилку валідації.
    // Це дозволить глобальному обробнику коректно її залогувати.
    throw new ValidationError('Помилка валідації даних замовлення.', fieldErrors)
  }

  // 4. Викликаємо сервіс для створення замовлення.
  //    Вся бізнес-логіка інкапсульована в сервісі.
  const newOrder = await orderService.createNewOrder(user.id, validationResult.data)

  // 5. Встановлюємо статус відповіді 201 (Created).
  setResponseStatus(event, 201)

  // 6. Повертаємо створене замовлення.
  return newOrder
})
