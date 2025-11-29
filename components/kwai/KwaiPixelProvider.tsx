/**
 * Componente wrapper do KwaiPixelProvider
 */

'use client'

import { ReactNode } from 'react'
import { KwaiPixelProvider as Provider } from '@/contexts/KwaiPixelContext'

interface KwaiPixelProviderProps {
  children: ReactNode
}

/**
 * Wrapper do Provider Kwai Pixel
 * 
 * Configura automaticamente debug em desenvolvimento
 */
export function KwaiPixelProvider({ children }: KwaiPixelProviderProps) {
  const isDev = process.env.NODE_ENV === 'development'

  return (
    <Provider debug={isDev} autoCapture={true}>
      {children}
    </Provider>
  )
}

