import { StorageService } from '../services/storageService'
import type { CartItem } from '~/app/types/cart'

const CART_STORAGE_KEY = 'cart'

export class CartRepository {
  static save(items: CartItem[]): void {
    StorageService.setItem(CART_STORAGE_KEY, items)
  }

  static load(): CartItem[] {
    return StorageService.getItem<CartItem[]>(CART_STORAGE_KEY) || []
  }

  static clear(): void {
    StorageService.removeItem(CART_STORAGE_KEY)
  }
}