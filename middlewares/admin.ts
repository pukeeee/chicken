import { StorageService } from '../server/services/storageService'

export default defineNuxtRouteMiddleware(async (to) => {
    // Skip auth check for verify endpoint and login page
    if (to.path.includes('/api/admin/verify') || to.path === '/admin/login') {
        return
    }

    const nuxtApp = useNuxtApp()

    // Check if we're on client side
    if (!nuxtApp.isHydrating) {
        const response = StorageService.getItem<{token: string}>('adminToken')
        const token = response?.token

        if (!token) {
            return navigateTo('/admin/login')
        }

        try {
            await $fetch('/api/admin/verify', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
        } catch (err) {
            StorageService.removeItem('adminToken')
            return navigateTo('/admin/login')
        }
    }
})