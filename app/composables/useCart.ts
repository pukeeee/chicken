import { useCartStore } from '~/app/stores/cart'

export const useCart = () => {
  const cartStore = useCartStore()

  // Инициализация при первом использовании
  if (cartStore.items.length === 0) {
    cartStore.initialize()
  }

  const addToCart = (product: { id: number; name: string; price: number }) => {
    cartStore.addToCart(product)
  }

  const removeFromCart = (id: number) => {
    cartStore.removeFromCart(id)
  }

  const changeQuantity = (id: number, delta: number) => {
    cartStore.changeQuantity(id, delta)
  }

  const getCartQuantity = (id: number): number => {
    return cartStore.getCartQuantity(id)
  }

  const clearCart = () => {
    cartStore.clearCart()
  }

  return {
    // State
    items: computed(() => cartStore.items),
    totalPrice: computed(() => cartStore.totalPrice),
    totalItems: computed(() => cartStore.totalItems),
    isEmpty: computed(() => cartStore.isEmpty),

    // Actions
    addToCart,
    removeFromCart,
    changeQuantity,
    getCartQuantity,
    clearCart
  }
}