export default defineEventHandler(async (event) => {
  const user = event.context.user

  // Проверяем, что пользователь авторизован
  if (!user) {
    throw createError({ statusCode: 401, message: 'Не авторизован' })
  }

  // Проверяем роль
  if (user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, message: 'Нет прав' })
  }

  // Тестовые данные для дашборда
  return {
    // Статистика заказов
    orders: {
      total: 156,
      today: 12,
      pending: 8,
      preparing: 5,
      ready: 3,
      delivered: 140,
      cancelled: 3
    },
    
    // Статистика продаж
    sales: {
      total: 45680,
      today: 3240,
      thisWeek: 15680,
      thisMonth: 45680,
      averageOrder: 293,
      growth: 12.5 // процент роста
    },
    
    // Популярные блюда
    popularItems: [
      { name: 'Курица по-киевски', orders: 45, revenue: 13500, growth: 8.2 },
      { name: 'Куриные наггетсы', orders: 38, revenue: 11400, growth: 15.3 },
      { name: 'Куриный суп', orders: 32, revenue: 9600, growth: -2.1 },
      { name: 'Куриная грудка', orders: 28, revenue: 8400, growth: 5.7 },
      { name: 'Куриные крылышки', orders: 25, revenue: 7500, growth: 12.8 }
    ],
    
    // Последние заказы
    recentOrders: [
      {
        id: '1',
        customerName: 'Иван Петров',
        customerPhone: '+380991234567',
        total: 530,
        status: 'pending',
        createdAt: new Date().toISOString(),
        items: [
          { name: 'Курица по-киевски', quantity: 1, price: 450 },
          { name: 'Картошка фри', quantity: 1, price: 80 }
        ],
        deliveryAddress: 'ул. Крещатик, 1, кв. 5',
        paymentMethod: 'cash'
      },
      {
        id: '2',
        customerName: 'Мария Сидорова',
        customerPhone: '+380992345678',
        total: 365,
        status: 'preparing',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        items: [
          { name: 'Куриные наггетсы', quantity: 2, price: 160 },
          { name: 'Кока-кола', quantity: 1, price: 45 }
        ],
        deliveryAddress: 'ул. Шевченко, 15, кв. 12',
        paymentMethod: 'card'
      },
      {
        id: '3',
        customerName: 'Алексей Козлов',
        customerPhone: '+380993456789',
        total: 340,
        status: 'ready',
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        items: [
          { name: 'Куриный суп', quantity: 1, price: 280 },
          { name: 'Хлеб', quantity: 2, price: 30 }
        ],
        deliveryAddress: 'ул. Пушкина, 8, кв. 3',
        paymentMethod: 'online'
      }
    ],
    
    // Статистика по времени (последние 10 часов)
    hourlyStats: [
      { hour: 10, orders: 5, revenue: 1500, avgOrder: 300 },
      { hour: 11, orders: 8, revenue: 2400, avgOrder: 300 },
      { hour: 12, orders: 15, revenue: 4500, avgOrder: 300 },
      { hour: 13, orders: 12, revenue: 3600, avgOrder: 300 },
      { hour: 14, orders: 10, revenue: 3000, avgOrder: 300 },
      { hour: 15, orders: 7, revenue: 2100, avgOrder: 300 },
      { hour: 16, orders: 9, revenue: 2700, avgOrder: 300 },
      { hour: 17, orders: 11, revenue: 3300, avgOrder: 300 },
      { hour: 18, orders: 14, revenue: 4200, avgOrder: 300 },
      { hour: 19, orders: 6, revenue: 1800, avgOrder: 300 }
    ],
    
    // Статистика по дням недели
    weeklyStats: [
      { day: 'Понедельник', orders: 18, revenue: 5400 },
      { day: 'Вторник', orders: 22, revenue: 6600 },
      { day: 'Среда', orders: 25, revenue: 7500 },
      { day: 'Четверг', orders: 28, revenue: 8400 },
      { day: 'Пятница', orders: 35, revenue: 10500 },
      { day: 'Суббота', orders: 30, revenue: 9000 },
      { day: 'Воскресенье', orders: 20, revenue: 6000 }
    ],
    
    // Уведомления
    notifications: [
      {
        id: '1',
        type: 'order',
        message: 'Новый заказ #1234 от Ивана Петрова',
        time: new Date().toISOString(),
        read: false,
        priority: 'high'
      },
      {
        id: '2',
        type: 'stock',
        message: 'Заканчивается курица по-киевски (осталось 5 порций)',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        priority: 'medium'
      },
      {
        id: '3',
        type: 'system',
        message: 'Система обновлена до версии 2.1.0',
        time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        priority: 'low'
      },
      {
        id: '4',
        type: 'order',
        message: 'Заказ #1230 готов к доставке',
        time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: false,
        priority: 'medium'
      }
    ],
    
    // Статистика клиентов
    customers: {
      total: 89,
      newThisWeek: 12,
      returning: 67,
      averageRating: 4.7
    },
    
    // Статистика доставки
    delivery: {
      averageTime: 25, // минуты
      onTime: 94, // процент
      delayed: 6 // процент
    }
  }
}) 