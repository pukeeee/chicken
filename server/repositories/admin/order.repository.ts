import { Decimal } from '@prisma/client/runtime/library'
import prisma from '~~/server/database/client'
import type { OrderUpdateInput, OrderFiltersInput, OrderAdminDetails } from '~~/shared/validation/schemas'

export async function getAllOrders(filters?: OrderFiltersInput) {
    const {status, search, page = 1, limit = 5} = filters || {}

    // Строим фильтры для Prisma
    const where: Record<string, unknown> = {}

    // Если есть статус, добавляем условие
    if (status && status !== '') {
        where.status = status.toUpperCase()
    }

    // Если есть поиск, добавляем условия
    if (search && search !== '') {
        where.OR = [
            { id: { equals: parseInt(search) || 0 } },
            { customerName: { contains: search, mode: 'insensitive' } },
            { customerPhone: { contains: search } }
        ]
    }
    
    // Получаем заказы с учетом фильтров
    const orders = await prisma.order.findMany({
        where,
        include: {
          items: {
            select: {
              quantity: true,
              product: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
            createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
    })

    // Получаем общее количество
    const total = await prisma.order.count({ where })

    // Получаем общую статистику по всем статусам БЕЗ фильтров (только поиск если есть)
    const statsWhere: Record<string, unknown> = {}
    if (search && search !== '') {
        statsWhere.OR = [
            { id: { equals: parseInt(search) || 0 } },
            { customerName: { contains: search, mode: 'insensitive' } },
            { customerPhone: { contains: search } }
        ]
    }

    // Получаем статистику по статусам
    const statusStats = await prisma.order.groupBy({
        by: ['status'],
        where: statsWhere,
        _count: {
            status: true
        }
    })

    // Преобразуем статистику в удобный формат
    const orderStats = statusStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status
        return acc
    }, {} as Record<string, number>)

    return {
        orders, 
        total, 
        page, 
        limit, 
        totalPages: Math.ceil(total / limit),
        orderStats // Добавляем общую статистику
    }
}

export async function updateOrder(orderId: number, updateData: OrderUpdateInput) {
  // Создаем объект только с полями, которые можно обновлять
  const prismaUpdateData: Record<string, unknown>  = {};

  // Копируем простые поля, если они есть
  if (updateData.status !== undefined) prismaUpdateData.status = updateData.status;
  if (updateData.customerName !== undefined) prismaUpdateData.customerName = updateData.customerName;
  if (updateData.customerPhone !== undefined) prismaUpdateData.customerPhone = updateData.customerPhone;
  if (updateData.customerEmail !== undefined) prismaUpdateData.customerEmail = updateData.customerEmail;
  if (updateData.deliveryAddress !== undefined) prismaUpdateData.deliveryAddress = updateData.deliveryAddress;
  if (updateData.paymentMethod !== undefined) prismaUpdateData.paymentMethod = updateData.paymentMethod;

  // Якщо передано нові позиції, обробляємо їх
  if (updateData.items !== undefined) {
    // Використовуємо транзакцію для атомарного оновлення
    const updatedOrder = await prisma.$transaction(async (tx) => {
      
      // 1. Видаляємо всі старі позиції замовлення
      await tx.orderItem.deleteMany({
        where: { orderId: orderId }
      });

      // 2. Якщо нові позиції передані, створюємо їх
      if (updateData.items && updateData.items.length > 0) {
        // Отримуємо ціни для всіх нових продуктів
        const productIds = updateData.items.map(item => item.productId);
        const products = await tx.product.findMany({
          where: {
            id: {
              in: productIds
            }
          }
        });

        const productMap = new Map(products.map(p => [p.id, p]));

        // Підготовлюємо дані для створення нових позицій
        const newOrderItemsData = updateData.items.map(item => {
          const product = productMap.get(item.productId);
          if (!product) {
            throw new Error(`Продукт з ID ${item.productId} не знайдено`);
          }
          return {
            orderId: orderId,
            productId: item.productId,
            quantity: item.quantity,
            price: product.price // Фіксуємо ціну на момент створення позиції
          };
        });

        // Створюємо нові позиції
        await tx.orderItem.createMany({
          data: newOrderItemsData
        });

        // 3. Перераховуємо total замовлення
        const newTotal = newOrderItemsData.reduce((sum, item) => {
          return sum.plus(new Decimal(item.price).times(item.quantity));
        }, new Decimal(0));

        prismaUpdateData.total = newTotal;
      } else {
        // Якщо новий список позицій порожній, total = 0
        prismaUpdateData.total = new Decimal(0);
      }

      // 4. Оновлюємо основне замовлення
      return await tx.order.update({
        where: { id: orderId },
        data: prismaUpdateData,
        include: {
          items: {
            include: {
              product: true
            }
          },
          payment: true,
          user: true
        }
      });
    });

    // Повертаємо результат транзакції
    return updatedOrder as unknown as OrderAdminDetails; // TypeScript assertion
  } else {
    // Якщо позиції не оновлювалися, просто оновлюємо замовлення
    return await prisma.order.update({
      where: { id: orderId },
      data: prismaUpdateData,
      include: {
        items: {
          include: {
            product: true
          }
        },
        payment: true,
        user: true
      }
    }) as unknown as OrderAdminDetails; // TypeScript assertion
  }
}