import { fetchUsersOrders } from "~~/server/services/users/userService"
import { userSchemas, type UserOrdersResponse } from "~~/shared/validation/schemas"
import { UnauthorizedError } from "~~/server/services/errorService"

export default defineEventHandler(async (event) => {
  try {
    // Крок 1: Перевірка автентифікації
    const user = event.context.user
    if (!user?.id) {
      throw new UnauthorizedError('Користувач не автентифікований')
    }
  
    // Крок 2: Отримання замовлень
    const orders = await fetchUsersOrders(user.id)

    // Крок 3: Валідація відповіді
    // Тип відповіді UserOrdersResponse - це масив, тому ми валідуємо його напряму.
    return userSchemas.ordersResponse.parse(orders)
  
  } catch (error) {
    // Глобальний errorHandler перехопить помилку
    throw error
  }
})
