import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Сначала создаём категории и получаем их id
  const category1 = await prisma.category.create({ data: { name: 'Основні страви' } })
  const category2 = await prisma.category.create({ data: { name: 'Меню' } })
  const category3 = await prisma.category.create({ data: { name: 'Напої' } })

  // Теперь создаём продукты, используя реальные id категорий
  await prisma.product.createMany({
    data: [
      { name: 'Курочка №1', description: 'Соковита курочка гриль с помідорой та цукіні', price: 120.0, image: '/menu1.png', categoryId: category1.id },
      { name: 'Курочка №2', description: 'Соковитий пітух гриль', price: 100.0, image: '/menu2.png', categoryId: category1.id },
      { name: 'Курочка №3', description: 'Соковита гола курочка гриль', price: 50.0, image: '/menu3.png', categoryId: category1.id },
      { name: 'Меню 1', description: 'Соковитий кусочок курочки гриль, салатік та соус', price: 222.0, image: '/menu4.png', categoryId: category2.id },
      { name: 'Меню 2', description: 'Соковиті курячі ножки та шось ще і салатес', price: 111.0, image: '/menu5.png', categoryId: category2.id },
      { name: 'Пиво', description: 'Рідке золото 0.5 л', price: 5.0, image: '/menu6.png', categoryId: category3.id },
      { name: 'Водочка', description: 'Смаколик 100 мл', price: 10.0, image: '/menu7.png', categoryId: category3.id },
      { name: 'Кока колька', description: 'Coca Cola Light, Coca Cola Normal, Coca Cola Zerooooo 10 л', price: 30.0, image: '/menu8.png', categoryId: category3.id }
    ],
  })

  // Создание тестового админа
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin',
      role: 'ADMIN',
      token: 'dev-token-123',
    },
  })
}

main()
  .then(() => {
    console.log('✅ Seed complete')
    return prisma.$disconnect()
  })
  .catch((e) => {
    console.error(e)
    return prisma.$disconnect()
  })
