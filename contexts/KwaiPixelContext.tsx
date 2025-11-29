/**
 * Context para Kwai Pixel Tracking
 */

'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useKwaiPixel } from '@/lib/kwai/useKwaiPixel'
import { KwaiEvent, KwaiEventProperties, KwaiPixelData } from '@/types/kwai'

/**
 * Tipo do contexto
 */
interface KwaiPixelContextType {
  // Estado
  pixels: KwaiPixelData[]
  loading: boolean
  error: string | null
  isReady: boolean

  // Métodos genéricos
  trackEvent: (eventName: KwaiEvent, properties?: KwaiEventProperties) => Promise<boolean>

  // Métodos específicos
  trackPageView: (contentName: string, contentType?: string) => Promise<boolean>
  trackCheckout: (value: number, transactionId?: string, currency?: string) => Promise<boolean>
  trackPurchase: (value: number, orderId: string, currency?: string, paymentMethod?: string) => Promise<boolean>
  trackRegistration: () => Promise<boolean>
  trackAddToCart: (value: number, currency?: string) => Promise<boolean>
  trackButtonClick: (buttonName: string) => Promise<boolean>
  trackRepurchase: (days: 1 | 2 | 3 | 7, value?: number, currency?: string) => Promise<boolean>
}

/**
 * Context
 */
const KwaiPixelContext = createContext<KwaiPixelContextType | null>(null)

/**
 * Props do Provider
 */
interface KwaiPixelProviderProps {
  children: ReactNode
  debug?: boolean
  autoCapture?: boolean
}

/**
 * Provider do Kwai Pixel
 */
export function KwaiPixelProvider({
  children,
  debug = false,
  autoCapture = true,
}: KwaiPixelProviderProps) {
  const kwaiPixel = useKwaiPixel({ debug, autoCapture })

  return (
    <KwaiPixelContext.Provider value={kwaiPixel}>
      {children}
    </KwaiPixelContext.Provider>
  )
}

/**
 * Hook para usar o contexto
 */
export function useKwaiPixelContext(): KwaiPixelContextType {
  const context = useContext(KwaiPixelContext)

  if (!context) {
    throw new Error(
      'useKwaiPixelContext deve ser usado dentro de KwaiPixelProvider'
    )
  }

  return context
}

