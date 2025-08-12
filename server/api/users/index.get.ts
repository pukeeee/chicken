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

    return {
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    }

  } catch (err) {
    console.error('Error in user check:', err)
    
    return {
      success: false,
      user: null,
      message: 'Authentication check failed'
    }
  }
})