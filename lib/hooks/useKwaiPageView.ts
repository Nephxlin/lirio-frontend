'use client'

import { useEffect } from 'react'
import { useKwaiTracker } from './useKwaiTracker'

/**
 * Hook para disparar evento contentView automaticamente ao carregar a página
 * 
 * @param contentName - Nome da página/conteúdo (ex: 'home', 'games', 'profile')
 * @param options - Propriedades adicionais do evento
 * 
 * @example
 * // Em uma página:
 * useKwaiPageView('home', { content_type: 'landing_page' })
 */
export function useKwaiPageView(
  contentName: string,
  options?: {
    content_type?: string
    content_id?: string
    [key: string]: any
  }
) {
  const { trackContentView } = useKwaiTracker()

  useEffect(() => {
    // Aguardar um pouco para garantir que SDK está pronto
    const timer = setTimeout(() => {
      trackContentView({
        content_name: contentName,
        content_type: options?.content_type || 'page',
        ...options,
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [contentName, trackContentView, options])
}




