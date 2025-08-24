import type { Decimal } from '@prisma/client/runtime/library'
import prisma from '~~/server/database/client'
import { PaymentMethod } from '~~/shared/constants/orderConstants'
import type { OrderCreateInput, OrderItemCreateInput, OrderAdminDetails } from '~~/shared/validation/schemas'
import { NotFoundError } from '../services/errorService'

/**
 * Створює замовлення в базі даних в рамках однієї атомарної транзакції.
 * Це гарантує, що всі пов'язані записи (замовлення, позиції, платіж) будуть створені успішно, або ніякі зміни не будуть збережені.
 *
 * @param userId - ID користувача, що робить замовлення.
 * @param orderData - Дані замовлення від клієнта.
 * @param itemsWithPrices - Масив товарів з актуальними цінами, перевіреними на сервері.
 * @param total - Розрахована загальна вартість замовлення (тип Decimal).
 * @returns Створений об'єкт замовлення з усіма вкладеними даними.
 */
export async function createOrder(
  userId: number,
  orderData: OrderCreateInput,
  itemsWithPrices: OrderItemCreateInput[],
  total: Decimal
): Promise<OrderAdminDetails> {
  return prisma.$transaction(async (tx) => {
    // Крок 1: Перевірка активності користувача.
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, isActive: true },
    })
    if (!user || !user.isActive) {
      throw new NotFoundError('Користувач неактивний або не знайдений')
    }

    // Крок 2: Створення замовлення, позицій та зв'язків в одній операції.
    const order = await tx.order.create({
      data: {
        total,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerEmail: orderData.customerEmail,
        deliveryAddress: orderData.deliveryAddress,
        paymentMethod: orderData.paymentMethod as PaymentMethod,
        user: {
          connect: { id: userId },
        },
        items: {
          create: itemsWithPrices.map((item) => ({
            quantity: item.quantity,
            price: item.price,
            product: {
              connect: { id: item.productId },
            },
          })),
        },
      },
    })

    // Крок 3: Створення запису про платіж.
    await tx.payment.create({
      data: {
        orderId: order.id,
        amount: total,
        method: orderData.paymentMethod as PaymentMethod,
        status: 'PENDING',
      },
    })

    // Крок 4: Повернення повного об'єкта замовлення.
    const fullOrder = (await tx.order.findUniqueOrThrow({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
        user: true,
      },
    })) as unknown as OrderAdminDetails

    return fullOrder
  }, {
    maxWait: 5000,
    timeout: 10000,
  })
}