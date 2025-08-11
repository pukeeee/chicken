/**
 * Реализация простого кэша в памяти (in-memory cache).
 * Хранит данные в формате ключ-значение с возможностью установки времени жизни (TTL).
 */
class MemoryCache {
  private store: Map<string, { value: any; expire: number | null }> = new Map();

  /**
   * Получает значение из кэша по ключу.
   * Если ключ не найден или его время жизни истекло, возвращает null.
   * @param key - Ключ для поиска.
   * @returns - Значение из кэша или null.
   */
  get(key: string): any | null {
    const entry = this.store.get(key);
    if (!entry) {
      return null;
    }

    if (entry.expire !== null && entry.expire < Date.now()) {
      this.store.delete(key); // Удаляем просроченную запись
      return null;
    }

    return entry.value;
  }

  /**
   * Сохраняет значение в кэш.
   * @param key - Ключ для сохранения.
   * @param value - Сохраняемое значение.
   * @param ttl - Время жизни в секундах (опционально).
   */
  set(key: string, value: any, ttl: number | null = null): void {
    const expire = ttl !== null ? Date.now() + ttl * 1000 : null;
    this.store.set(key, { value, expire });
  }

  /**
   * Удаляет значение из кэша по ключу.
   * @param key - Ключ для удаления.
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Полностью очищает кэш.
   */
  clear(): void {
    this.store.clear();
  }
}

// Создаем единственный экземпляр кэша (Singleton), чтобы он был общим для всего сервера.
export const cache = new MemoryCache();

/**
 * Опции для функции `withCache`.
 */
interface CacheOptions {
  key: string;         // Уникальный ключ кэширования.
  ttl?: number | null; // Время жизни в секундах.
}

/**
 * Функция-обертка (декоратор) для кэширования результатов выполнения асинхронных функций.
 * Сначала проверяет наличие данных в кэше. Если их нет, выполняет функцию,
 * сохраняет результат в кэш и возвращает его.
 * @param options - Опции кэширования (ключ и TTL).
 * @param fetchFn - Асинхронная функция, результат которой нужно закэшировать.
 * @returns - Результат из кэша или результат выполнения функции.
 */
export async function withCache<T>(options: CacheOptions, fetchFn: () => Promise<T>): Promise<T> {
  const cachedData = cache.get(options.key);
  if (cachedData !== null) {
    return cachedData;
  }

  const data = await fetchFn();
  cache.set(options.key, data, options.ttl);
  return data;
}