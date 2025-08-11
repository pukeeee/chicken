// Определяем типы для ответов API
interface HealthResponse {
  healthy: boolean
}

interface MigrationsResponse {
  upToDate: boolean
}

export default defineNuxtPlugin(async () => {
  if (import.meta.client && import.meta.dev) {
    try {
      console.log('🔍 Checking database status...')
      
      const healthResponse = await $fetch<HealthResponse>('/api/health/database')
      if (healthResponse.healthy) {
        console.log('✅ Database connection: OK')
      } else {
        console.warn('⚠️ Database connection: FAILED')
      }

      const migrationsResponse = await $fetch<MigrationsResponse>('/api/health/migrations')
      if (migrationsResponse.upToDate) {
        console.log('✅ Database migrations: UP TO DATE')
      } else {
        console.warn('⚠️ Database migrations: PENDING OR FAILED')
      }
      
    } catch (error) {
      console.error('❌ Database health check failed:', error)
    }
  }
})
