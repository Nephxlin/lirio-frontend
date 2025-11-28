/**
 * Kwai Pixel - Server-Side API Integration
 * 
 * Este arquivo contém funções para enviar eventos para a API do Kwai
 * via server-side (Node.js/Next.js API Routes)
 * 
 * ⚠️ IMPORTANTE: Este código deve ser executado apenas no servidor (API Routes)
 * não no cliente, pois usa o access_token que deve ser mantido em segredo.
 */

import { KwaiEventName, KwaiServerEventPayload, KwaiApiResponse } from './types/kwai'

/**
 * Configuração da API do Kwai
 */
const KWAI_API_URL = 'https://www.adsnebula.com/log/common/api'
const KWAI_SDK_VERSION = '9.9.9'

/**
 * Interface para configuração do pixel no servidor
 */
export interface ServerKwaiPixelConfig {
  pixel_id: string
  access_token: string
}

/**
 * Interface para dados do evento
 */
export interface ServerEventData {
  event_name: KwaiEventName
  properties?: Record<string, any>
  clickid?: string
  mmpcode?: string
  user_agent?: string
  ip_address?: string
}

/**
 * Envia evento para a API do Kwai (Server-Side)
 * 
 * @param config Configuração do pixel (pixel_id e access_token)
 * @param data Dados do evento
 * @returns Promise com a resposta da API
 * 
 * @example
 * ```typescript
 * // Em uma API Route do Next.js
 * import { sendKwaiEvent } from '@/lib/kwai-server-api'
 * 
 * export async function POST(request: Request) {
 *   const { valor, transaction_id } = await request.json()
 *   
 *   await sendKwaiEvent(
 *     { 
 *       pixel_id: 'SEU_PIXEL_ID',
 *       access_token: 'SEU_ACCESS_TOKEN'
 *     },
 *     {
 *       event_name: 'EVENT_PURCHASE',
 *       properties: {
 *         value: valor,
 *         currency: 'BRL',
 *         transaction_id
 *       },
 *       clickid: request.headers.get('x-kwai-clickid')
 *     }
 *   )
 *   
 *   return Response.json({ success: true })
 * }
 * ```
 */
export async function sendKwaiEvent(
  config: ServerKwaiPixelConfig,
  data: ServerEventData
): Promise<KwaiApiResponse> {
  try {
    // Determinar se o evento é atribuído (tem clickid)
    const isAttributed = data.clickid ? 1 : 0

    // Preparar properties como STRING JSON (conforme documentação Kwai)
    const propertiesString = JSON.stringify(data.properties || {})

    // Preparar payload conforme documentação Kwai
    const payload: KwaiServerEventPayload = {
      access_token: config.access_token,
      callback: '',
      clickid: data.clickid || '',
      event_name: data.event_name,
      is_attributed: isAttributed,
      mmpcode: data.mmpcode || 'PL',
      pixelId: config.pixel_id,
      pixelSdkVersion: KWAI_SDK_VERSION,
      properties: propertiesString,
      testFlag: process.env.NODE_ENV !== 'production',
      third_party: 'website',
      trackFlag: true,
    }

    console.log('[Kwai Server API] Enviando evento:', {
      event_name: data.event_name,
      pixel_id: config.pixel_id,
      is_attributed: isAttributed,
    })

    // Enviar requisição para a API do Kwai
    const response = await fetch(KWAI_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json;charset=utf-8',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const result = await response.json() as KwaiApiResponse

    if (!response.ok) {
      console.error('[Kwai Server API] Erro na resposta:', result)
      throw new Error(`Kwai API Error: ${response.status} - ${result.message || 'Unknown error'}`)
    }

    console.log('[Kwai Server API] Evento enviado com sucesso:', result)
    return result

  } catch (error) {
    console.error('[Kwai Server API] Erro ao enviar evento:', error)
    throw error
  }
}

/**
 * Envia evento de compra/depósito (Server-Side)
 * 
 * @example
 * ```typescript
 * await sendPurchaseEvent(
 *   { pixel_id: 'XXX', access_token: 'YYY' },
 *   {
 *     value: 100,
 *     transaction_id: 'TXN-123',
 *     clickid: 'ABC123'
 *   }
 * )
 * ```
 */
export async function sendPurchaseEvent(
  config: ServerKwaiPixelConfig,
  data: {
    value: number
    transaction_id: string
    clickid?: string
    mmpcode?: string
    payment_method?: string
  }
): Promise<KwaiApiResponse> {
  return sendKwaiEvent(config, {
    event_name: KwaiEventName.PURCHASE,
    properties: {
      value: data.value,
      currency: 'BRL',
      transaction_id: data.transaction_id,
      content_type: 'deposit',
      ...(data.payment_method && { payment_method: data.payment_method }),
    },
    clickid: data.clickid,
    mmpcode: data.mmpcode,
  })
}

/**
 * Envia evento de checkout iniciado (Server-Side)
 */
export async function sendInitiatedCheckoutEvent(
  config: ServerKwaiPixelConfig,
  data: {
    value: number
    clickid?: string
    mmpcode?: string
  }
): Promise<KwaiApiResponse> {
  return sendKwaiEvent(config, {
    event_name: KwaiEventName.INITIATED_CHECKOUT,
    properties: {
      value: data.value,
      currency: 'BRL',
      content_type: 'deposit',
    },
    clickid: data.clickid,
    mmpcode: data.mmpcode,
  })
}

/**
 * Envia evento de registro completo (Server-Side)
 */
export async function sendCompleteRegistrationEvent(
  config: ServerKwaiPixelConfig,
  data: {
    clickid?: string
    mmpcode?: string
    registration_method?: string
  }
): Promise<KwaiApiResponse> {
  return sendKwaiEvent(config, {
    event_name: KwaiEventName.COMPLETE_REGISTRATION,
    properties: {
      content_type: 'user_registration',
      ...(data.registration_method && { registration_method: data.registration_method }),
    },
    clickid: data.clickid,
    mmpcode: data.mmpcode,
  })
}

/**
 * Busca configurações de pixels do banco de dados
 * 
 * Esta função deve ser implementada de acordo com seu backend
 * 
 * @example
 * ```typescript
 * // Implementação de exemplo com Prisma
 * export async function getKwaiPixels() {
 *   const pixels = await prisma.kwaiPixel.findMany({
 *     where: { access_token: { not: null } }
 *   })
 *   
 *   return pixels.map(p => ({
 *     pixel_id: p.pixel_id,
 *     access_token: p.access_token
 *   }))
 * }
 * ```
 */
export async function getKwaiPixelsFromDatabase(): Promise<ServerKwaiPixelConfig[]> {
  // TODO: Implementar busca no banco de dados
  // Esta é apenas uma função de exemplo
  
  console.warn('[Kwai Server API] getKwaiPixelsFromDatabase não implementada')
  return []
}

/**
 * Envia evento para múltiplos pixels
 * 
 * Útil quando você tem vários pixels configurados e quer enviar
 * o mesmo evento para todos eles
 */
export async function sendEventToAllPixels(
  data: ServerEventData
): Promise<Array<{ pixel_id: string; success: boolean; error?: string }>> {
  const pixels = await getKwaiPixelsFromDatabase()
  
  const results = await Promise.allSettled(
    pixels.map(async (pixel) => {
      try {
        await sendKwaiEvent(pixel, data)
        return { pixel_id: pixel.pixel_id, success: true }
      } catch (error) {
        return {
          pixel_id: pixel.pixel_id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    })
  )

  return results.map((result) =>
    result.status === 'fulfilled' ? result.value : { pixel_id: 'unknown', success: false, error: 'Promise rejected' }
  )
}


