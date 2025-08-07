import { getAllOrders, updateOrder } from "~/server/repositories/admin/order.repository";
import type { OrderUpdateData, OrderFilters } from "~/types/order";
import { OrderStatus } from "~/constants/orderConstants";

// Сервис для получения всех заказов
export async function fetchAllOrders(filters?: OrderFilters) {
    return await getAllOrders(filters)
}

const validators = {
    status: (value: string) => {
        const validStatuses = Object.values(OrderStatus);
        if (!validStatuses.includes(value.toUpperCase() as OrderStatus)) {
        throw new Error('Неверный статус заказа');
        }
    },
    
    customerEmail: (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
        throw new Error('Неверный формат email');
        }
    },
    
    customerPhone: (value: string) => {
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(value)) {
        throw new Error('Неверный формат телефона');
        }
    },
    
    totalAmount: (value: number) => {
        if (value < 0) {
        throw new Error('Сумма не может быть отрицательной');
        }
    }
};

export async function updateOrderService(orderId: number, updateData: OrderUpdateData) {
    // Проверяем, что передан хотя бы один параметр для обновления
    if (!updateData || Object.keys(updateData).length === 0) {
        throw new Error('Не переданы данные для обновления');
    }

    // Валидируем каждое поле
    for (const [field, value] of Object.entries(updateData)) {
        if (value !== undefined && value !== null) {
            const validator = validators[field as keyof typeof validators];
            if (validator) {
                if (field === 'status' || field === 'paymentMethod' || field === 'customerPhone') {
                    //@ts-ignore
                    validator(value as string);
                } else if (field === 'total' || field === 'userId') {
                    //@ts-ignore
                    validator(value as number);
                }
            }
        }
      }

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