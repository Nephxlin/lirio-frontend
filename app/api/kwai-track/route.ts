/**
 * API Route para enviar eventos Kwai Pixel
 * 
 * POST /api/kwai-track
 */

import { NextRequest, NextResponse } from 'next/server'
import { KwaiTrackPayload, KwaiTrackResponse } from '@/types/kwai'

/**
 * Endpoint da API Kwai
 */
const KWAI_API_URL = 'https://www.adsnebula.com/log/common/api'

/**
 * Timeout para requisições em milissegundos
 */
const REQUEST_TIMEOUT = 10000 // 10 segundos

/**
 * Número máximo de tentativas em caso de falha
 */
const MAX_RETRIES = 2

/**
 * Faz requisição para a API do Kwai com timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

/**
 * Envia evento para a API do Kwai com retry
 */
async function sendToKwai(
  payload: KwaiTrackPayload,
  retryCount: number = 0
): Promise<KwaiTrackResponse> {
  try {
    const response = await fetchWithTimeout(
      KWAI_API_URL,
      {
        method: 'POST',
        headers: {
          'accept': 'application/json;charset=utf-8',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
      REQUEST_TIMEOUT
    )

    const data = await response.json()

    // Log para debug
    if (process.env.NODE_ENV === 'development') {
      console.log('[Kwai Track API] 📤 Resposta:', {
        status: response.status,
        data,
        pixelId: payload.pixelId,
        event: payload.event_name,
      })
    }

    return data as KwaiTrackResponse
  } catch (error: any) {
    // Retry em caso de erro de rede
    if (retryCount < MAX_RETRIES) {
      console.log(`[Kwai Track API] 🔄 Tentativa ${retryCount + 1}/${MAX_RETRIES}...`)
      
      // Aguardar antes de tentar novamente (backoff exponencial)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
      
      return sendToKwai(payload, retryCount + 1)
    }

    // Se todas as tentativas falharem, lançar erro
    throw new Error(
      error.name === 'AbortError' 
        ? 'Timeout ao enviar evento para Kwai' 
        : error.message || 'Erro ao enviar evento para Kwai'
    )
  }
}

/**
 * POST /api/kwai-track
 * 
 * Recebe evento do frontend e envia para API do Kwai
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse do body
    const body = await request.json()

    // Validar campos obrigatórios
    const requiredFields = [
      'access_token',
      'clickid',
      'event_name',
      'pixelId',
      'mmpcode',
    ]

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Campo obrigatório ausente: ${field}`,
          },
          { status: 400 }
        )
      }
    }

    // Construir payload conforme especificação Kwai
    const payload: KwaiTrackPayload = {
      access_token: body.access_token,
      callback: body.callback || '',
      clickid: body.clickid,
      event_name: body.event_name,
      is_attributed: body.clickid ? 1 : 0,
      mmpcode: body.mmpcode || 'PL',
      pixelId: body.pixelId,
      pixelSdkVersion: '9.9.9', // Conforme especificação
      properties: body.properties || '{}',
      testFlag: body.testFlag || false,
      third_party: 'website', // Conforme especificação
      trackFlag: true, // Conforme especificação
    }

    // Log em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('[Kwai Track API] 📤 Enviando evento:', {
        pixelId: payload.pixelId,
        event: payload.event_name,
        clickid: payload.clickid,
        properties: payload.properties,
      })
    }

    // Enviar para API do Kwai
    const response = await sendToKwai(payload)

    const duration = Date.now() - startTime

    // Log de sucesso
    if (process.env.NODE_ENV === 'development') {
      console.log('[Kwai Track API] ✅ Evento enviado com sucesso:', {
        pixelId: payload.pixelId,
        event: payload.event_name,
        result: response.result,
        duration: `${duration}ms`,
      })
    }

    // Verificar resultado
    if (response.result === 0 || response.result === 1) {
      // 0 = sucesso, 1 = teste
      return NextResponse.json({
        success: true,
        result: response.result,
        message: response.result === 1 ? 'Evento de teste enviado' : 'Evento enviado',
        duration,
      })
    } else {
      // Outro resultado = erro
      console.error('[Kwai Track API] ❌ Erro na resposta:', response)
      
      return NextResponse.json(
        {
          success: false,
          error: response.error_msg || 'Erro ao processar evento',
          result: response.result,
        },
        { status: 400 }
      )
    }
  } catch (error: any) {
    const duration = Date.now() - startTime

    console.error('[Kwai Track API] ❌ Erro ao enviar evento:', {
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`,
    })

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro interno ao enviar evento',
        duration,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/kwai-track
 * 
 * Health check
 */
export async function GET() {
  return NextResponse.json({
    service: 'Kwai Pixel Tracking API',
    status: 'online',
    endpoint: KWAI_API_URL,
    timeout: `${REQUEST_TIMEOUT}ms`,
    maxRetries: MAX_RETRIES,
  })
}

