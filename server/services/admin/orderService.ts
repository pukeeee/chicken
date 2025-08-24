import { getAllOrders, updateOrder } from "~~/server/repositories/admin/order.repository";
import type { OrderUpdateInput, OrderFiltersInput } from "~~/shared/validation/schemas";
import { ValidationError } from "~~/server/services/errorService";

// Сервис для получения всех заказов
export async function fetchAllOrders(filters?: OrderFiltersInput) {
    return await getAllOrders(filters)
}

export async function updateOrderService(orderId: number, updateData: OrderUpdateInput) {
    // Проверяем, что передан хотя бы один параметр для обновления
    if (!updateData || Object.keys(updateData).length === 0) {
        throw new ValidationError('Не переданы данные для обновления');
    }

    // Делегируем выполнение в репозиторий.
    // Все ошибки Prisma будут обработаны глобально в errorHandler.
    return await updateOrder(orderId, updateData);
}