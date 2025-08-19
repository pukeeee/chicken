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
