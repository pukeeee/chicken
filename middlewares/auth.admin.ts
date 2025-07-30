export default defineNuxtRouteMiddleware(async (to) => {
    // Проверяем только админские роуты
    if (!to.path.startsWith('/admin')) {
    return
    }

    // Пропускаем страницу логина
    if (to.path === '/admin/login') {
    return
    }

    try {
        // Пытаемся получить данные с сервера
        await $fetch('/api/admin/orders')
    } catch (error: any) {
        if (error.statusCode === 401) {
        return navigateTo('/admin/login')
        }
    }
}) 