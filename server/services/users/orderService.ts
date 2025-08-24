import { Decimal } from '@prisma/client/runtime/library'
import { getProductsByIds } from '~~/server/repositories/menu.repository'
import { createOrder } from '~~/server/repositories/order.repository'
import { getUserByPhone, createUser } from '~~/server/repositories/user.repository'
import { NotFoundError, ValidationError } from '~~/server/services/errorService'
import { createLogger } from '~~/server/utils/logger'
import type { OrderCreateInput, OrderAdminDetails } from '~~/shared/validation/schemas'

/**
 * Сервіс для обробки бізнес-логіки, пов'язаної із замовленнями користувачів.
 */
export const orderService = {
  /**
   * Створює нове замовлення.
   * Автоматично знаходить існуючого користувача за номером телефону або створює нового.
   *
   * @param orderData - Валідовані дані замовлення від клієнта.
   * @returns Повні дані створеного замовлення.
   */
  async createNewOrder(orderData: OrderCreateInput): Promise<OrderAdminDetails> {
    const logger = createLogger({ operation: 'createOrder' })

    logger.info({
      orderData: {
        customerPhone: orderData.customerPhone,
        itemsCount: orderData.items.length,
      },
    }, 'Початок процесу створення замовлення')

    // Крок 1: Знайти або створити користувача за номером телефону
    let user = await getUserByPhone(orderData.customerPhone)
    if (!user) {
      logger.info({ phone: orderData.customerPhone }, 'Користувача не знайдено, створюємо нового.')
      user = await createUser(orderData.customerPhone)
    }

    const userId = user.id
    logger.info({ userId }, 'Користувача визначено')

    // Крок 2: Базові перевірки вхідних даних.
    if (orderData.items.length === 0) {
      throw new ValidationError('Кошик не може бути порожнім.')
    }
    if (orderData.items.length > 50) {
      throw new ValidationError('Занадто багато товарів у замовленні (максимум 50).')
    }

    // Крок 3: Отримання актуальної інформації про товари з бази даних.
    const productIds = orderData.items.map((item) => item.productId)
    const productsFromDb = await getProductsByIds(productIds)

    // Крок 4: Перевірка, що всі запитані товари існують та активні.
    if (productsFromDb.length !== productIds.length) {
      const foundIds = productsFromDb.map((p) => p.id)
      const notFoundIds = productIds.filter((id) => !foundIds.includes(id))
      throw new NotFoundError(`Товари з ID: ${notFoundIds.join(', ')} не знайдені або неактивні.`)
    }

    // Крок 5: Розрахунок загальної вартості на сервері для безпеки.
    let total = new Decimal(0)
    const itemsWithPrices = orderData.items.map((item) => {
      const product = productsFromDb.find((p) => p.id === item.productId)
      if (!product) {
        throw new NotFoundError('Продукт', item.productId)
      }
      const itemTotal = new Decimal(product.price).times(item.quantity)
      total = total.plus(itemTotal)
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price.toNumber(),
      }
    })

    if (total.isNegative() || total.isZero()) {
      throw new ValidationError('Загальна сума замовлення має бути більше нуля.')
    }

    logger.info({ total: total.toString() }, 'Загальна вартість розрахована')

    // Крок 6: Виклик репозиторію для створення замовлення в БД.
    const newOrder = await createOrder(userId, orderData, itemsWithPrices, total)

    logger.info({
      orderId: newOrder.id,
      total: newOrder.total,
    }, 'Замовлення успішно створено')

    return newOrder
  },
}
