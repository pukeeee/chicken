import { updateOrderService } from '~~/server/services/admin/orderService'
import { idSchema, orderSchemas, type OrderAdminUpdateResponse } from '~~/shared/validation/schemas'
import { createValidationError, validateBody } from '~~/server/utils/validation'

export default defineEventHandler(async (event) => {
  try {
    // Крок 1: Валідація ID з параметрів маршруту
    const paramsValidation = await getValidatedRouterParams(event, (params) => idSchema.safeParse(params))
    if (!paramsValidation.success) {
      const errors: Record<string, string[]> = {};
      paramsValidation.error.issues.forEach(err => {
          const path = err.path.join('.');
          if (!errors[path]) {
              errors[path] = [];
          }
          errors[path].push(err.message);
      });
      throw createValidationError({
          success: false,
          errors: errors,
          message: 'Невірний ID замовлення' 
      });
    }
    const orderId = paramsValidation.data!.id

    // Крок 2: Валідація тіла запиту
    const bodyValidation = await validateBody(event, orderSchemas.update)
    if (!bodyValidation.success) {
      throw createValidationError(bodyValidation)
    }

    // Крок 3: Оновлення замовлення через сервіс
    const updatedOrder = await updateOrderService(orderId, bodyValidation.data!)

    // Крок 4: Формування та валідація відповіді
    const response: OrderAdminUpdateResponse = {
      success: true,
      data: updatedOrder,
    }

    return orderSchemas.adminUpdateResponse.parse(response)
    
  } catch (error) {
    // Глобальний errorHandler перехопить помилку
    throw error
  }
})
