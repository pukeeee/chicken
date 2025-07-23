export class StorageService {
    static getItem<T>(key: string): T | null {
        if (process.client) {
            const item = localStorage.getItem(key)
            return item ? JSON.parse(item) : null
        }
        return null
    }

    static setItem(key: string, value: any): void {
        if (process.client) {
            localStorage.setItem(key, JSON.stringify(value))
        }
    }

    static removeItem(key: string): void {
        if (process.client) {
            localStorage.removeItem(key)
        }
    }
}