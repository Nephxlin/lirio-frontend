import { API_BASE_URL } from './api'

/**
 * Utilitário para construir URLs de imagens corretamente
 * Funciona tanto com URLs absolutas (retornadas pelo backend) quanto com caminhos relativos
 */

/**
 * Obtém a URL completa da imagem
 * Se já for uma URL completa (http/https), retorna como está
 * Caso contrário, constrói a URL com base no API_URL
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return ''

  // Se já é uma URL completa, retornar como está
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // Limpar o path de barras e "uploads/" extras
  let cleanPath = path
  
  // Remover "uploads/" do início se existir
  if (cleanPath.startsWith('uploads/')) {
    cleanPath = cleanPath.substring(8)
  }
  
  // Remover "/uploads/" do início se existir
  if (cleanPath.startsWith('/uploads/')) {
    cleanPath = cleanPath.substring(9)
  }

  // Construir URL completa
  return `${API_BASE_URL}/uploads/${cleanPath}`
}

/**
 * Obtém a URL da imagem com cache busting
 * Útil para forçar o reload da imagem após upload/edição
 */
export function getImageUrlWithCache(
  path: string | null | undefined,
  cacheBuster?: number | string
): string {
  const url = getImageUrl(path)
  if (!url) return ''

  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}v=${cacheBuster || Date.now()}`
}

/**
 * Verifica se uma URL de imagem é válida
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')
}

