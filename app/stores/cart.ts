import { defineStore } from 'pinia'
import { CartService } from '~~/server/services/cartService'
import type { CartItem, CartState } from '~~/shared/types/cart'

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: []
  }),

  getters: {
    totalPrice: (state): number => CartService.getTotalPrice(state.items),
    totalItems: (state): number => CartService.getTotalItems(state.items),
    isEmpty: (state): boolean => state.items.length === 0
  },

  actions: {
    addToCart(product: { id: number; name: string; price: number }) {
      this.items = CartService.addToCart(this.items, product)
      CartService.saveToStorage(this.items)
    },

    removeFromCart(id: number) {
      this.items = CartService.removeFromCart(this.items, id)
      CartService.saveToStorage(this.items)
    },

    changeQuantity(id: number, delta: number) {
      this.items = CartService.changeQuantity(this.items, id, delta)
      CartService.saveToStorage(this.items)
    },

    getCartQuantity(id: number): number {
      return CartService.getCartQuantity(this.items, id)
    },

    clearCart() {
      this.items = []
      CartService.clearStorage()
    },

    loadFromStorage() {
      this.items = CartService.loadFromStorage()
    },

    initialize() {
      this.loadFromStorage()
    }
  }
})