/**
 * Tipos e Interfaces para Kwai Pixel Tracking
 */

// Tipos de eventos suportados pelo Kwai Pixel
export type KwaiEvent =
  | 'EVENT_CONTENT_VIEW'
  | 'EVENT_PURCHASE'
  | 'EVENT_ADD_CART'
  | 'EVENT_INITIATED_CHECKOUT'
  | 'EVENT_BUTTON_CLICK'
  | 'EVENT_COMPLETE_REGISTRATION'
  | 'EVENT_PURCHASE_1_DAY'
  | 'EVENT_PURCHASE_2_DAY'
  | 'EVENT_PURCHASE_3_DAY'
  | 'EVENT_PURCHASE_7_DAY'

// Configuração do Pixel Kwai
export interface KwaiPixelConfig {
  pixelId: string
  accessToken: string
  mmpcode?: string
  testFlag?: boolean
}

// Propriedades do evento
export interface KwaiEventProperties {
  content_name?: string
  content_type?: string
  value?: number
  currency?: string
  order_id?: string
  transaction_id?: string
  payment_method?: string
  [key: string]: any
}

// Dados do evento para tracking
export interface KwaiEventData {
  eventName: KwaiEvent
  properties?: KwaiEventProperties
}

// Payload completo enviado para a API do Kwai
export interface KwaiTrackPayload {
  access_token: string
  callback: string
  clickid: string
  event_name: KwaiEvent
  is_attributed: number
  mmpcode: string
  pixelId: string
  pixelSdkVersion: string
  properties: string // JSON stringified
  testFlag: boolean
  third_party: string
  trackFlag: boolean
}

// Resposta da API do Kwai
export interface KwaiTrackResponse {
  result: number // 0 = sucesso, 1 = teste, outros = erro
  error_msg?: string
  message?: string
}

// Configuração de um pixel (como retornado do backend)
export interface KwaiPixelData {
  id: number
  pixelId: string
  accessToken: string | null
  name?: string | null
}

// Informações de sessão do usuário
export interface KwaiSessionInfo {
  clickid: string | null
  mmpcode: string | null
}

// Opções para o hook useKwaiPixel
export interface UseKwaiPixelOptions {
  debug?: boolean
  autoCapture?: boolean // Capturar clickid/mmpcode automaticamente da URL
}

// Resultado do envio de evento
export interface KwaiTrackResult {
  success: boolean
  pixelId: string
  error?: string
}

