import { orderService } from '~~/server/services/users/orderService'
import { orderSchemas } from '~~/shared/validation/schemas'
import { withValidation } from '~~/server/utils/validation'

export default defineEventHandler(async (event) => {
  // Крок 1: Валідація тіла запиту
  const orderData = await withValidation(orderSchemas.create)(event)

  // Крок 2: Виклик оновленого сервісу, який не потребує userId
  const newOrder = await orderService.createNewOrder(orderData)

  // Крок 3: Повернення відповіді
  // Ми не встановлюємо токен, користувач залишається неавторизованим
  return {
    id: newOrder.id,
    status: newOrder.status,
    total: newOrder.total,
    createdAt: newOrder.createdAt.toISOString(),
    items: newOrder.items.map(item => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      product: {
        id: item.product.id,
        name: item.product.name,
        image: item.product.image,
      },
    })),
  }
})
