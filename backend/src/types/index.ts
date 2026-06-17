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
  created_at: string
}

export interface Rating {
  id: string
  user_id: string
  store_id: string
  value: number
  created_at: string
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        role: Role
      }
    }
  }
}
