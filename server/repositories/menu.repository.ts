import prisma from '~~/server/database/client'

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

// Получить несколько продуктов по их ID
export async function getProductsByIds(ids: number[]) {
  return prisma.product.findMany({
    where: {
      id: {
        in: ids,
      },
      isActive: true, // Убедимся, что заказывают только активные продукты
    },
  });
}

// Получить все категории меню
export async function getAllCategoriesWithProducts() {
  return prisma.category.findMany({
    include: {
      products: true
    }
  })
}