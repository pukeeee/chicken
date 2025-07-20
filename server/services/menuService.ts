import { getAllProducts, getProductById } from '../models/menuModel'

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
