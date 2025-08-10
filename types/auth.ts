export interface User {
  id: number
  phone: string
  name?: string
  email?: string
  role?: string
  isActive?: boolean
  createdAt: string
  updatedAt?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  phone: string
  code: string
}

export interface AuthResponse {
  user: User
  token: string
}
