import { defineStore } from 'pinia'

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
      localStorage.setItem('cart', JSON.stringify(this.items))
    },
    loadFromLocalStorage() {
      const data = localStorage.getItem('cart')
      if (data) {
        this.items = JSON.parse(data)
      }
    }
  }
})
