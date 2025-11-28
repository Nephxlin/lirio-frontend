'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Activity, Check, AlertCircle, Copy, RefreshCw } from 'lucide-react'

interface EventLog {
  id: string
  timestamp: string
  eventName: string
  properties: any
  status: 'success' | 'pending' | 'error'
}

export function KwaiDebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [events, setEvents] = useState<EventLog[]>([])
  const [sdkStatus, setSdkStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [pixelId, setPixelId] = useState<string | null>(null)
  const [clickId, setClickId] = useState<string | null>(null)
  const testClickId = '0D0NElE9N8onlSxVmaAuGA'

  // Verificar se modo debug está ativo
  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const debugMode = params.get('debug') === 'true'
    setIsOpen(debugMode)

    // Obter pixel ID do sessionStorage
    const storedPixelId = sessionStorage.getItem('kwai_pixel_id')
    setPixelId(storedPixelId)

    // Obter click ID
    const urlClickId = params.get('clickid') || params.get('kwai_clickid')
    const storedClickId = sessionStorage.getItem('kwai_clickid')
    setClickId(urlClickId || storedClickId)
    
    // Atualizar pixel ID quando mudar
    const interval = setInterval(() => {
      const newPixelId = sessionStorage.getItem('kwai_pixel_id')
      if (newPixelId && newPixelId !== storedPixelId) {
        setPixelId(newPixelId)
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  // Verificar status do SDK
  useEffect(() => {
    if (typeof window === 'undefined' || !pixelId) return

    let attempts = 0
    const maxAttempts = 20
    
    const checkSDK = setInterval(() => {
      attempts++
      
      try {
        if (
          window.kwaiq &&
          typeof window.kwaiq.instance === 'function' &&
          typeof window.kwaiq.instance(pixelId).track === 'function'
        ) {
          setSdkStatus('loaded')
          clearInterval(checkSDK)
        } else if (attempts >= maxAttempts) {
          setSdkStatus('error')
          clearInterval(checkSDK)
        }
      } catch {
        if (attempts >= maxAttempts) {
          setSdkStatus('error')
          clearInterval(checkSDK)
        }
      }
    }, 500)

    return () => clearInterval(checkSDK)
  }, [pixelId])

  // Interceptar logs do console
  useEffect(() => {
    const originalLog = console.log
    
    console.log = (...args: any[]) => {
      originalLog(...args)
      
      // Detectar logs do Kwai Tracker
      if (args[0] && typeof args[0] === 'string' && args[0].includes('[Kwai Tracker]')) {
        const message = args[0]
        const data = args[1]

        // Extrair nome do evento
        let eventName = 'unknown'
        let status: 'success' | 'pending' | 'error' = 'success'

        if (message.includes('Evento page disparado')) {
          eventName = 'pageView (page)'
        } else if (message.includes('Evento completeRegistration disparado')) {
          eventName = 'completeRegistration'
        } else if (message.includes('Evento initiatedCheckout disparado')) {
          eventName = 'initiatedCheckout'
        } else if (message.includes('Evento purchase disparado')) {
          eventName = 'purchase'
        } else if (message.includes('Evento purchase1Day disparado')) {
          eventName = 'purchase1Day'
        } else if (message.includes('Evento purchase2Day disparado')) {
          eventName = 'purchase2Day'
        } else if (message.includes('Evento purchase3Day disparado')) {
          eventName = 'purchase3Day'
        } else if (message.includes('Evento purchase7Day disparado')) {
          eventName = 'purchase7Day'
        } else if (message.includes('SDK não pronto')) {
          eventName = 'Aguardando SDK...'
          status = 'pending'
        } else if (message.includes('Pixel ID não encontrado')) {
          eventName = 'Erro: Pixel ID não encontrado'
          status = 'error'
        }

        if (eventName !== 'unknown') {
          const newEvent: EventLog = {
            id: Date.now().toString() + Math.random(),
            timestamp: new Date().toLocaleTimeString('pt-BR'),
            eventName,
            properties: data || {},
            status,
          }

          setEvents((prev) => [newEvent, ...prev].slice(0, 20))
        }
      }
    }

    return () => {
      console.log = originalLog
    }
  }, [])

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      console.log(`✅ ${label} copiado!`)
    } catch (error) {
      console.error('Erro ao copiar:', error)
    }
  }, [])

  const clearEvents = useCallback(() => {
    setEvents([])
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <div className="bg-gray-900 text-white rounded-lg shadow-2xl w-[400px] max-h-[600px] flex flex-col border border-yellow-500/30">
      {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
        <div className="flex items-center gap-2">
            <Activity className="text-yellow-400" size={20} />
            <h3 className="font-bold">Kwai Debug Panel</h3>
        </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
      </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* SDK Status */}
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-300">SDK Status:</span>
              {sdkStatus === 'loaded' && <Check className="text-green-400" size={18} />}
              {sdkStatus === 'loading' && <RefreshCw className="text-yellow-400 animate-spin" size={18} />}
              {sdkStatus === 'error' && <AlertCircle className="text-red-400" size={18} />}
            </div>
            <div className="text-sm">
              {sdkStatus === 'loaded' && <span className="text-green-400">🟢 Carregado</span>}
              {sdkStatus === 'loading' && <span className="text-yellow-400">🟡 Carregando...</span>}
              {sdkStatus === 'error' && <span className="text-red-400">🔴 Erro ao carregar</span>}
            </div>
          </div>

          {/* Pixel ID */}
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-300">Pixel ID:</span>
              {pixelId && (
                <button
                  onClick={() => copyToClipboard(pixelId, 'Pixel ID')}
                  className="text-yellow-400 hover:text-yellow-300"
                >
                  <Copy size={14} />
                </button>
              )}
            </div>
            <div className="text-xs font-mono bg-gray-900 p-2 rounded break-all">
              {pixelId || <span className="text-gray-500">Não configurado</span>}
            </div>
          </div>

          {/* Click ID */}
          {clickId && (
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-300">Click ID:</span>
            <button
                  onClick={() => copyToClipboard(clickId, 'Click ID')}
                  className="text-yellow-400 hover:text-yellow-300"
            >
                  <Copy size={14} />
            </button>
              </div>
              <div className="text-xs font-mono bg-gray-900 p-2 rounded break-all">
                {clickId}
              </div>
            </div>
          )}

          {/* Test Click ID */}
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-300">Test Click ID:</span>
              <button
                onClick={() => copyToClipboard(testClickId, 'Test Click ID')}
                className="text-yellow-400 hover:text-yellow-300"
              >
                <Copy size={14} />
              </button>
            </div>
            <div className="text-xs font-mono bg-gray-900 p-2 rounded break-all">
              {testClickId}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Use este Click ID para testes no Kwai Business Manager
            </p>
          </div>

          {/* Events Log */}
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-300">
                Eventos Disparados ({events.length})
              </span>
              <button
                onClick={clearEvents}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
              >
                <RefreshCw size={12} />
                Limpar
              </button>
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {events.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-4">
                  Nenhum evento disparado ainda.
                  <br />
                  Interaja com a aplicação para ver eventos.
                </p>
              )}

              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-gray-900 p-2 rounded text-xs border-l-2"
                  style={{
                    borderColor:
                      event.status === 'success'
                        ? '#10b981'
                        : event.status === 'pending'
                        ? '#f59e0b'
                        : '#ef4444',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white">{event.eventName}</span>
                    <span className="text-gray-500">{event.timestamp}</span>
                  </div>
                  {Object.keys(event.properties).length > 0 && (
                    <div className="text-gray-400 font-mono text-xs">
                      {JSON.stringify(event.properties, null, 2).substring(0, 100)}
                      {JSON.stringify(event.properties).length > 100 && '...'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-xs text-yellow-200">
              💡 <strong>Dica:</strong> Abra o Console (F12) para ver logs detalhados dos eventos Kwai.
            </p>
          </div>
        </div>
        </div>
    </div>
  )
}
