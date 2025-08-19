import { ValidationError, NotFoundError, AppError } from '../services/errorService'

/**
 * Обробляє специфічні помилки бази даних (Prisma) та перетворює їх
 * у зрозумілі помилки додатку (AppError).
 * Це дозволяє абстрагуватися від деталей реалізації бази даних
 * і надавати клієнту стандартизовані відповіді про помилки.
 *
 * @param error - Об`єкт помилки, отриманий від Prisma Client.
 * @param context - Додатковий текстовий контекст про операцію, що виконувалася.
 * @throws {AppError} - Викидає відповідну кастомну помилку.
 *
 * @example
 * try {
 *   await prisma.user.create({ data: { email: 'test@test.com' } });
 * } catch (e) {
 *   handleDatabaseError(e);
 * }
 */
export const handleDatabaseError = (error: any, context?: string) => {
  // Перевіряємо код помилки Prisma.
  // Повний список кодів: https://www.prisma.io/docs/reference/api-reference/error-reference
  switch (error.code) {
    // P2002: Порушення унікального обмеження (unique constraint failed).
    case 'P2002': {
      const field = error.meta?.target?.[0] || 'field'
      throw new ValidationError(`Поле '${field}' повинно бути унікальним.`) 
    }
    // P2025: Запис не знайдено.
    case 'P2025': {
      throw new NotFoundError(context || 'Запис')
    }
    // P2003: Порушення обмеження зовнішнього ключа (foreign key constraint failed).
    case 'P2003': {
      throw new ValidationError('Помилка зв\'язку між даними.')
    }
    // Якщо це невідома помилка Prisma або інша помилка БД.
    default: {
      // Викидаємо загальну серверну помилку, щоб не розкривати деталі БД.
      throw new AppError(500, 'Помилка операції з базою даних', 'DATABASE_ERROR')
    }
  }
}