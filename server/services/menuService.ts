import { getAllProducts, getProductById } from '../models/menuModel'

// Сервис для получения всех продуктов
export async function fetchAllProducts() {
  // Можно добавить бизнес-логику, фильтры и т.д.
  return getAllProducts()
}

// Сервис для получения продукта по id
export async function fetchProductById(id: number) {
  // Можно добавить обработку ошибок, проверку и т.д.
  return getProductById(id)
}
