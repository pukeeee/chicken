import prisma from '~~/server/database/client'
import type { OrderCreateInput } from '~~/shared/validation/schemas'
import type { OrderItemCreateData, FullOrder } from '../types/order.types'
import { NotFoundError, ValidationError } from '../services/errorService'

/**
 * Створює замовлення в базі даних в рамках однієї атомарної транзакції.
 * Це гарантує, що всі пов'язані записи (замовлення, позиції, платіж) будуть створені успішно, або ніякі зміни не будуть збережені.
 *
 * @param userId - ID користувача, що робить замовлення.
 * @param orderData - Дані замовлення від клієнта.
 * @param itemsWithPrices - Масив товарів з актуальними цінами, перевіреними на сервері.
 * @param total - Розрахована загальна вартість замовлення.
 * @returns Створений об'єкт замовлення з усіма вкладеними даними.
 */
export async function createOrder(
  userId: number,
  orderData: OrderCreateInput,
  itemsWithPrices: OrderItemCreateData[],
  total: number
): Promise<FullOrder> {
  return prisma.$transaction(async (tx) => {
    // Крок 1: Перевірка активності користувача безпосередньо перед створенням замовлення.
    // Це захищає від ситуації, коли користувача деактивували після його аутентифікації.
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, isActive: true },
    })

    if (!user || !user.isActive) {
      throw new NotFoundError('Користувач неактивний або не знайдений')
    }

    // Крок 2: Повторна перевірка доступності та активності товарів всередині транзакції.
    // Це захищає від "race condition", коли товар могли деактивувати або видалити після перевірки в сервісі.
    const productIds = itemsWithPrices.map(item => item.productId)
    const activeProducts = await tx.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      select: { id: true },
    })

    if (activeProducts.length !== productIds.length) {
      const activeIds = activeProducts.map(p => p.id)
      const inactiveIds = productIds.filter(id => !activeIds.includes(id))
      throw new ValidationError(`Товари з ID: ${inactiveIds.join(', ')} більше недоступні`)
    }

    // Крок 3: Створення основного запису про замовлення.
    const order = await tx.order.create({
      data: {
        userId,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        deliveryAddress: orderData.deliveryAddress,
        paymentMethod: orderData.paymentMethod,
        total,
        // Умовно додаємо email, якщо він був наданий.
        ...(orderData.customerEmail && { customerEmail: orderData.customerEmail }),
      },
    })

    // Крок 4: Створення пов'язаних позицій замовлення (OrderItem).
    const orderItemsData = itemsWithPrices.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price, // Використовуємо актуальну ціну з БД на момент покупки.
    }))

    await tx.orderItem.createMany({
      data: orderItemsData,
    })

    // Крок 5: Створення запису про платіж з початковим статусом.
    await tx.payment.create({
      data: {
        orderId: order.id,
        amount: total,
        method: orderData.paymentMethod,
        status: 'PENDING', // Початковий статус, який може змінюватися в майбутньому.
      },
    })

    // Крок 6: Повернення повного об'єкта замовлення з усіма необхідними зв'язками.
    // `findUniqueOrThrow` гарантує, що якщо замовлення не знайдено (що малоймовірно), виникне помилка.
    const fullOrder = (await tx.order.findUniqueOrThrow({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                image: true,
                category: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
        payment: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })) as FullOrder

    return fullOrder
  }, {
    // Налаштування транзакції для кращої продуктивності та надійності.
    maxWait: 5000, // Максимальний час очікування на розблокування з'єднання з БД (в мс).
    timeout: 10000, // Максимальний час виконання самої транзакції (в мс).
  })
}