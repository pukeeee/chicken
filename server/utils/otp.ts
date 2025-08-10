import { createClient } from 'redis'

const client = createClient({
  url: process.env.REDIS_URI || 'redis://localhost:6379'
})

client.on('error', (err) => console.error('Redis error:', err))

await client.connect()

export const otpService = {
  // Сохранить код
  async set(key: string, code: string, ttl: number = 300) {
    await client.set(`otp:${key}`, code, { EX: ttl })
  },

  // Получить и удалить (одноразовый)
  async get(key: string) {
    const code = await client.get(`otp:${key}`)
    if (code) await client.del(`otp:${key}`) // одноразовый
    return code
  },

  // Проверить без удаления (для дебага)
  async verify(key: string, input: string) {
    const code = await client.get(`otp:${key}`)
    return code === input
  }
}