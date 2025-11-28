import axios, { AxiosError } from 'axios'
import toast from 'react-hot-toast'

// Exportar URL base da API (sem /api) para uso em imagens
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'
export const API_URL = `${API_BASE_URL}/api`

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor para adicionar o token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError<any>) => {
    if (error.response) {
      const { status, data } = error.response

      // Token expirado ou inválido
      if (status === 401) {
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname
          // Só redirecionar se não estiver em páginas públicas
          if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            toast.error('Sessão expirada. Faça login novamente.')
            setTimeout(() => {
              window.location.href = '/login'
            }, 1000)
          }
        }
      }

      // Erro de validação - não mostrar toast se for erro silencioso
      if (status === 400 && data.message) {
        // Não mostrar toast para todos os erros 400, apenas os críticos
        if (!data.silent) {
          toast.error(data.message)
        }
      }

      // Erro de servidor
      if (status === 500) {
        toast.error('Erro no servidor. Tente novamente mais tarde.')
      }

      // Erro de permissão
      if (status === 403) {
        toast.error('Você não tem permissão para realizar esta ação.')
      }

      // Erro 404 - não mostrar toast, deixar componente lidar
      if (status === 404) {
        console.warn('Rota não encontrada:', error.config?.url)
      }
    } else if (error.request) {
      // Erro de rede - só mostrar se não for em rotas opcionais
      const url = error.config?.url || ''
      if (!url.includes('/banners') && !url.includes('/categories')) {
        toast.error('Erro de conexão. Verifique sua internet.')
      }
    }

    return Promise.reject(error)
  }
)

export default api

