export default defineEventHandler(async (event) => {
  const user = event.context.auth

  // Проверяем, что пользователь авторизован
  if (!user) {
    throw createError({ statusCode: 401, message: 'Не авторизован' })
  }

  // Проверяем роль
  if (user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, message: 'Нет прав' })
  }

  // Получаем query параметры
  const query = getQuery(event)
  const status = query.status as string
  const search = query.search as string
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10

  // Тестовые данные заказов
  const allOrders = [
    {
      id: '1',
      customerName: 'Иван Петров',
      customerPhone: '+380991234567',
      items: [
        { name: 'Курица по-киевски', quantity: 1, price: 450 },
        { name: 'Картошка фри', quantity: 1, price: 80 }
      ],
      total: 530,
      status: 'pending',
      createdAt: new Date().toISOString(),
      deliveryAddress: 'ул. Крещатик, 1, кв. 5',
      paymentMethod: 'cash'
    },
    {
      id: '2',
      customerName: 'Мария Сидорова',
      customerPhone: '+380992345678',
      items: [
        { name: 'Куриные наггетсы', quantity: 2, price: 160 },
        { name: 'Кока-кола', quantity: 1, price: 45 }
      ],
      total: 365,
      status: 'preparing',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      deliveryAddress: 'ул. Шевченко, 15, кв. 12',
      paymentMethod: 'card'
    },
    {
      id: '3',
      customerName: 'Алексей Козлов',
      customerPhone: '+380993456789',
      items: [
        { name: 'Куриный суп', quantity: 1, price: 280 },
        { name: 'Хлеб', quantity: 2, price: 30 }
      ],
      total: 340,
      status: 'ready',
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      deliveryAddress: 'ул. Пушкина, 8, кв. 3',
      paymentMethod: 'online'
    },
    {
      id: '4',
      customerName: 'Ольга Иванова',
      customerPhone: '+380994567890',
      items: [
        { name: 'Куриная грудка', quantity: 1, price: 320 },
        { name: 'Салат Цезарь', quantity: 1, price: 180 },
        { name: 'Чай', quantity: 1, price: 25 }
      ],
      total: 525,
      status: 'delivered',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      deliveryAddress: 'ул. Ленина, 25, кв. 7',
      paymentMethod: 'cash'
    },
    {
      id: '5',
      customerName: 'Дмитрий Волков',
      customerPhone: '+380995678901',
      items: [
        { name: 'Куриные крылышки', quantity: 3, price: 150 },
        { name: 'Пиво', quantity: 2, price: 60 }
      ],
      total: 570,
      status: 'cancelled',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      deliveryAddress: 'ул. Гагарина, 12, кв. 9',
      paymentMethod: 'card'
    },
    {
      id: '6',
      customerName: 'Елена Смирнова',
      customerPhone: '+380996789012',
      items: [
        { name: 'Курица по-киевски', quantity: 2, price: 450 },
        { name: 'Картошка фри', quantity: 2, price: 80 },
        { name: 'Кока-кола', quantity: 2, price: 45 }
      ],
      total: 1150,
      status: 'pending',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      deliveryAddress: 'ул. Мира, 33, кв. 15',
      paymentMethod: 'online'
    },
    {
      id: '7',
      customerName: 'Сергей Николаев',
      customerPhone: '+380997890123',
      items: [
        { name: 'Куриный суп', quantity: 1, price: 280 },
        { name: 'Хлеб', quantity: 1, price: 30 }
      ],
      total: 310,
      status: 'preparing',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      deliveryAddress: 'ул. Советская, 7, кв. 4',
      paymentMethod: 'cash'
    },
    {
      id: '8',
      customerName: 'Анна Петрова',
      customerPhone: '+380998901234',
      items: [
        { name: 'Куриные наггетсы', quantity: 1, price: 160 },
        { name: 'Салат Цезарь', quantity: 1, price: 180 }
      ],
      total: 340,
      status: 'ready',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      deliveryAddress: 'ул. Победы, 18, кв. 11',
      paymentMethod: 'card'
    },
    {
      id: '9',
      customerName: 'Виктор Соколов',
      customerPhone: '+380999012345',
      items: [
        { name: 'Куриная грудка', quantity: 1, price: 320 },
        { name: 'Картошка фри', quantity: 1, price: 80 },
        { name: 'Пиво', quantity: 1, price: 60 }
      ],
      total: 460,
      status: 'delivered',
      createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
      deliveryAddress: 'ул. Дружбы, 22, кв. 8',
      paymentMethod: 'online'
    },
    {
      id: '10',
      customerName: 'Наталья Козлова',
      customerPhone: '+380990123456',
      items: [
        { name: 'Курица по-киевски', quantity: 1, price: 450 },
        { name: 'Салат Цезарь', quantity: 1, price: 180 },
        { name: 'Чай', quantity: 1, price: 25 }
      ],
      total: 655,
      status: 'pending',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      deliveryAddress: 'ул. Солнечная, 5, кв. 6',
      paymentMethod: 'cash'
    }
  ]

  // Фильтрация по статусу
  let filteredOrders = allOrders
  if (status && status !== '') {
    filteredOrders = filteredOrders.filter(order => order.status === status)
  }

  // Поиск по номеру заказа, имени клиента или телефону
  if (search && search !== '') {
    const searchLower = search.toLowerCase()
    filteredOrders = filteredOrders.filter(order => 
      order.id.toLowerCase().includes(searchLower) ||
      order.customerName.toLowerCase().includes(searchLower) ||
      order.customerPhone.includes(search)
    )
  }

  // Пагинация
  const total = filteredOrders.length
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const orders = filteredOrders.slice(startIndex, endIndex)

  return {
    orders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
})