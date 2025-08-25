import { createClient } from 'redis'

const client = createClient({
  url: process.env.REDIS_URI || 'redis://localhost:6379'
})

client.on('error', (err) => console.error('Redis error:', err))

// Initialize Redis connection
let isConnected = false
const initRedis = async () => {
  if (!isConnected) {
    await client.connect()
    isConnected = true
  }
}

export const otpService = {
  // Сохранить код
  async set(key: string, code: string, ttl: number = 300) {
    await initRedis()
    await client.set(`otp:${key}`, code, { EX: ttl })
  },

  // Получить и удалить (одноразовый)
  async get(key: string) {
    await initRedis()
    const code = await client.get(`otp:${key}`)
    if (code) await client.del(`otp:${key}`) // одноразовый
    return code
  },

  // Проверить без удаления (для дебага)
  async verify(key: string, input: string) {
    await initRedis()
    const code = await client.get(`otp:${key}`)
    return code === input
  },

  // Установить блокировку
  async setLock(key: string, ttl: number) {
    await initRedis()
    await client.set(`otp_lock:${key}`, 'locked', { EX: ttl })
  },

  // Проверить наличие блокировки
  async isLocked(key: string): Promise<boolean> {
    await initRedis()
    const result = await client.exists(`otp_lock:${key}`)
    return result === 1
  }
}