'use client'

import { useKwaiTracker } from '@/lib/hooks/useKwaiTracker'
import { useEffect } from 'react'

/**
 * Exemplo de Componente usando o Kwai Tracker
 * 
 * Este é um exemplo de como usar o hook useKwaiTracker
 * para rastrear eventos de conversão no Kwai Pixel
 */
export function KwaiTrackerExample() {
  const {
    trackPageView,
    trackInitiatedCheckout,
    trackPurchase,
    trackAddToCart,
    trackCompleteRegistration,
    hasClickId,
    getCampaignInfo,
  } = useKwaiTracker()

  // Exemplo 1: Rastrear visualização de página ao montar o componente
  useEffect(() => {
    trackPageView({
      content_name: 'página_inicial',
      content_type: 'home',
    })
  }, [trackPageView])

  // Exemplo 2: Rastrear abertura do modal de depósito
  const handleOpenDepositModal = (amount: number) => {
    trackInitiatedCheckout(amount, {
      content_name: 'modal_deposito',
      content_type: 'deposit',
    })
  }

  // Exemplo 3: Rastrear depósito concluído
  const handleDepositSuccess = (amount: number, transactionId: string) => {
    trackPurchase(amount, transactionId, {
      content_name: 'deposito_concluido',
      payment_method: 'pix',
    })
  }

  // Exemplo 4: Rastrear registro de usuário
  const handleUserRegistration = () => {
    trackCompleteRegistration({
      content_name: 'novo_usuario',
      registration_method: 'email',
    })
  }

  // Exemplo 5: Verificar se tem campanha ativa
  useEffect(() => {
    if (hasClickId()) {
      const campaignInfo = getCampaignInfo()
      console.log('Usuário veio de campanha Kwai:', campaignInfo)
    }
  }, [hasClickId, getCampaignInfo])

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Exemplos de Rastreamento Kwai</h2>
      
      <div className="space-y-2">
        <button
          onClick={() => handleOpenDepositModal(50)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Abrir Modal de Depósito (R$ 50)
        </button>

        <button
          onClick={() => handleDepositSuccess(50, 'TXN-' + Date.now())}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Simular Depósito Concluído
        </button>

        <button
          onClick={handleUserRegistration}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Registrar Usuário
        </button>
      </div>

      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p className="text-sm">
          <strong>Campanha Ativa:</strong>{' '}
          {hasClickId() ? 'Sim ✅' : 'Não ❌'}
        </p>
        {hasClickId() && (
          <pre className="mt-2 text-xs">
            {JSON.stringify(getCampaignInfo(), null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}

export default KwaiTrackerExample

