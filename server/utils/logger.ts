import pino from 'pino'
import os from 'os'

/**
 * Створює екземпляр логера pino з конфігурацією для різних середовищ.
 *
 * - У 'development' середовищі, логи виводяться у читабельному форматі (pino-pretty).
 * - У 'production' середовищі, логи виводяться у форматі JSON для зручності парсингу
 *   та інтеграції з системами збору логів (напр. Datadog, Logstash).
 */
const logger = pino({
  // Рівень логування. Можна змінювати через змінну середовища LOG_LEVEL.
  // 'info' - стандартний рівень, що включає info, warn, error, fatal.
  level: process.env.LOG_LEVEL || 'info',

  // Налаштування транспорту для виводу логів.
  transport: process.env.NODE_ENV === 'development'
    // У режимі розробки використовуємо 'pino-pretty' для красивого виводу в консоль.
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true, // Розфарбовує вивід
          ignore: 'pid,hostname', // Ігнорує зайві поля
          translateTime: 'SYS:standard' // Форматує час
        }
      }
    // У продакшені транспорт не потрібен, pino буде писати JSON в stdout.
    : undefined,

  // Форматери для логів у продакшен-середовищі.
  formatters: process.env.NODE_ENV === 'production'
    ? {
        // Замінює стандартний числовий рівень на текстовий (напр. 30 -> 'info').
        level: (label: string) => ({ level: label }),
        // Додає додаткові поля до кожного логу.
        log: (object) => ({
          ...object,
          environment: process.env.NODE_ENV,
          service: 'kurochka-api',
          version: process.env.npm_package_version || '1.0.0'
        })
      }
    : undefined,

  // Базові поля, що будуть додані до кожного запису в лог.
  base: {
    pid: process.pid, // Process ID
    hostname: process.env.HOSTNAME || os.hostname(), // Ім'я хоста
    service: 'kurochka-api' // Назва сервісу
  },

  // Використовуємо стандартну функцію для генерації ISO timestamp.
  timestamp: pino.stdTimeFunctions.isoTime
})

/**
 * Створює дочірній логер з додатковим контекстом.
 * Це корисно для додавання контекстної інформації до групи логів,
 * наприклад, ID запиту або ID користувача.
 *
 * @param context - Об'єкт з додатковими полями для логу.
 * @returns Екземпляр логера pino (базовий або дочірній).
 *
 * @example
 * const requestLogger = createLogger({ requestId: 'xyz-123' });
 * requestLogger.info('Processing request');
 */
export const createLogger = (context?: Record<string, any>) => {
  return context ? logger.child(context) : logger
}
