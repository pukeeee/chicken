import { defineStore } from 'pinia'
import { StorageService } from '../server/services/storageService'

const CART_STORAGE_KEY = 'cart'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as { id: number, name: string, price: number, quantity: number }[],
  }),
  actions: {
    addToCart(product: { id: number, name: string, price: number }) {
      const existing = this.items.find(item => item.id === product.id)
      if (existing) {
        existing.quantity += 1
      } else {
        this.items.push({ ...product, quantity: 1 })
      }
      this.saveToLocalStorage()
    },
    removeFromCart(id: number) {
      this.items = this.items.filter(item => item.id !== id)
      this.saveToLocalStorage()
    },
    changeQuantity(id: number, delta: number) {
      const item = this.items.find(item => item.id === id)
      if (item) {
        item.quantity = Math.max(1, item.quantity + delta)
        this.saveToLocalStorage()
      }
    },
    saveToLocalStorage() {
      StorageService.setItem(CART_STORAGE_KEY, this.items)
    },
    loadFromLocalStorage() {
      const data = StorageService.getItem<typeof this.items>(CART_STORAGE_KEY)
      if (data) {
        this.items = data
      }
    }
  }
})
