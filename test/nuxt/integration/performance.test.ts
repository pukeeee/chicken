/**
 * @file Інтеграційні тести продуктивності
 * @description Ці тести перевіряють продуктивність ключових операцій,
 * таких як масова генерація кодів та обробка JWT, при високих навантаженнях.
 * Важливо: для цих тестів потрібне активне підключення до тестової БД Redis.
 */
import { describe, it, expect } from 'vitest'
import { codeService } from '~~/server/services/users/codeService'
import { createToken, verifyToken } from '~~/server/utils/jwt'

describe('Тести продуктивності', () => {
  it('(Продуктивність) Має обробляти високе навантаження при генерації кодів', async () => {
    const phones = Array.from({ length: 1000 }, (_, i) => `+38050${String(i).padStart(7, '0')}`)
    
    const start = performance.now()
    
    const results = await Promise.allSettled(
      phones.map(phone => codeService.createAndStore(phone))
    )
    
    const end = performance.now()
    const duration = end - start
    
    // Усі коди мають бути успішно створені
    const successful = results.filter(r => r.status === 'fulfilled')
    expect(successful.length).toBe(1000)
    
    // Час виконання має бути прийнятним
    expect(duration).toBeLessThan(5000) // менше 5 секунд
    
    console.log(`[Performance] Згенеровано 1000 кодів за ${duration.toFixed(2)}ms`)
  })
  
  it('(Продуктивність) Має ефективно обробляти множинні JWT операції', async () => {
    const payloads = Array.from({ length: 10000 }, (_, i) => ({ id: i, role: 'USER' }))
    
    const start = performance.now()
    
    // Створення токенів
    const tokens = payloads.map(payload => createToken(payload, '1h'))
    
    // Верифікація токенів
    const decoded = tokens.map(token => verifyToken(token))
    
    const end = performance.now()
    const duration = end - start
    
    expect(tokens.length).toBe(10000)
    expect(decoded.length).toBe(10000)
    expect(duration).toBeLessThan(2000) // менше 2 секунд
    
    console.log(`[Performance] Оброблено 10000 JWT операцій за ${duration.toFixed(2)}ms`)
  })
})
