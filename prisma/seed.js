import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Создание тестовых категорий
  const category1 = await prisma.category.create({ data: { name: 'Основні страви' } })
  const category2 = await prisma.category.create({ data: { name: 'Меню' } })
  const category3 = await prisma.category.create({ data: { name: 'Напої' } })

  // Создание тестового меню
  await prisma.product.createMany({
    data: [
      { name: 'Курочка №1', description: 'Соковита курочка гриль с помідорой та цукіні', price: 120.0, image: 'menu1.png', categoryId: category1.id },
      { name: 'Курочка №2', description: 'Соковитий півень гриль', price: 100.0, image: 'menu2.png', categoryId: category1.id },
      { name: 'Курочка №3', description: 'Соковита гола курочка гриль', price: 50.0, image: 'menu3.png', categoryId: category1.id },
      { name: 'Меню 1', description: 'Соковитий кусочок курочки гриль, салатік та соус', price: 222.0, image: 'menu4.png', categoryId: category2.id },
      { name: 'Меню 2', description: 'Соковиті курячі ножки та шось ще і салатес', price: 111.0, image: 'menu5.png', categoryId: category2.id },
      { name: 'Пиво', description: 'Рідке золото 0.5 л', price: 5.0, image: 'menu6.png', categoryId: category3.id },
      { name: 'Водочка', description: 'Смаколик 100 мл', price: 10.0, image: 'menu7.png', categoryId: category3.id },
      { name: 'Кока колька', description: 'Coca Cola Light, Coca Cola Normal, Coca Cola Zerooooo 10 л', price: 30.0, image: 'menu8.png', categoryId: category3.id }
    ],
  })

  // Создание тестовых юзеров
  const user1 = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      phone: '0672597966',
      name: 'Admin',
      role: 'ADMIN',
      token: 'dev-token-123',
      password: '$2b$10$oxwSBvR4ioJsByUxfbUggO8mWGv.qLFXLv4ku/E0T1h24Km/f8puG' // password
    }
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'user1@mail.com',
      phone: '0672597965',
      name: 'Даня',
    }
  })

  const user3 = await prisma.user.create({
    data: {
      email: 'user2@mail.com',
      phone: '0672597964',
      name: 'Максим',
    }
  })

  const user4 = await prisma.user.create({
    data: {
      email: 'user3@mail.com',
      phone: '0672597963',
      name: 'Вова',
    }
  })

  // Создание тестовых заказов
  const order1 = await prisma.order.create({
    data: {
      userId: user2.id,
      customerName: 'Даня',
      customerPhone: '0672597965',
      deliveryAddress: 'ул. Крещатик, 1, кв. 5',
      paymentMethod: 'CASH',
      status: 'PENDING',
      total: 365.0
    }
  })

  const order2 = await prisma.order.create({
    data: {
      userId: user2.id,
      customerName: 'Даня',
      customerPhone: '0672597965',
      deliveryAddress: 'ул. Шевченко, 15, кв. 12',
      paymentMethod: 'CARD',
      status: 'PREPARING',
      total: 222.0
    }
  })

  const order3 = await prisma.order.create({
    data: {
      userId: user3.id,
      customerName: 'Максим',
      customerPhone: '0672597964',
      deliveryAddress: 'ул. Пушкина, 8, кв. 3',
      paymentMethod: 'ONLINE',
      status: 'READY',
      total: 180.0
    }
  })

  const order4 = await prisma.order.create({
    data: {
      userId: user4.id,
      customerName: 'Вова',
      customerPhone: '0672597963',
      deliveryAddress: 'ул. Ленина, 25, кв. 7',
      paymentMethod: 'CASH',
      status: 'DELIVERED',
      total: 525.0
    }
  })

  const order5 = await prisma.order.create({
    data: {
      userId: user4.id,
      customerName: 'Вова',
      customerPhone: '0672597963',
      deliveryAddress: 'ул. Гагарина, 12, кв. 9',
      paymentMethod: 'CARD',
      status: 'CANCELLED',
      total: 570.0
    }
  })

  const order6 = await prisma.order.create({
    data: {
      userId: user4.id,
      customerName: 'Вова',
      customerPhone: '0672597963',
      deliveryAddress: 'ул. Мира, 33, кв. 15',
      paymentMethod: 'ONLINE',
      status: 'PENDING',
      total: 1150.0
    }
  })

  // Создание тестовых позиций заказа
  await prisma.orderItem.createMany({
    data: [
      {orderId: order1.id, productId: 1, quantity: 2, price: 120.0},
      {orderId: order1.id, productId: 6, quantity: 1, price: 5.0},
      {orderId: order1.id, productId: 7, quantity: 3, price: 10.0},
      {orderId: order2.id, productId: 4, quantity: 1, price: 222.0},
      {orderId: order3.id, productId: 2, quantity: 1, price: 100.0},
      {orderId: order3.id, productId: 3, quantity: 1, price: 50.0},
      {orderId: order3.id, productId: 8, quantity: 1, price: 30.0},
      {orderId: order4.id, productId: 3, quantity: 2, price: 50.0},
      {orderId: order4.id, productId: 5, quantity: 3, price: 111.0},
      {orderId: order4.id, productId: 6, quantity: 10, price: 5.0},
      {orderId: order5.id, productId: 7, quantity: 6, price: 10.0},
      {orderId: order5.id, productId: 5, quantity: 2, price: 111.0},
      {orderId: order6.id, productId: 1, quantity: 2, price: 120.0},
      {orderId: order6.id, productId: 2, quantity: 2, price: 100.0},
      {orderId: order6.id, productId: 8, quantity: 2, price: 30.0},
    ]
  })

  // Создание платежей
  await prisma.payment.createMany({
    data: [
      {orderId: order1.id, amount: 365.0, method: 'CASH', status: 'COMPLETED'},
      {orderId: order2.id, amount: 222.0, method: 'CARD', status: 'COMPLETED'},
      {orderId: order3.id, amount: 180.0, method: 'ONLINE', status: 'COMPLETED'},
      {orderId: order4.id, amount: 525.0, method: 'CASH', status: 'COMPLETED'},
      {orderId: order5.id, amount: 570.0, method: 'CARD', status: 'FAILED'},
      {orderId: order6.id, amount: 1150.0, method: 'ONLINE', status: 'PENDING'},
    ]
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
