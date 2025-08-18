import { useAuth } from "~/composables/auth/useAuth"
import { useCartStore } from "~/stores/cart"

/**
 * Плагин инициализации авторизации
 * Выполняется только на клиенте после гидратации
 */
export default defineNuxtPlugin(async () => {
  // Инициализируем авторизацию
  const { initialize: initAuth } = useAuth()
  await initAuth()

  // Инициализируем корзину
  const cartStore = useCartStore()
  cartStore.initialize()
})