import { getAllProducts, getProductById, getAllCategoriesWithProducts } from '../repositories/menu.repository'
import { withCache } from '../utils/cache'

// Сервис для получения всех продуктов
export async function fetchAllProducts() {
  const products = await getAllProducts()

  return products.map(({ id, name, price, image, categoryId}) => ({id, name, price, image, categoryId}))
}

// Сервис для получения продукта по id
export async function fetchProductById(id: number) {
  // Можно добавить обработку ошибок, проверку и т.д.
  return getProductById(id)
}

/**
 * Получает все категории вместе с вложенными продуктами.
 * Результат этой функции кэшируется на стороне сервера для повышения производительности.
 * @returns - Массив категорий с продуктами.
 */
export async function fetchAllCategoriesWithProducts() {
  // Используем обертку `withCache` для выполнения и кэширования запроса.
  return withCache(
    { 
      key: 'menu:categories', // Получаем ключ из централизованного хелпера `cacheKeys`.
      ttl: 300  // 5 минут
    },
    // Эта асинхронная функция будет вызвана только в том случае,
    // если данные по указанному ключу отсутствуют в кэше.
    async () => {
      const categories = await getAllCategoriesWithProducts()
      // Оставляем только необходимые поля для фронтенда, чтобы уменьшить объем данных.
      return categories.map(category => ({
        ...category,
        products: category.products.map(({ id, name, price, image }) => ({
          id, name, price, image
        }))
      }))
    }
  )
}