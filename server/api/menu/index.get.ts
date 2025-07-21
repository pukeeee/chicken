// import { fetchAllProducts } from '../../services/menuService'

// export default defineEventHandler(async (event) => {
//   const products = await fetchAllProducts()
//   return { success: true, data: products }
// })
import { fetchAllCategoriesWithProducts } from '../../services/menuService'

export default defineEventHandler(async (event) => {
  const categories = await fetchAllCategoriesWithProducts()
  return { success: true, data: categories }
})