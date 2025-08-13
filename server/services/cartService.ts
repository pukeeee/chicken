import type { CartItem } from '~/app/types/cart'

export class CartService {
  static addToCart(
    items: CartItem[], 
    product: { id: number; name: string; price: number }
  ): CartItem[] {
    const existing = items.find(item => item.id === product.id)
    
    if (existing) {
      existing.quantity += 1
      return items
    } else {
      return [...items, { ...product, quantity: 1 }]
    }
  }

  static removeFromCart(items: CartItem[], id: number): CartItem[] {
    return items.filter(item => item.id !== id)
  }

  static changeQuantity(items: CartItem[], id: number, delta: number): CartItem[] {
    return items.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    )
  }

  static getCartQuantity(items: CartItem[], id: number): number {
    const item = items.find(item => item.id === id)
    return item ? item.quantity : 0
  }

  static getTotalPrice(items: CartItem[]): number {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  static getTotalItems(items: CartItem[]): number {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  static saveToStorage(items: CartItem[]): void {
    if (process.client) {
      localStorage.setItem('cart', JSON.stringify(items))
    }
  }

  static loadFromStorage(): CartItem[] {
    if (process.client) {
      const data = localStorage.getItem('cart')
      return data ? JSON.parse(data) : []
    }
    return []
  }

  static clearStorage(): void {
    if (process.client) {
      localStorage.removeItem('cart')
    }
  }
}