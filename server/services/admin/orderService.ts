import { getAllOrders, updateOrder } from "~~/server/repositories/admin/order.repository";
import type { OrderUpdateInput, OrderFiltersInput } from "~~/shared/validation/schemas";

// Сервис для получения всех заказов
export async function fetchAllOrders(filters?: OrderFiltersInput) {
    return await getAllOrders(filters)
}

export async function updateOrderService(orderId: number, updateData: OrderUpdateInput) {
    // Проверяем, что передан хотя бы один параметр для обновления
    if (!updateData || Object.keys(updateData).length === 0) {
        throw new Error('Не переданы данные для обновления');
    }

    // Валидация перенесена на уровень API с помощью Zod, этот блок больше не нужен.

    try {
        return await updateOrder(orderId, updateData);
    } 
    catch (err: any) {
        if (err.code === 'P2025') {
            throw new Error('Заказ не найден');
        }
        throw err;
    }
}