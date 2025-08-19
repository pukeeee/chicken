import prisma from '~~/server/database/client'
import type { OrderCreateInput } from '~~/shared/validation/schemas'
import type { OrderItemCreateData } from '../types/order.types'

/**
 * Создает заказ в базе данных в рамках одной транзакции.
 *
 * @param userId - ID пользователя, который делает заказ.
 * @param orderData - Данные заказа от клиента.
 * @param itemsWithPrices - Массив товаров с ценами, полученными из БД.
 * @param total - Рассчитанная общая стоимость заказа.
 * @returns Созданный заказ с вложенными товарами.
 */
export async function createOrder(
  userId: number,
  orderData: OrderCreateInput,
  itemsWithPrices: OrderItemCreateData[],
  total: number
) {
  return prisma.$transaction(async (tx) => {
    // 1. Создаем основную запись о заказе
    const order = await tx.order.create({
      data: {
        userId,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        deliveryAddress: orderData.deliveryAddress,
        paymentMethod: orderData.paymentMethod,
        total,
        // Статус по умолчанию 'PENDING', он задан в schema.prisma
      },
    })

    // 2. Готовим и создаем связанные товары в заказе (OrderItem)
    const orderItemsData = itemsWithPrices.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price, // Используем актуальную цену из БД на момент покупки
    }))

    await tx.orderItem.createMany({
      data: orderItemsData,
    })

    // 3. Возвращаем полный заказ с информацией о товарах
    // Это важно, чтобы клиент сразу получил актуальные и полные данные о созданном заказе
    const fullOrder = await tx.order.findUniqueOrThrow({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: true, // Включаем полную информацию о продукте для каждой позиции
          },
        },
      },
    })

    return fullOrder
  })
}
