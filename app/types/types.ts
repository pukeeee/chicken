export interface Product {
  id: number
  name: string
  price: number
  image: string | null
  // другие нужные поля
}

export interface Category {
  id: number
  name: string
  products: Product[]
}

export interface MenuItem {
  id: number
  name: string
  price: number
  image: string | null
  // если нужно, добавь description, categoryId и т.д.
}
