'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { User } from '@/types'

interface AuthContextData {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isNewUser: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  updateUser: (user: User) => void
  setIsNewUser: (value: boolean) => void
}

interface RegisterData {
  name: string
  email: string
  cpf: string
  phone: string
  password: string
  term_a: boolean
  referenceCode?: string
  acceptReferralBonus?: boolean
  acceptSignupBonus?: boolean
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isNewUser, setIsNewUser] = useState(false)
  const router = useRouter()

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const loadStorageData = async () => {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
        // Atualizar dados do usuário
        await refreshUser()
      }
      
      setIsLoading(false)
    }

    loadStorageData()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      
      if (response.data.status && response.data.data) {
        // Backend retorna accessToken, não token
        const { accessToken, token, user: userData } = response.data.data
        const newToken = accessToken || token // Suporte para ambos os formatos
        
        // Salvar no localStorage
        localStorage.setItem('token', newToken)
        localStorage.setItem('user', JSON.stringify(userData))
        
        setToken(newToken)
        setUser(userData)
        
        toast.success('Login realizado com sucesso!')
        router.push('/home')
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao fazer login'
      toast.error(message)
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await api.post('/auth/register', data)
      
      if (response.data.status && response.data.data) {
        // Backend retorna accessToken, não token
        const { accessToken, token, user: userData } = response.data.data
        const newToken = accessToken || token // Suporte para ambos os formatos
        
        // Salvar no localStorage
        localStorage.setItem('token', newToken)
        localStorage.setItem('user', JSON.stringify(userData))
        
        setToken(newToken)
        setUser(userData)
        setIsNewUser(true) // Marcar como novo usuário para abrir modal de depósito
        
        toast.success('Cadastro realizado com sucesso! Você já está logado!')
        router.push('/home')
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao fazer cadastro'
      toast.error(message)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    toast.success('Logout realizado com sucesso!')
    router.push('/home')
  }

  const refreshUser = async () => {
    try {
      const response = await api.get('/profile')
      
      if (response.data.status && response.data.data) {
        const userData = response.data.data
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
      }
    } catch (error: any) {
      console.error('Erro ao atualizar dados do usuário:', error)
      // Se der 401, o interceptor já faz logout
      // Não fazer nada aqui para evitar loops
    }
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        isNewUser,
        login,
        register,
        logout,
        refreshUser,
        updateUser,
        setIsNewUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

