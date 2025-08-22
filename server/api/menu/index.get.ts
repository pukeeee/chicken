import { fetchAllCategoriesWithProducts } from '~~/server/services/menuService'
import { menuSchemas, type MenuResponse } from '~~/shared/validation/schemas'

export default defineEventHandler(async (event) => {
  try {
    // Крок 1: Отримання даних
    const categories = await fetchAllCategoriesWithProducts()

    // Крок 2: Формування та валідація відповіді
    const response: MenuResponse = {
      success: true,
      data: categories,
    }

    return menuSchemas.response.parse(response)
  } catch (error) {
    // Глобальний errorHandler перехопить помилку
    throw error
  }
})
