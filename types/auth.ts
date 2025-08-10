// Серверный интерфейс - полный пользователь (для БД и JWT)
export interface User {
  id: number
  phone: string
  name: string | null
  email: string | null
  password: string | null
  role: string
  isActive: boolean
  token: string | null
  createdAt: Date
}

// Клиентский интерфейс - то что видит пользователь
export interface PublicUser {
  id: number
  phone: string
  name: string | null
  email: string | null
  createdAt: string
}

export interface AuthState {
  user: PublicUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  phone: string
  code: string
}

export interface AuthResponse {
  user: PublicUser  // ← Клиенту возвращаем PublicUser
  token: string
}
