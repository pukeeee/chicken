/**
 * Базовий клас для всіх кастомних помилок додатку.
 * Дозволяє створювати помилки зі статус-кодом, що важливо для API.
 * Всі помилки, що наслідують AppError, вважаються "операційними" (відомими),
 * на відміну від неочікуваних системних помилок.
 */
export class AppError extends Error {
  /**
   * Додаткові дані, що можуть бути надіслані клієнту.
   * Nitro використовує цю властивість для формування тіла відповіді про помилку.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;

  constructor(
    /** HTTP статус-код помилки. */
    public statusCode: number,
    /** Повідомлення про помилку для клієнта. */
    message: string,
    /** Унікальний код помилки для програмної обробки. */
    public code?: string,
    /** Прапорець, що вказує, чи є помилка операційною. */
    public isOperational = true
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Помилка валідації даних (400 Bad Request).
 * Використовується, коли вхідні дані від клієнта не проходять перевірку.
 *
 * @example
 * // У сервісі або API-ендпоінті
 * if (!isValid(data)) {
 *   throw new ValidationError('Invalid input data', { fields: ['email'] });
 * }
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    /** Об'єкт з деталями помилки валідації. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public details?: any
  ) {
    super(400, message, 'VALIDATION_ERROR')
  }
}

/**
 * Помилка "Не знайдено" (404 Not Found).
 * Використовується, коли запитуваний ресурс не існує.
 *
 * @example
 * const user = await findUserById(123);
 * if (!user) {
 *   throw new NotFoundError('User', 123);
 * }
 */
export class NotFoundError extends AppError {
  constructor(
    /** Назва ресурсу, який не знайдено. */
    resource: string,
    /** Ідентифікатор ресурсу. */
    id?: string | number
  ) {
    super(404, `${resource}${id ? ` with id ${id}` : ''} not found`, 'NOT_FOUND')
  }
}

/**
 * Помилка авторизації (401 Unauthorized).
 * Використовується, коли користувач не автентифікований, але намагається
 * отримати доступ до захищеного ресурсу.
 *
 * @example
 * if (!userContext.isLoggedIn) {
 *   throw new UnauthorizedError('Authentication required');
 * }
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED')
  }
}
