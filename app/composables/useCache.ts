import type { OrdersResponse } from '~~/shared/types/order'
import type { Category } from '~~/shared/types/types'

/**
 * Описывает стандартную структуру ответа от нашего API.
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Composable-функция для централизованного доступа к кэшируемым API-эндпоинтам.
 * Использует `useFetch` от Nuxt 3, который автоматически управляет состоянием,
 * кэшированием на клиенте и гидратацией данных с сервера.
 */
export const useApiCache = () => {
  return {
    /**
     * Загружает и кэширует меню (категории с продуктами).
     * - `server: true`: Данные загружаются на сервере при первой загрузке страницы.
     * - `transform`: Извлекает только полезные данные (`data`) из ответа API.
     * - Дженерик `<ApiResponse<Category[]>>` указывает `useFetch` на тип данных, приходящих с API.
     */
    menu: () => useFetch<ApiResponse<Category[]>>('/api/menu', {
      key: 'menu', // Уникальный ключ для кэша `useFetch`
      server: true,
      deep: true, // Добавлено для сохранения глубокой реактивности
      transform: (response: any) => response?.data || [],
    }),

    /**
     * Загружает и кэширует список заказов с фильтрами.
     * - `server: false`: Запросы выполняются только на клиенте (например, в админ-панели).
     * - `key`: Динамический ключ, который зависит от фильтров. При изменении фильтров будет выполнен новый запрос.
     * - `default`: Предоставляет начальное значение, чтобы избежать ошибок до загрузки данных.
     */
    orders: (filters: any) => useFetch<OrdersResponse>('/api/admin/orders', {
      key: `orders:${JSON.stringify(filters)}`,
      query: filters,
      server: false,
      deep: true, // Добавлено для сохранения глубокой реактивности
      default: () => ({ orders: [], total: 0, page: 1, limit: 10, orderStats: {} as any }),
    }),
  }
}