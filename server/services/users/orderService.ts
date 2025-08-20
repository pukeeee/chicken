import { getProductsByIds } from '~~/server/repositories/menu.repository'
import { createOrder } from '~~/server/repositories/order.repository'
import { NotFoundError, ValidationError } from '~~/server/services/errorService'
import { handleDatabaseError } from '~~/server/utils/errorHandler'
import { createLogger } from '~~/server/utils/logger'
import type { OrderCreateInput } from '~~/shared/validation/schemas'
import type { FullOrder } from '~~/server/types/order.types'

/**
 * Сервіс для обробки бізнес-логіки, пов'язаної із замовленнями користувачів.
 */
export const orderService = {
  /**
   * Створює нове замовлення, виконуючи всю необхідну бізнес-логіку та валідацію.
   *
   * @param userId - ID користувача, що створює замовлення.
   * @param orderData - Валідовані дані замовлення від клієнта.
   * @returns Повні дані створеного замовлення.
   */
  async createNewOrder(userId: number, orderData: OrderCreateInput): Promise<FullOrder> {
    const logger = createLogger({ userId, operation: 'createOrder' })

    logger.info({
      orderData: {
        itemsCount: orderData.items.length,
        paymentMethod: orderData.paymentMethod,
      },
    }, 'Початок процесу створення замовлення')

    // Крок 1: Базові перевірки вхідних даних.
    if (orderData.items.length === 0) {
      throw new ValidationError('Кошик не може бути порожнім.')
    }
    // Захист від зловживань: обмежуємо максимальну кількість позицій у замовленні.
    if (orderData.items.length > 50) {
      throw new ValidationError('Занадто багато товарів у замовленні (максимум 50).')
    }
    // Перевірка на адекватність кількості кожного товару.
    const invalidQuantities = orderData.items.filter(item =>
      item.quantity <= 0 || item.quantity > 99
    )
    if (invalidQuantities.length > 0) {
      throw new ValidationError('Невірна кількість товарів. Дозволено від 1 до 99 штук.')
    }

    // Крок 2: Отримання актуальної інформації про товари з бази даних.
    const productIds = orderData.items.map((item) => item.productId)
    logger.debug({ productIds }, 'Отримання товарів з бази даних')
    const productsFromDb = await getProductsByIds(productIds)

    // Крок 3: Перевірка, що всі запитані товари існують та активні.
    if (productsFromDb.length !== productIds.length) {
      const foundIds = productsFromDb.map((p) => p.id)
      const notFoundIds = productIds.filter((id) => !foundIds.includes(id))

      logger.warn({ notFoundIds }, 'Деякі товари не знайдені або неактивні')
      throw new NotFoundError(`Товари з ID: ${notFoundIds.join(', ')} не знайдені або неактивні.`)
    }

    // Крок 4: Розрахунок загальної вартості на сервері для безпеки.
    // Ціни, що прийшли від клієнта, ігноруються.
    let total = 0
    const itemsWithPrices = orderData.items.map((item) => {
      const product = productsFromDb.find((p) => p.id === item.productId)
      // Ця перевірка є надлишковою через крок 3, але додає коду надійності.
      if (!product) {
        throw new NotFoundError('Продукт', item.productId)
      }

      const itemTotal = product.price * item.quantity
      total += itemTotal

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price, // Фіксуємо ціну на момент покупки.
      }
    })

    // Округлення до 2 знаків після коми, щоб уникнути проблем з числами з плаваючою комою.
    total = parseFloat(total.toFixed(2))

    // Валідація розрахованої загальної суми.
    if (total <= 0) {
      throw new ValidationError('Загальна сума замовлення має бути більше нуля.')
    }
    if (total > 99999.99) {
      throw new ValidationError('Загальна сума замовлення занадто велика.')
    }

    logger.info({ total, itemsCount: itemsWithPrices.length }, 'Загальна вартість розрахована')

    // Крок 5: Виклик репозиторію для створення замовлення в БД.
    // Усі помилки, включаючи помилки БД, будуть перехоплені глобальним обробником.
    const newOrder = await createOrder(userId, orderData, itemsWithPrices, total)

    logger.info({
      orderId: newOrder.id,
      total: newOrder.total,
      itemsCount: newOrder.items.length,
    }, 'Замовлення успішно створено')

    return newOrder
  },
}