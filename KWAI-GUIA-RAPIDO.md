# Guia Rápido - Kwai Pixel

## 🚀 Início Rápido (3 Minutos)

### 1️⃣ O Pixel já está instalado!

O Kwai Pixel já foi instalado no `app/layout.tsx` e está ativo. ✅

### 2️⃣ Configure via URL

Adicione os parâmetros na URL da sua campanha:

```
https://seusite.com?kwai_pixel=SEU_PIXEL_ID&clickid=ABC123
```

### 3️⃣ Use o Hook nos seus componentes

```tsx
'use client'

import { useKwaiTracker } from '@/lib/hooks/useKwaiTracker'

export function MeuComponente() {
  const { trackPurchase } = useKwaiTracker()
  
  const handleDepositSuccess = (valor: number, transactionId: string) => {
    trackPurchase(valor, transactionId)
  }
  
  return <button onClick={() => handleDepositSuccess(100, 'TXN-123')}>
    Depositar
  </button>
}
```

## 📋 Principais Eventos

### 1. Depósito Concluído (MAIS IMPORTANTE ⭐)

```tsx
trackPurchase(100, 'TRANSACTION-ID', {
  payment_method: 'pix'
})
```

### 2. Abriu Modal de Depósito

```tsx
trackInitiatedCheckout(50)
```

### 3. Usuário se Registrou

```tsx
trackCompleteRegistration()
```

### 4. Visualizou Página

```tsx
trackPageView({ content_name: 'home' })
```

## 🎯 Onde Implementar

### ✅ Modal de Depósito

```tsx
// Quando ABRE o modal
trackInitiatedCheckout(valor)

// Quando o depósito É CONFIRMADO
trackPurchase(valor, transactionId)
```

### ✅ Registro de Usuário

```tsx
// Após registro bem-sucedido
trackCompleteRegistration()
```

### ✅ Páginas Importantes

```tsx
useEffect(() => {
  trackPageView({ content_name: 'nome_da_pagina' })
}, [])
```

## 🧪 Como Testar

### 1. Console do Navegador

Abra o DevTools (F12) e veja os logs:

```
[Kwai Pixel] Carregado: SEU_PIXEL_ID
[Kwai Tracker] Evento purchase disparado
```

### 2. URL de Teste

```
http://localhost:3006?kwai_pixel=SEU_PIXEL_ID&clickid=TEST123
```

### 3. Verificar SessionStorage

```javascript
// No console
sessionStorage.getItem('kwai_pixel_id')
sessionStorage.getItem('kwai_clickid')
```

## ⚡ Exemplo Completo - Modal de Depósito

```tsx
'use client'

import { useState } from 'react'
import { useKwaiTracker } from '@/lib/hooks/useKwaiTracker'
import api from '@/lib/api'

export function DepositModal() {
  const [valor, setValor] = useState(50)
  const [isOpen, setIsOpen] = useState(false)
  const { trackInitiatedCheckout, trackPurchase } = useKwaiTracker()

  // Quando ABRE o modal
  const handleOpen = () => {
    setIsOpen(true)
    trackInitiatedCheckout(valor) // ✅ Rastrear início
  }

  // Quando CONFIRMA o depósito
  const handleConfirm = async () => {
    try {
      const response = await api.post('/deposits', { valor })
      const { transaction_id } = response.data
      
      // ✅ RASTREAR CONVERSÃO
      trackPurchase(valor, transaction_id, {
        payment_method: 'pix'
      })
      
      setIsOpen(false)
    } catch (error) {
      console.error('Erro ao depositar:', error)
    }
  }

  return (
    <>
      <button onClick={handleOpen}>
        Depositar R$ {valor}
      </button>
      
      {isOpen && (
        <div className="modal">
          <h2>Confirmar Depósito</h2>
          <p>Valor: R$ {valor}</p>
          <button onClick={handleConfirm}>Confirmar</button>
        </div>
      )}
    </>
  )
}
```

## 🎨 API Completa do Hook

```typescript
const {
  // Eventos
  trackPageView,
  trackInitiatedCheckout,
  trackPurchase,
  trackAddToCart,
  trackCompleteRegistration,
  track, // Evento customizado
  
  // Utilidades
  isKwaiLoaded,      // Verifica se está carregado
  hasClickId,        // Verifica se tem campanha
  getCampaignInfo,   // Pega info da campanha
} = useKwaiTracker()
```

## 📊 Prioridades de Implementação

1. **🔥 CRÍTICO**: `trackPurchase` no sucesso do depósito
2. **⚠️ IMPORTANTE**: `trackInitiatedCheckout` ao abrir modal
3. **✅ RECOMENDADO**: `trackCompleteRegistration` no registro
4. **💡 OPCIONAL**: `trackPageView` em páginas importantes

## 🔍 Troubleshooting Rápido

### ❌ Eventos não aparecem no console

```bash
# Verifique se o pixel foi carregado
window.kwaiq
```

### ❌ Pixel não carrega

```bash
# Verifique os parâmetros da URL
?kwai_pixel=SEU_PIXEL_ID
```

### ❌ Clickid não persiste

```javascript
// Verifique o sessionStorage
sessionStorage.getItem('kwai_clickid')
```

## 📚 Documentação Completa

Para mais detalhes, veja: `KWAI-PIXEL-DOCS.md`

## ✅ Checklist Rápido

- [ ] Obtive meu Pixel ID no Kwai Business Manager
- [ ] Testei a URL com `?kwai_pixel=MEU_ID`
- [ ] Implementei `trackPurchase` no sucesso do depósito
- [ ] Implementei `trackInitiatedCheckout` ao abrir modal
- [ ] Testei no console do navegador
- [ ] Instalei o Kwai Pixel Helper (Chrome)

---

**🎉 Pronto! Agora você está rastreando conversões do Kwai!**

Para dúvidas, veja a documentação completa em `KWAI-PIXEL-DOCS.md`

