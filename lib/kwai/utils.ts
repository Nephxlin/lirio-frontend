/**
 * Utilitários para Kwai Pixel Tracking
 */

import { KwaiPixelConfig, KwaiSessionInfo } from '@/types/kwai'

/**
 * Duração do cookie em dias
 */
const COOKIE_DURATION_DAYS = 30

/**
 * Define um cookie com duração especificada
 */
export function setCookie(name: string, value: string, days: number = COOKIE_DURATION_DAYS): void {
  if (typeof window === 'undefined') return

  try {
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
  } catch (error) {
    console.error('[Kwai Utils] Erro ao definir cookie:', error)
  }
}

/**
 * Obtém o valor de um cookie
 */
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null

  try {
    const nameEQ = name + '='
    const ca = document.cookie.split(';')
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    
    return null
  } catch (error) {
    console.error('[Kwai Utils] Erro ao ler cookie:', error)
    return null
  }
}

/**
 * Remove um cookie
 */
export function removeCookie(name: string): void {
  if (typeof window === 'undefined') return

  try {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;SameSite=Lax`
  } catch (error) {
    console.error('[Kwai Utils] Erro ao remover cookie:', error)
  }
}

/**
 * Captura clickid e mmpcode da URL
 */
export function captureClickIdFromURL(): { clickid: string | null; mmpcode: string | null } {
  if (typeof window === 'undefined') {
    return { clickid: null, mmpcode: null }
  }

  try {
    const params = new URLSearchParams(window.location.search)
    
    // Tentar diferentes nomes de parâmetros para clickid
    const clickid = params.get('clickid') || 
                     params.get('click_id') || 
                     params.get('kwai_clickid') ||
                     params.get('test_clickid') || // Para testes
                     null
    
    // Tentar diferentes nomes de parâmetros para mmpcode
    const mmpcode = params.get('mmpcode') || 
                     params.get('mmp_code') || 
                     params.get('kwai_mmpcode') ||
                     'PL' // Default conforme especificação
    
    return { clickid, mmpcode }
  } catch (error) {
    console.error('[Kwai Utils] Erro ao capturar clickid da URL:', error)
    return { clickid: null, mmpcode: 'PL' }
  }
}

/**
 * Salva clickid e mmpcode em cookies
 */
export function saveSessionInfo(clickid: string, mmpcode: string): void {
  if (!clickid) return

  setCookie('kwai_clickid', clickid, COOKIE_DURATION_DAYS)
  setCookie('kwai_mmpcode', mmpcode, COOKIE_DURATION_DAYS)
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[Kwai Utils] 💾 Sessão salva:', { clickid, mmpcode })
  }
}

/**
 * Obtém informações de sessão dos cookies
 */
export function getSessionInfo(): KwaiSessionInfo {
  const clickid = getCookie('kwai_clickid')
  const mmpcode = getCookie('kwai_mmpcode') || 'PL'
  
  return { clickid, mmpcode }
}

/**
 * Limpa informações de sessão dos cookies
 */
export function clearSessionInfo(): void {
  removeCookie('kwai_clickid')
  removeCookie('kwai_mmpcode')
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[Kwai Utils] 🧹 Sessão limpa')
  }
}

/**
 * Valida se as configurações do pixel estão completas
 */
export function validatePixelConfig(config: KwaiPixelConfig | null): {
  valid: boolean
  error?: string
} {
  if (!config) {
    return { valid: false, error: 'Configuração do pixel não fornecida' }
  }

  if (!config.pixelId || config.pixelId.trim() === '') {
    return { valid: false, error: 'pixelId não configurado' }
  }

  if (!config.accessToken || config.accessToken.trim() === '') {
    return { valid: false, error: 'accessToken não configurado' }
  }

  return { valid: true }
}

/**
 * Valida se há uma sessão ativa (clickid presente)
 */
export function validateSession(): { valid: boolean; error?: string } {
  const { clickid } = getSessionInfo()

  if (!clickid || clickid.trim() === '') {
    return { 
      valid: false, 
      error: 'clickid não encontrado. Usuário não veio de anúncio Kwai.' 
    }
  }

  return { valid: true }
}

/**
 * Converte propriedades do evento para string JSON
 */
export function stringifyProperties(properties?: Record<string, any>): string {
  if (!properties || Object.keys(properties).length === 0) {
    return '{}'
  }

  try {
    return JSON.stringify(properties)
  } catch (error) {
    console.error('[Kwai Utils] Erro ao stringificar propriedades:', error)
    return '{}'
  }
}

/**
 * Gera um ID único para rastreamento
 */
export function generateTrackingId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Verifica se está em modo de desenvolvimento
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Log apenas em desenvolvimento
 */
export function devLog(message: string, ...args: any[]): void {
  if (isDevelopment()) {
    console.log(message, ...args)
  }
}

/**
 * Captura e salva automaticamente clickid/mmpcode da URL
 */
export function autoCapture(): boolean {
  const { clickid, mmpcode } = captureClickIdFromURL()
  
  if (clickid) {
    saveSessionInfo(clickid, mmpcode || 'PL')
    
    if (isDevelopment()) {
      console.log('[Kwai Utils] ✅ Auto-captura realizada:', { clickid, mmpcode })
    }
    
    return true
  }
  
  return false
}

/**
 * Formata valor monetário para o padrão Kwai
 */
export function formatCurrency(value: number): number {
  return parseFloat(value.toFixed(2))
}

