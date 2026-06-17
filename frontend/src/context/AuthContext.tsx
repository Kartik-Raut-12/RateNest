import React, { createContext, useContext, useState } from 'react'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ratenest_token'))
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('ratenest_user')
    return stored ? (JSON.parse(stored) as User) : null
  })


  const login = (token: string, user: User) => {
    localStorage.setItem('ratenest_token', token)
    localStorage.setItem('ratenest_user', JSON.stringify(user))
    setToken(token)
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem('ratenest_token')
    localStorage.removeItem('ratenest_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
