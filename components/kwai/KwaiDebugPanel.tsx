/**
 * Painel de debug para Kwai Pixel
 */

'use client'

import { useState, useEffect } from 'react'
import { useKwaiPixelContext } from '@/contexts/KwaiPixelContext'
import { getSessionInfo } from '@/lib/kwai/utils'
import type { KwaiSessionInfo } from '@/types/kwai'

/**
 * Painel de debug - Visível apenas em desenvolvimento
 */
export function KwaiDebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<KwaiSessionInfo>({ clickid: null, mmpcode: null })
  const { pixels, loading, error, isReady, trackPageView } = useKwaiPixelContext()

  // Atualizar informações de sessão
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionInfo(getSessionInfo())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Só mostrar em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <>
      {/* Botão de toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-[9999] bg-purple-600 hover:bg-purple-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all"
        title="Kwai Pixel Debug"
      >
        <span className="text-xl">🎯</span>
      </button>

      {/* Painel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-[9999] bg-gray-900 text-white p-4 rounded-lg shadow-2xl max-w-md w-full border border-purple-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-purple-400">Kwai Pixel Debug</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Status */}
          <div className="mb-3 p-2 bg-gray-800 rounded">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">Status:</span>
              {loading && <span className="text-yellow-400">⏳ Carregando...</span>}
              {error && <span className="text-red-400">❌ {error}</span>}
              {isReady && <span className="text-green-400">✅ Pronto</span>}
            </div>
          </div>

          {/* Pixels */}
          <div className="mb-3 p-2 bg-gray-800 rounded">
            <div className="text-sm font-semibold mb-1">Pixels Ativos:</div>
            {pixels.length === 0 ? (
              <div className="text-gray-400 text-xs">Nenhum pixel configurado</div>
            ) : (
              <ul className="text-xs space-y-1">
                {pixels.map((pixel) => (
                  <li key={pixel.id} className="text-green-400">
                    • {pixel.name || pixel.pixelId}
                    <span className="text-gray-500 ml-1">
                      ({pixel.pixelId.substring(0, 8)}...)
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Sessão */}
          <div className="mb-3 p-2 bg-gray-800 rounded">
            <div className="text-sm font-semibold mb-1">Sessão:</div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">ClickID:</span>
                <span className={sessionInfo.clickid ? 'text-green-400' : 'text-red-400'}>
                  {sessionInfo.clickid || 'Não capturado'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">MMP Code:</span>
                <span className="text-blue-400">{sessionInfo.mmpcode || 'PL'}</span>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="space-y-2">
            <button
              onClick={() => {
                if (sessionInfo.clickid) {
                  navigator.clipboard.writeText(sessionInfo.clickid)
                  alert('ClickID copiado!')
                }
              }}
              disabled={!sessionInfo.clickid}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-xs py-2 px-3 rounded transition"
            >
              Copiar ClickID
            </button>

            <button
              onClick={async () => {
                try {
                  await trackPageView('test_page', 'page')
                  alert('✅ Evento de teste enviado com sucesso!')
                } catch (error) {
                  alert('❌ Erro ao enviar evento de teste')
                  console.error('Erro:', error)
                }
              }}
              disabled={!isReady || !sessionInfo.clickid}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-xs py-2 px-3 rounded transition"
            >
              Enviar Evento Teste
            </button>
          </div>

          {/* Info */}
          <div className="mt-3 text-xs text-gray-500 text-center">
            Visível apenas em desenvolvimento
          </div>
        </div>
      )}
    </>
  )
}

