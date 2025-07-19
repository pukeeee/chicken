import { fetchAllProducts } from '../../services/menuService'

export default defineEventHandler(async (event) => {
  const products = await fetchAllProducts()
  return { success: true, data: products }
})