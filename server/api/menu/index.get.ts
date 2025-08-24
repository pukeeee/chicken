import { fetchAllCategoriesWithProducts } from '~~/server/services/menuService'
import { menuSchemas, type MenuResponse } from '~~/shared/validation/schemas'

export default defineEventHandler(async () => {
  // Крок 1: Отримання даних
  const categories = await fetchAllCategoriesWithProducts()

  // Крок 2: Формування та валідація відповіді
  // Перетворюємо Decimal на number для відповіді, яку очікує клієнт
  const response: MenuResponse = {
    success: true,
    data: categories.map(category => ({
      ...category,
      products: category.products.map(product => ({
        ...product,
        price: product.price.toNumber() // Перетворюємо Decimal на number
      }))
    })),
  }

  return menuSchemas.response.parse(response)
})
