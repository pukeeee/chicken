import { fetchAllCategoriesWithProducts } from '~~/server/services/menuService'

export default defineEventHandler(async (event) => {
  const categories = await fetchAllCategoriesWithProducts()
  return { success: true, data: categories }
})