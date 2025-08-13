import { updateOrderService } from '~~/server/services/admin/orderService';
import type { OrderUpdateData } from '~~/shared/types/order';
import { cacheKeys } from '~~/server/utils/cacheKeys'
import { cache } from '~~/server/utils/cache'

export default defineEventHandler(async (event) => {
  try {
    // Получаем ID из параметров
    const orderIdString = getRouterParam(event, 'id');
  
  if (!orderIdString) {
    throw createError({ 
    statusCode: 400,
    statusMessage: 'ID заказа не предоставлен'
    });
  }

  const orderId = parseInt(orderIdString, 10);

  if (isNaN(orderId)) {
    throw createError({ 
    statusCode: 400,
    statusMessage: 'Неверный ID заказа'
    });
  }

  const updateData: OrderUpdateData = await readBody(event);

  // Обновляем заказ
  const updatedOrder = await updateOrderService(orderId, updateData);

  // Очищаем связанные кэши
  cache.delete(cacheKeys.orders.all());
  cache.delete(cacheKeys.orders.byId(String(orderId)));

  return {
    success: true,
    order: updatedOrder
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