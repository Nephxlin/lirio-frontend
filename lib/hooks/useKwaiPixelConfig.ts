'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

interface KwaiPixelConfig {
  pixelId: string
  accessToken?: string
}

/**
 * Hook para obter configuração do Kwai Pixel da API
 * 
 * Prioridade:
 * 1. Pixel ID da URL (para testes)
 * 2. Pixel ID da API (configurado no admin)
 * 3. SessionStorage (cache)
 */
export function useKwaiPixelConfig() {
  const [config, setConfig] = useState<KwaiPixelConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPixelConfig = async () => {
      try {
        // 1. Verificar se tem pixel ID na URL (prioridade para testes)
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search)
          const urlPixelId = params.get('kpid') || params.get('kwai_pixel') || params.get('pixel_id')
          
          if (urlPixelId) {
            console.log('[Kwai Config] 🎯 Usando Pixel ID da URL:', urlPixelId)
            setConfig({ pixelId: urlPixelId })
            setLoading(false)
            return
          }
        }

        // 2. Buscar da API
        console.log('[Kwai Config] 🔄 Buscando configuração da API...')
        const response = await api.get('/settings/kwai-pixels')
        
        if (response.data.status && response.data.data && response.data.data.length > 0) {
          const pixels = response.data.data
          
          // Usar o primeiro pixel ativo
          const activePixel = pixels.find((p: any) => p.isActive !== false) || pixels[0]
          
          if (activePixel) {
            const pixelConfig: KwaiPixelConfig = {
              pixelId: activePixel.pixelId,
              accessToken: activePixel.accessToken,
            }
            
            console.log('[Kwai Config] ✅ Pixel carregado da API:', pixelConfig.pixelId)
            
            // Salvar no sessionStorage para cache
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('kwai_pixel_id', pixelConfig.pixelId)
              if (pixelConfig.accessToken) {
                sessionStorage.setItem('kwai_access_token', pixelConfig.accessToken)
              }
            }
            
            setConfig(pixelConfig)
          } else {
            console.warn('[Kwai Config] ⚠️ Nenhum pixel ativo encontrado na API')
            setError('Nenhum pixel configurado')
          }
        } else {
          // 3. Tentar usar do sessionStorage (cache)
          if (typeof window !== 'undefined') {
            const cachedPixelId = sessionStorage.getItem('kwai_pixel_id')
            const cachedAccessToken = sessionStorage.getItem('kwai_access_token')
            
            if (cachedPixelId) {
              console.log('[Kwai Config] 📦 Usando Pixel do cache:', cachedPixelId)
              setConfig({
                pixelId: cachedPixelId,
                accessToken: cachedAccessToken || undefined,
              })
            } else {
              console.warn('[Kwai Config] ⚠️ Nenhum pixel configurado no backend')
              setError('Nenhum pixel configurado')
            }
          }
        }
      } catch (err: any) {
        console.error('[Kwai Config] ❌ Erro ao buscar configuração:', err)
        
        // Fallback para sessionStorage em caso de erro
        if (typeof window !== 'undefined') {
          const cachedPixelId = sessionStorage.getItem('kwai_pixel_id')
          const cachedAccessToken = sessionStorage.getItem('kwai_access_token')
          
          if (cachedPixelId) {
            console.log('[Kwai Config] 📦 Usando Pixel do cache (fallback):', cachedPixelId)
            setConfig({
              pixelId: cachedPixelId,
              accessToken: cachedAccessToken || undefined,
            })
          } else {
            setError(err.message || 'Erro ao carregar configuração')
          }
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPixelConfig()
  }, [])

  return { config, loading, error }
}

