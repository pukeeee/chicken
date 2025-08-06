import { updateOrderService } from '~/server/services/admin/orderService';
import type { OrderUpdateData } from '~/types/order';

export default defineEventHandler(async (event) => {
    try {
        // Получаем ID из параметров
        const orderId = parseInt(getRouterParam(event, 'id') || '0');
    
    if (!orderId || isNaN(orderId)) {
        throw createError({
        statusCode: 400,
        statusMessage: 'Неверный ID заказа'
        });
    }

    const updateData: OrderUpdateData = await readBody(event);

    // Обновляем заказ
    const updatedOrder = await updateOrderService(orderId, updateData);

    return {
        success: true,
        data: updatedOrder
    };
    
    } 
    catch (error: any) {
        console.error('Ошибка при обновлении заказа:', error);
        
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || error.message || 'Произошла ошибка при обновлении заказа'
        });
    }
});