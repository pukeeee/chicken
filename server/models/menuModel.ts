import prisma from '../database/client'

// Получить все продукты
export async function getAllProducts() {
  return prisma.product.findMany()
}

// Получить продукт по id
export async function getProductById(id: number) {
  return prisma.product.findUnique({
    where: { id }
  })
}
