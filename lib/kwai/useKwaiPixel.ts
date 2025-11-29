/**
 * Hook para tracking de eventos Kwai Pixel
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  KwaiEvent,
  KwaiEventProperties,
  KwaiPixelData,
  KwaiTrackResult,
  UseKwaiPixelOptions,
} from '@/types/kwai'
import {
  getSessionInfo,
  validatePixelConfig,
  validateSession,
  stringifyProperties,
  autoCapture,
  devLog,
  formatCurrency,
} from './utils'
import api from '@/lib/api'

/**
 * Hook para tracking de eventos Kwai Pixel
 */
export function useKwaiPixel(options: UseKwaiPixelOptions = {}) {
  const { debug = false, autoCapture: shouldAutoCapture = true } = options

  const [pixels, setPixels] = useState<KwaiPixelData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Carrega configurações de pixels do backend
   */
  useEffect(() => {
    const fetchPixels = async () => {
      try {
        if (debug) {
          console.log('[useKwaiPixel] 🔄 Carregando pixels...')
        }

        const response = await api.get('/settings/kwai-pixels')

        if (response.data.status && response.data.data) {
          const pixelList = response.data.data as KwaiPixelData[]

          // Filtrar apenas pixels que têm accessToken
          const validPixels = pixelList.filter(
            (p) => p.pixelId && p.accessToken
          )

          if (validPixels.length === 0) {
            setError('Nenhum pixel válido configurado')
            if (debug) {
              console.warn('[useKwaiPixel] ⚠️ Nenhum pixel válido encontrado')
            }
          } else {
            setPixels(validPixels)
            if (debug) {
              console.log('[useKwaiPixel] ✅ Pixels carregados:', validPixels.length)
            }
          }
        } else {
          setError('Falha ao carregar pixels')
        }
      } catch (err: any) {
        console.error('[useKwaiPixel] ❌ Erro ao carregar pixels:', err)
        setError(err.message || 'Erro ao carregar pixels')
      } finally {
        setLoading(false)
      }
    }

    fetchPixels()
  }, [debug])

  /**
   * Auto-captura de clickid/mmpcode da URL
   */
  useEffect(() => {
    if (shouldAutoCapture && typeof window !== 'undefined') {
      const captured = autoCapture()
      
      if (captured && debug) {
        console.log('[useKwaiPixel] ✅ Clickid capturado automaticamente')
      }
    }
  }, [shouldAutoCapture, debug])

  /**
   * Envia evento para um pixel específico
   */
  const sendEventToPixel = useCallback(
    async (
      pixel: KwaiPixelData,
      eventName: KwaiEvent,
      properties?: KwaiEventProperties
    ): Promise<KwaiTrackResult> => {
      try {
        // Validar configuração do pixel
        const configValidation = validatePixelConfig({
          pixelId: pixel.pixelId,
          accessToken: pixel.accessToken || '',
        })

        if (!configValidation.valid) {
          return {
            success: false,
            pixelId: pixel.pixelId,
            error: configValidation.error,
          }
        }

        // Obter informações de sessão
        const sessionInfo = getSessionInfo()

        // Validar sessão (clickid obrigatório)
        const sessionValidation = validateSession()
        if (!sessionValidation.valid) {
          if (debug) {
            console.warn(
              `[useKwaiPixel] ⚠️ Pixel ${pixel.pixelId}: ${sessionValidation.error}`
            )
          }
          return {
            success: false,
            pixelId: pixel.pixelId,
            error: sessionValidation.error,
          }
        }

        // Preparar properties
        const enrichedProperties = {
          ...properties,
        }

        // Construir payload
        const payload = {
          access_token: pixel.accessToken,
          callback: '',
          clickid: sessionInfo.clickid || '',
          event_name: eventName,
          mmpcode: sessionInfo.mmpcode || 'PL',
          pixelId: pixel.pixelId,
          properties: stringifyProperties(enrichedProperties),
          testFlag: false,
        }

        if (debug) {
          console.log(`[useKwaiPixel] 📤 Enviando para pixel ${pixel.pixelId}:`, {
            event: eventName,
            properties: enrichedProperties,
          })
        }

        // Enviar para API Route
        const response = await fetch('/api/kwai-track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        const data = await response.json()

        if (data.success) {
          if (debug) {
            console.log(
              `[useKwaiPixel] ✅ Pixel ${pixel.pixelId}: Evento ${eventName} enviado`
            )
          }
          return {
            success: true,
            pixelId: pixel.pixelId,
          }
        } else {
          console.error(
            `[useKwaiPixel] ❌ Pixel ${pixel.pixelId}: ${data.error}`
          )
          return {
            success: false,
            pixelId: pixel.pixelId,
            error: data.error,
          }
        }
      } catch (err: any) {
        console.error(
          `[useKwaiPixel] ❌ Erro ao enviar para pixel ${pixel.pixelId}:`,
          err
        )
        return {
          success: false,
          pixelId: pixel.pixelId,
          error: err.message || 'Erro ao enviar evento',
        }
      }
    },
    [debug]
  )

  /**
   * Envia evento para todos os pixels ativos
   */
  const trackEvent = useCallback(
    async (
      eventName: KwaiEvent,
      properties?: KwaiEventProperties
    ): Promise<boolean> => {
      if (pixels.length === 0) {
        if (debug) {
          console.warn('[useKwaiPixel] ⚠️ Nenhum pixel configurado')
        }
        return false
      }

      if (debug) {
        console.log('[useKwaiPixel] 📊 Rastreando evento:', {
          event: eventName,
          pixels: pixels.length,
          properties,
        })
      }

      // Enviar para todos os pixels simultaneamente
      const results = await Promise.allSettled(
        pixels.map((pixel) => sendEventToPixel(pixel, eventName, properties))
      )

      // Contar sucessos
      const successCount = results.filter(
        (r) => r.status === 'fulfilled' && r.value.success
      ).length

      if (debug) {
        console.log(
          `[useKwaiPixel] 📊 Resultado: ${successCount}/${pixels.length} pixels`
        )
      }

      return successCount > 0
    },
    [pixels, sendEventToPixel, debug]
  )

  /**
   * Rastreia visualização de conteúdo
   */
  const trackPageView = useCallback(
    async (contentName: string, contentType: string = 'page') => {
      return trackEvent('EVENT_CONTENT_VIEW', {
        content_name: contentName,
        content_type: contentType,
      })
    },
    [trackEvent]
  )

  /**
   * Rastreia início de checkout
   */
  const trackCheckout = useCallback(
    async (value: number, transactionId?: string, currency: string = 'BRL') => {
      return trackEvent('EVENT_INITIATED_CHECKOUT', {
        value: formatCurrency(value),
        currency,
        transaction_id: transactionId,
      })
    },
    [trackEvent]
  )

  /**
   * Rastreia compra completa
   */
  const trackPurchase = useCallback(
    async (
      value: number,
      orderId: string,
      currency: string = 'BRL',
      paymentMethod?: string
    ) => {
      return trackEvent('EVENT_PURCHASE', {
        value: formatCurrency(value),
        currency,
        order_id: orderId,
        payment_method: paymentMethod,
      })
    },
    [trackEvent]
  )

  /**
   * Rastreia registro completo
   */
  const trackRegistration = useCallback(async () => {
    return trackEvent('EVENT_COMPLETE_REGISTRATION', {})
  }, [trackEvent])

  /**
   * Rastreia adição ao carrinho
   */
  const trackAddToCart = useCallback(
    async (value: number, currency: string = 'BRL') => {
      return trackEvent('EVENT_ADD_CART', {
        value: formatCurrency(value),
        currency,
      })
    },
    [trackEvent]
  )

  /**
   * Rastreia clique em botão
   */
  const trackButtonClick = useCallback(
    async (buttonName: string) => {
      return trackEvent('EVENT_BUTTON_CLICK', {
        content_name: buttonName,
      })
    },
    [trackEvent]
  )

  /**
   * Rastreia evento de re-compra (1, 2, 3 ou 7 dias)
   */
  const trackRepurchase = useCallback(
    async (days: 1 | 2 | 3 | 7, value?: number, currency: string = 'BRL') => {
      const eventMap: Record<number, KwaiEvent> = {
        1: 'EVENT_PURCHASE_1_DAY',
        2: 'EVENT_PURCHASE_2_DAY',
        3: 'EVENT_PURCHASE_3_DAY',
        7: 'EVENT_PURCHASE_7_DAY',
      }

      const eventName = eventMap[days]
      if (!eventName) {
        console.error('[useKwaiPixel] ❌ Dias inválido para re-compra:', days)
        return false
      }

      return trackEvent(eventName, {
        value: value ? formatCurrency(value) : undefined,
        currency,
      })
    },
    [trackEvent]
  )

  return {
    // Estado
    pixels,
    loading,
    error,
    isReady: !loading && pixels.length > 0 && !error,

    // Métodos genéricos
    trackEvent,

    // Métodos específicos
    trackPageView,
    trackCheckout,
    trackPurchase,
    trackRegistration,
    trackAddToCart,
    trackButtonClick,
    trackRepurchase,
  }
}

