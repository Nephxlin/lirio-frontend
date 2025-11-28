'use client'

import { useEffect, useCallback, useState } from 'react'
import { useKwaiTracker } from '@/lib/hooks/useKwaiTracker'

/**
 * Componente para rastrear automaticamente eventos de re-purchase
 * 
 * Verifica localStorage para última compra e dispara eventos nos dias:
 * - Dia 1: purchase1Day
 * - Dia 2: purchase2Day
 * - Dia 3: purchase3Day
 * - Dia 7: purchase7Day
 */
export function KwaiRepurchaseTracker() {
  // Obter debug mode da URL
  const [debugMode, setDebugMode] = useState(false)
  const { trackRepurchaseEvent } = useKwaiTracker({ debug: debugMode })
  const [hasCheckedToday, setHasCheckedToday] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDebug = new URLSearchParams(window.location.search).get('debug') === 'true'
      setDebugMode(isDebug)
    }
  }, [])

  const checkAndTrackRepurchase = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      // Verificar se já checou hoje
      const lastCheckDate = localStorage.getItem('kwai_last_repurchase_check')
      const today = new Date().toDateString()

      if (lastCheckDate === today && hasCheckedToday) {
        if (debugMode) {
          console.log('[Kwai Repurchase] Já verificado hoje, pulando...')
        }
        return
      }

      // Obter última compra
      const lastPurchaseDate = localStorage.getItem('kwai_last_purchase_date')
      
      if (!lastPurchaseDate) {
        if (debugMode) {
          console.log('[Kwai Repurchase] Nenhuma compra anterior encontrada')
        }
        return
      }

      // Calcular dias desde última compra
      const lastPurchase = new Date(lastPurchaseDate)
      const now = new Date()
      const diffTime = now.getTime() - lastPurchase.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (debugMode) {
        console.log(`[Kwai Repurchase] Última compra: ${lastPurchase.toLocaleDateString()}`)
        console.log(`[Kwai Repurchase] Dias desde última compra: ${diffDays}`)
      }

      // Obter eventos já disparados
      const firedEvents = JSON.parse(
        localStorage.getItem('kwai_repurchase_events_fired') || '{}'
      )

      // Disparar evento apropriado se ainda não foi disparado
      if (diffDays === 1 && !firedEvents['day1']) {
        trackRepurchaseEvent('purchase1Day')
        firedEvents['day1'] = new Date().toISOString()
        localStorage.setItem('kwai_repurchase_events_fired', JSON.stringify(firedEvents))
        if (debugMode) {
          console.log('[Kwai Repurchase] ✅ Evento purchase1Day disparado')
        }
      } else if (diffDays === 2 && !firedEvents['day2']) {
        trackRepurchaseEvent('purchase2Day')
        firedEvents['day2'] = new Date().toISOString()
        localStorage.setItem('kwai_repurchase_events_fired', JSON.stringify(firedEvents))
        if (debugMode) {
          console.log('[Kwai Repurchase] ✅ Evento purchase2Day disparado')
        }
      } else if (diffDays === 3 && !firedEvents['day3']) {
        trackRepurchaseEvent('purchase3Day')
        firedEvents['day3'] = new Date().toISOString()
        localStorage.setItem('kwai_repurchase_events_fired', JSON.stringify(firedEvents))
        if (debugMode) {
          console.log('[Kwai Repurchase] ✅ Evento purchase3Day disparado')
        }
      } else if (diffDays === 7 && !firedEvents['day7']) {
        trackRepurchaseEvent('purchase7Day')
        firedEvents['day7'] = new Date().toISOString()
        localStorage.setItem('kwai_repurchase_events_fired', JSON.stringify(firedEvents))
        if (debugMode) {
          console.log('[Kwai Repurchase] ✅ Evento purchase7Day disparado')
        }
      }

      // Marcar que já checou hoje
      localStorage.setItem('kwai_last_repurchase_check', today)
      setHasCheckedToday(true)

    } catch (error) {
      console.error('[Kwai Repurchase] Erro ao verificar re-purchase:', error)
    }
  }, [trackRepurchaseEvent, debugMode, hasCheckedToday])

  // Verificar imediatamente ao montar
  useEffect(() => {
    // Aguardar 5 segundos para SDK carregar
    const timer = setTimeout(() => {
      checkAndTrackRepurchase()
    }, 5000)

    return () => clearTimeout(timer)
  }, [checkAndTrackRepurchase])

  // Verificar a cada 1 hora
  useEffect(() => {
    const interval = setInterval(() => {
      checkAndTrackRepurchase()
    }, 60 * 60 * 1000) // 1 hora

    return () => clearInterval(interval)
  }, [checkAndTrackRepurchase])

  return null
}

export default KwaiRepurchaseTracker
