'use client'

import { useCallback } from 'react'

// Tipos de eventos suportados pelo Kwai Pixel
export type KwaiEventType = 
  | 'contentView'
  | 'initiatedCheckout'
  | 'purchase'
  | 'completeRegistration'
  | 'purchase1Day'
  | 'purchase2Day'
  | 'purchase3Day'
  | 'purchase7Day'
  | 'addToCart'
  | 'search'

// Propriedades do evento
export interface KwaiEventProperties {
  value?: number
  currency?: string
  content_type?: string
  content_name?: string
  content_id?: string
  transaction_id?: string
  [key: string]: any
}

// Opções do hook
export interface UseKwaiTrackerOptions {
  pixelId?: string
  debug?: boolean
}

// Declaração global
declare global {
  interface Window {
    kwaiq: {
      instance: (pixelId: string) => {
        track: (event: string, properties?: any) => void
        page: (properties?: any) => void
      }
      load: (pixelId: string, options?: any) => void
    }
    KwaiAnalyticsObject: string
  }
}

export function useKwaiTracker(options: UseKwaiTrackerOptions = {}) {
  const { pixelId: propsPixelId, debug = false } = options

  // Obter pixel ID (de props, sessionStorage ou URL)
  const getPixelId = useCallback(() => {
    if (typeof window === 'undefined') return null

    // 1. Usar o pixelId passado por props (se houver)
    if (propsPixelId) return propsPixelId

    // 2. Tentar obter da sessionStorage (prioridade)
    const storedPixelId = sessionStorage.getItem('kwai_pixel_id')
    if (storedPixelId) return storedPixelId

    // 3. Tentar obter da URL (fallback)
    const params = new URLSearchParams(window.location.search)
    const urlPixelId = params.get('kpid') || params.get('kwai_pixel') || params.get('pixel_id')
    
    if (urlPixelId) {
      sessionStorage.setItem('kwai_pixel_id', urlPixelId)
      return urlPixelId
    }

    if (debug) {
      console.warn('[Kwai Tracker] ⚠️ Pixel ID não encontrado. Aguardando inicialização...')
    }
    
    return null
  }, [propsPixelId, debug])

  // Verificar se SDK está carregado
  const isSDKReady = useCallback((pixelId: string) => {
    if (typeof window === 'undefined') return false
    
    try {
      return (
        window.kwaiq &&
        typeof window.kwaiq.instance === 'function' &&
        typeof window.kwaiq.instance(pixelId).track === 'function'
      )
    } catch {
      return false
    }
  }, [])

  // Obter informações da sessão
  const getSessionInfo = useCallback(() => {
    if (typeof window === 'undefined') return {}
    
    try {
      return {
        clickid: sessionStorage.getItem('kwai_clickid') || undefined,
        mmpcode: sessionStorage.getItem('kwai_mmpcode') || undefined,
      }
    } catch {
      return {}
    }
  }, [])

  // Rastrear evento genérico
  const trackEvent = useCallback((
    eventName: KwaiEventType,
    properties?: KwaiEventProperties
  ) => {
    const pixelId = getPixelId()
    
    if (!pixelId) {
      if (debug) console.warn('[Kwai Tracker] ⚠️ Pixel ID não encontrado')
      return
    }

    const attemptTrack = (attempt: number = 1, maxAttempts: number = 5): void => {
      if (!isSDKReady(pixelId)) {
        if (attempt < maxAttempts) {
          if (debug) {
            console.log(`[Kwai Tracker] 🔄 Tentativa ${attempt}/${maxAttempts} - SDK não pronto`)
          }
          setTimeout(() => attemptTrack(attempt + 1, maxAttempts), 1000)
        } else {
          console.error('[Kwai Tracker] ❌ SDK não carregou após ' + maxAttempts + ' tentativas')
        }
        return
      }

      try {
        const sessionInfo = getSessionInfo()
        const enrichedProps = {
          ...properties,
          ...sessionInfo,
        }

        // contentView usa page(), outros usam track()
        if (eventName === 'contentView') {
          window.kwaiq.instance(pixelId).page(enrichedProps)
          if (debug) {
            console.log('[Kwai Tracker] 📄 Evento page disparado:', enrichedProps)
          }
        } else {
          window.kwaiq.instance(pixelId).track(eventName, enrichedProps)
          if (debug) {
            console.log(`[Kwai Tracker] ✅ Evento ${eventName} disparado:`, enrichedProps)
          }
        }
      } catch (error) {
        console.error('[Kwai Tracker] ❌ Erro ao disparar evento:', error)
      }
    }

    attemptTrack()
  }, [getPixelId, isSDKReady, getSessionInfo, debug])

  // Atalho: contentView
  const trackContentView = useCallback((properties?: KwaiEventProperties) => {
    trackEvent('contentView', properties)
  }, [trackEvent])

  // Atalho: completeRegistration
  const trackCompleteRegistration = useCallback((properties?: KwaiEventProperties) => {
    trackEvent('completeRegistration', properties)
  }, [trackEvent])

  // Atalho: initiatedCheckout
  const trackInitiatedCheckout = useCallback((
    value: number,
    transactionId: string,
    currency: string = 'BRL'
  ) => {
    trackEvent('initiatedCheckout', {
      value,
      currency,
      transaction_id: transactionId,
    })
  }, [trackEvent])

  // Atalho: purchase
  const trackPurchase = useCallback((
    value: number,
    transactionId: string,
    currency: string = 'BRL'
  ) => {
    trackEvent('purchase', {
      value,
      currency,
      transaction_id: transactionId,
    })

    // Salvar data da última compra para eventos de re-purchase
    if (typeof window !== 'undefined') {
      try {
        const now = new Date().toISOString()
        localStorage.setItem('kwai_last_purchase_date', now)
        localStorage.setItem('kwai_last_purchase_value', value.toString())
        
        if (debug) {
          console.log(`[Kwai Tracker] 💾 Última compra salva: ${now} - R$ ${value}`)
        }
      } catch (error) {
        console.error('[Kwai Tracker] Erro ao salvar última compra:', error)
      }
    }
  }, [trackEvent, debug])

  // Atalho: eventos de re-purchase
  const trackRepurchaseEvent = useCallback((eventName: 'purchase1Day' | 'purchase2Day' | 'purchase3Day' | 'purchase7Day') => {
    if (typeof window === 'undefined') return

    try {
      const lastPurchaseDate = localStorage.getItem('kwai_last_purchase_date')
      const lastPurchaseValue = localStorage.getItem('kwai_last_purchase_value')

      if (!lastPurchaseDate) {
        if (debug) {
          console.warn('[Kwai Tracker] ⚠️ Nenhuma compra anterior encontrada para evento de re-purchase')
        }
        return
      }

      const daysSinceLastPurchase = Math.floor(
        (Date.now() - new Date(lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24)
      )

      trackEvent(eventName, {
        value: lastPurchaseValue ? parseFloat(lastPurchaseValue) : undefined,
        currency: 'BRL',
        days_since_last_purchase: daysSinceLastPurchase,
      })
    } catch (error) {
      console.error('[Kwai Tracker] Erro ao disparar evento de re-purchase:', error)
    }
  }, [trackEvent, debug])

  return {
    trackEvent,
    trackContentView,
    trackCompleteRegistration,
    trackInitiatedCheckout,
    trackPurchase,
    trackRepurchaseEvent,
  }
}
