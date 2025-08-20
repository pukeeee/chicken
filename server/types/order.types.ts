/**
 * Тип для внутрішньої передачі даних між сервісом та репозиторієм
 * при створенні позицій замовлення (OrderItem).
 * Містить ціну, перевірену на сервері.
 */
export type OrderItemCreateData = {
  productId: number
  quantity: number
  price: number // Ціна на момент покупки, валідована на сервері
}

/**
 * Розширений тип для повного замовлення з включеними зв'язками,
 * який повертається з репозиторію.
 */
export type FullOrder = {
  id: number
  userId: number
  customerName: string
  customerPhone: string
  customerEmail?: string | null
  deliveryAddress: string
  paymentMethod: string
  status: string
  total: number
  createdAt: Date
  items: {
    id: number
    quantity: number
    price: number
    product: {
      id: number
      name: string
      description: string | null
      image: string | null
      category: {
        id: number
        name: string
      } | null
    }
  }[]
  payment: {
    id: number
    amount: number
    method: string
    status: string
    createdAt: Date
  } | null
  user: {
    id: number
    name: string | null
    email: string | null
    phone: string
  }
}

/**
 * Тип для відповіді API при успішному створенні замовлення.
 * Містить тільки ті дані, що потрібні клієнту.
 */
export type OrderCreationResponse = {
  id: number
  status: string
  total: number
  createdAt: Date
  items: {
    id: number
    quantity: number
    price: number
    product: {
      id: number
      name: string
      image: string | null
    }
  }[]
}