'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { KwaiPixelHead } from './KwaiPixelHead'
import { KwaiRepurchaseTracker } from './KwaiRepurchaseTracker'
import { KwaiDebugPanel } from './KwaiDebugPanel'
import { useKwaiPixelConfig } from '@/lib/hooks/useKwaiPixelConfig'

/**
 * Wrapper client-side para componentes Kwai
 * 
 * Prioridade de configuração:
 * 1. Pixel ID da URL (debug/testes) - parâmetros: kpid, kwai_pixel, pixel_id
 * 2. Pixel ID da API (configurado no admin panel)
 * 3. SessionStorage (cache)
 */
export function KwaiWrapper() {
  const searchParams = useSearchParams()
  const { config, loading, error } = useKwaiPixelConfig()
  const [pixelId, setPixelId] = useState<string | null>(null)
  
  // Parâmetros da URL (prioridade para testes)
  const urlPixelId = searchParams.get('kpid') || searchParams.get('kwai_pixel') || searchParams.get('pixel_id')
  const debugMode = searchParams.get('debug') === 'true'

  useEffect(() => {
    // Se tem pixel ID na URL, usar imediatamente
    if (urlPixelId) {
      console.log('[Kwai Wrapper] 🎯 Usando Pixel ID da URL:', urlPixelId)
      setPixelId(urlPixelId)
      return
    }

    // Aguardar API carregar
    if (loading) {
      console.log('[Kwai Wrapper] ⏳ Aguardando API carregar...')
      return
    }

    // Se API carregou e tem pixel, usar
    if (config?.pixelId) {
      console.log('[Kwai Wrapper] ✅ Usando Pixel ID da API:', config.pixelId)
      setPixelId(config.pixelId)
    } else if (error) {
      console.warn('[Kwai Wrapper] ⚠️ Erro ao buscar pixel da API:', error)
      console.warn('[Kwai Wrapper] 💡 Configure no Admin Panel: /dashboard/kwai-pixels')
    } else {
      console.warn('[Kwai Wrapper] ⚠️ Nenhum Pixel ID configurado no Admin Panel')
      console.warn('[Kwai Wrapper] 💡 Acesse: /dashboard/kwai-pixels para configurar')
    }
  }, [urlPixelId, config, loading, error])

  // Se não tem pixel ID ainda, não renderizar
  if (!pixelId) {
    return null
  }

  console.log('[Kwai Wrapper] 🚀 Renderizando componentes Kwai com Pixel ID:', pixelId)

  return (
    <>
      {/* Pixel no HEAD para carregamento rápido */}
      <KwaiPixelHead pixelId={pixelId} />
      
      {/* Trackers adicionais */}
      <KwaiRepurchaseTracker pixelId={pixelId} debug={debugMode} />
      {debugMode && <KwaiDebugPanel pixelId={pixelId} />}
    </>
  )
}
