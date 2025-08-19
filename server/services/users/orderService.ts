import { getProductsByIds } from '~~/server/repositories/menu.repository'
import { createOrder } from '~~/server/repositories/order.repository'
import { NotFoundError, ValidationError } from '~~/server/services/errorService'
import { handleDatabaseError } from '~~/server/utils/errorHandler'
import type { OrderCreateInput } from '~~/shared/validation/schemas'

/**
 * Сервіс для обробки бізнес-логіки, пов'язаної із замовленнями користувачів.
 */
export const orderService = {
  /**
   * Створює новий заказ.
   *
   * @param userId - ID користувача, що створює замовлення.
   * @param orderData - Валідовані дані замовлення від клієнта.
   * @returns Повні дані створеного замовлення.
   */
  async createNewOrder(userId: number, orderData: OrderCreateInput) {
    // 1. Отримуємо ID всіх товарів з кошика
    const productIds = orderData.items.map((item) => item.productId)
    if (productIds.length === 0) {
        throw new ValidationError('Кошик не може бути порожнім.')
    }

    // 2. Робимо запит до БД по цим товарам, щоб отримати актуальні ціни
    const productsFromDb = await getProductsByIds(productIds)

    // 3. Перевіряємо, що всі запитані товари існують та активні
    if (productsFromDb.length !== productIds.length) {
      const foundIds = productsFromDb.map((p) => p.id)
      const notFoundIds = productIds.filter((id) => !foundIds.includes(id))
      throw new NotFoundError(`Товари з ID: ${notFoundIds.join(', ')} не знайдені або неактивні.`)
    }

    // 4. Розраховуємо загальну вартість на сервері для безпеки
    let total = 0
    const itemsWithPrices = orderData.items.map((item) => {
      const product = productsFromDb.find((p) => p.id === item.productId)
      // Ця перевірка надлишкова через крок 3, але додає надійності
      if (!product) {
        throw new NotFoundError('Продукт', item.productId)
      }
      total += product.price * item.quantity
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price, // Фіксуємо ціну на момент покупки
      }
    })
    
    // Округлюємо до 2 знаків після коми, щоб уникнути проблем з float
    total = parseFloat(total.toFixed(2));

    // 5. Викликаємо репозиторій для створення замовлення в БД
    try {
      const newOrder = await createOrder(userId, orderData, itemsWithPrices, total)
      return newOrder
    } catch (error) {
      // Використовуємо наш кастомний обробник помилок БД
      handleDatabaseError(error, 'створенні замовлення')
      // Якщо handleDatabaseError не викинув помилку, викинемо її самі
      throw error
    }
  },
}
