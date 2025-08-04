import { getAllOrders, updateOrderStatus, OrderFilters } from "~/server/repositories/admin/order.repository";

// Сервис для получения всех заказов
export async function fetchAllOrders(filters?: OrderFilters) {
    return await getAllOrders(filters)
}

// Сервис для обновления статуса заказа
export async function updateOrderStatusService(orderId: number, status: string) {
    // Валидация статуса
    const validStatuses = ['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']
    if (!validStatuses.includes(status.toUpperCase())) {
        throw new Error('Неверный статус заказа')
      }
    
      return await updateOrderStatus(orderId, status)
}