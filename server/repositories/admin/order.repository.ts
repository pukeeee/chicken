import prisma from '~/server/database/client'

export interface OrderFilters {
    status?: string
    search?: string
    page?: number
    limit?: number
}

export async function getAllOrders(filters?: OrderFilters) {
    const {status, search, page = 1, limit = 5} = filters || {}

    // Строим фильтры для Prisma
    const where: any = {}

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
                include: {
                    product: true
                }
            },
            payment: true
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
    const statsWhere: any = {}
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

export async function updateOrderStatus(orderId: number, status: string) {
    return await prisma.order.update({
        where: {id: orderId},
        data: {status: status.toUpperCase()},
        include: {
            items: {
                include: {
                    product: true
                }
            },
            payment: true
        }
    })
}