export default defineEventHandler(async (event) => {
  const user = event.context.auth

  // Проверяем, что пользователь авторизован
  if (!user) {
    throw createError({ statusCode: 401, message: 'Не авторизован' })
  }

  // Проверяем роль
  if (user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, message: 'Нет прав' })
  }

  return "shiiiiiiiiiiiit pizda"
})