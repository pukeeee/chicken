export class StorageService {
  private static isClient(): boolean {
    return !! import.meta.client
  }

  static getItem<T>(key: string): T | null {
    if (!this.isClient()) return null
    
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  }

  static setItem(key: string, value: any): void {
    if (!this.isClient()) return
    
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error writing to localStorage:', error)
    }
  }

  static removeItem(key: string): void {
    if (!this.isClient()) return
    
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  }

  static clear(): void {
    if (!this.isClient()) return
    
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }
}