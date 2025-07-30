export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

export interface CartState {
  items: CartItem[]
}

export interface CartActions {
  addToCart: (product: { id: number; name: string; price: number }) => void
  removeFromCart: (id: number) => void
  changeQuantity: (id: number, delta: number) => void
  clearCart: () => void
  getCartQuantity: (id: number) => number
  getTotalPrice: () => number
  getTotalItems: () => number
} 