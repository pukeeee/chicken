import { fetchAllOrders } from "~~/server/services/admin/orderService"
import { orderSchemas, type OrderAdminListResponse } from "~~/shared/validation/schemas"
import { createValidationError } from "~~/server/utils/validation"

export default defineEventHandler(async (event) => {
  // Крок 1: Валідація query параметрів
  const queryValidation = await getValidatedQuery(event, (query) => orderSchemas.filters.safeParse(query)); 

  if(!queryValidation.success){
    const errors: Record<string, string[]> = {};
    queryValidation.error.issues.forEach(err => {
      const path = err.path.join('.');
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(err.message);
    });
    throw createValidationError({
      success: false,
      errors: errors,
      message: 'Помилки валідації query параметрів'
    });
  }

  // Крок 2: Виклик сервісу для отримання даних
  const ordersData = await fetchAllOrders(queryValidation.data!);

  // Крок 3: Формування та валідація відповіді
  // Перетворюємо Decimal на number для відповіді, яку очікує клієнт
  const response: OrderAdminListResponse = {
    success: true,
    ...ordersData,
    orders: ordersData.orders.map(order => ({
      ...order,
      total: order.total.toNumber(), // Перетворюємо Decimal на number
    }))
  }
  
  return orderSchemas.adminListResponse.parse(response)
})
