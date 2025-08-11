export default defineNuxtRouteMiddleware(async (to) => {
    // Проверяем только админские роуты
    if (!to.path.startsWith('/admin')) {
    return
    }

    // Пропускаем страницу логина
    if (to.path === '/admin/login') {
    return
    }

    // Быстрая проверка наличия токена
    const adminToken = useCookie('admin_token')
    if (!adminToken.value) {
        return navigateTo('/admin/login')
    }
    // Серверный middleware `auth.api.admin.ts` выполнит полную проверку
    // при запросах к API с этой страницы.
    

    // try {
    //     // Пытаемся получить данные с сервера
    //     await $fetch('/api/admin/orders')
    // } catch (error: any) {
    //     if (error.statusCode === 401) {
    //     return navigateTo('/admin/login')
    //     }
    // }
}) 