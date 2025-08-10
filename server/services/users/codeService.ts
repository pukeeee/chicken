import { otpService } from "~/server/utils/otp"

export const codeService = {

  /**
  * Генерирует код из цифр и букв (без I, O, 0)
  * @param length - длина кода (по умолчанию 4)
  * @returns сгенерированный код
  */
  generateCode(length: number = 6): string {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZ'
    let code = ''
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length)
        code += chars[randomIndex]
    }
    return code
  },

  /**
   * Создает и сохраняет код для телефона
   * @param phone - номер телефона
   * @param ttl - время жизни в секундах (по умолчанию 5 минут)
   * @returns сгенерированный код
   */
  async createAndStore(phone: string, ttl: number = 300): Promise<string> {
    const code = this.generateCode()
    await otpService.set(phone, code, ttl)
    return code
  },

  /**
   * Проверяет код для телефона
   * @param phone - номер телефона
   * @param inputCode - введенный код
   * @returns true если код верный
   */
  async verify(phone: string, inputCode: string): Promise<boolean> {
    const storedCode = await otpService.get(phone)
    return storedCode === inputCode
  }
}