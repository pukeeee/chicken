import { fetchUsersOrders } from "~~/server/services/users/userService"

export default defineEventHandler(async (event) => {
  try {
    // Данные пользователя уже проверены и добавлены в контекст middleware'ом
    const user = event.context.user
    const isAuthenticated = event.context.isAuthenticated

    if (!user || !isAuthenticated) {
      return {
        success: false,
        user: null,
        message: 'Not authenticated'
      }
    }
  
    const orders = await fetchUsersOrders(user.id)

    return orders
  
  } catch (err: any) {
    console.error('Error fetching user orders:', err)
    
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'An error occurred while fetching orders.'
    })
  }
})