import { initDatabase } from '../database/init'

export default defineNitroPlugin(async (nitroApp) => {
  console.log('🗃️ Initializing database...')
  initDatabase()
  console.log('✅ Database initialized')
})