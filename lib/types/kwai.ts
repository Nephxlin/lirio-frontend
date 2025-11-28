/**
 * Tipos TypeScript para Kwai Pixel
 */

// Eventos suportados pela API do Kwai
export enum KwaiEventName {
  CONTENT_VIEW = 'EVENT_CONTENT_VIEW',
  INITIATED_CHECKOUT = 'EVENT_INITIATED_CHECKOUT',
  PURCHASE = 'EVENT_PURCHASE',
  ADD_TO_CART = 'EVENT_ADD_TO_CART',
  SEARCH = 'EVENT_SEARCH',
  COMPLETE_REGISTRATION = 'EVENT_COMPLETE_REGISTRATION',
}

// Estrutura do payload para API Server-Side
export interface KwaiServerEventPayload {
  access_token: string      // Token de acesso do pixel
  callback?: string         // URL de callback (opcional)
  clickid?: string          // Click ID da campanha
  event_name: KwaiEventName // Nome do evento
  is_attributed: number     // 1 se tem clickid, 0 caso contrário
  mmpcode?: string          // Código MMP (default: 'PL')
  pixelId: string           // ID do pixel
  pixelSdkVersion: string   // Versão do SDK (ex: '9.9.9')
  properties: string        // JSON string com propriedades do evento
  testFlag: boolean         // Flag de teste (true em desenvolvimento)
  third_party: string       // Origem (ex: 'website')
  trackFlag: boolean        // Se deve rastrear (default: true)
}

// Propriedades específicas por tipo de evento
export interface ContentViewProperties {
  content_name?: string
  content_type?: string
  [key: string]: any
}

export interface InitiatedCheckoutProperties {
  value: number
  currency: string
  content_type?: string
  [key: string]: any
}

export interface PurchaseProperties {
  value: number
  currency: string
  content_id?: string
  transaction_id?: string
  [key: string]: any
}

export interface AddToCartProperties {
  value: number
  currency: string
  content_id?: string
  [key: string]: any
}

// Configuração do Pixel
export interface KwaiPixelConfig {
  pixel_id: string
  access_token?: string  // Para chamadas server-side
}

// Resposta da API do Kwai
export interface KwaiApiResponse {
  code?: number
  message?: string
  data?: any
}

