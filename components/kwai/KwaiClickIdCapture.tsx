/**
 * Componente para capturar clickid e mmpcode da URL
 */

'use client'

import { useEffect, useState } from 'react'
import { captureClickIdFromURL, saveSessionInfo, getSessionInfo } from '@/lib/kwai/utils'

/**
 * Componente que captura automaticamente clickid/mmpcode da URL
 * e salva em cookies
 */
export function KwaiClickIdCapture() {
  const [captured, setCaptured] = useState(false)

  useEffect(() => {
    // Verificar se já existe sessão salva
    const existingSession = getSessionInfo()
    
    if (existingSession.clickid) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Kwai ClickId] 📦 Sessão existente:', existingSession)
      }
      setCaptured(true)
      return
    }

    // Tentar capturar da URL
    const { clickid, mmpcode } = captureClickIdFromURL()

    if (clickid) {
      saveSessionInfo(clickid, mmpcode || 'PL')
      setCaptured(true)

      if (process.env.NODE_ENV === 'development') {
        console.log('[Kwai ClickId] ✅ Capturado da URL:', { clickid, mmpcode })
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Kwai ClickId] ℹ️ Usuário não veio de anúncio Kwai')
      }
    }
  }, [])

  // Este componente não renderiza nada
  return null
}

