export type Role = 'ADMIN' | 'USER' | 'STORE_OWNER'

export interface User {
  id: string
  name: string
  email: string
  address: string | null
  role: Role
  created_at: string
}

export interface Store {
  id: string
  name: string
  email: string
  address: string | null
  owner_id: string | null
  average_rating: number | null
  created_at: string
}

export interface StoreWithUserRating extends Store {
  user_rating: number | null
  user_rating_id: string | null
}

export interface Rating {
  id: string
  user_id: string
  store_id: string
  value: number
  created_at: string
}
