# 🎯 Kwai Pixel - Instalação Completa

## ✅ Status: IMPLEMENTADO E PRONTO PARA USO

O Kwai Pixel foi implementado com sucesso no projeto casino-frontend em **Developer Mode**, permitindo rastreamento completo de conversões e eventos.

---

## 🚀 Início Rápido (2 Minutos)

### 1. O Pixel já está instalado no layout

```tsx
// app/layout.tsx
<KwaiPixel />
```

### 2. Configure via URL

Adicione o pixel ID na URL da sua campanha:

```
https://seusite.com?kwai_pixel=SEU_PIXEL_ID&clickid=ABC123
```

### 3. Use o Hook nos componentes

```tsx
'use client'

import { useKwaiTracker } from '@/lib/hooks/useKwaiTracker'

export function DepositModal() {
  const { trackPurchase } = useKwaiTracker()
  
  const handleSuccess = (valor: number, txId: string) => {
    trackPurchase(valor, txId) // 🔥 Rastrear conversão
  }
}
```

---

## 📚 Documentação

| Arquivo | Descrição |
|---------|-----------|
| **[KWAI-GUIA-RAPIDO.md](./KWAI-GUIA-RAPIDO.md)** | ⚡ Guia rápido (3 minutos) |
| **[KWAI-PIXEL-DOCS.md](./KWAI-PIXEL-DOCS.md)** | 📖 Documentação completa |
| **[KWAI-IMPLEMENTACAO.md](./KWAI-IMPLEMENTACAO.md)** | ✅ Detalhes da implementação |

---

## 🎯 Eventos Principais

### 🔥 Purchase (Conversão Principal)

```tsx
trackPurchase(100, 'TXN-123', {
  payment_method: 'pix'
})
```

### 💡 Initiated Checkout

```tsx
trackInitiatedCheckout(50)
```

### ✅ Complete Registration

```tsx
trackCompleteRegistration()
```

---

## 📦 Arquivos Criados

```
casino-frontend/
├── components/tracker/
│   ├── kwaiPixel.tsx              # Componente principal
│   └── KwaiTrackerExample.tsx     # Exemplo de uso
├── lib/
│   ├── hooks/
│   │   └── useKwaiTracker.ts      # Hook para eventos
│   ├── types/
│   │   └── kwai.ts                # Tipos TypeScript
│   └── kwai-server-api.ts         # API server-side
└── app/
    ├── layout.tsx                 # ✅ Integrado
    └── api/kwai-webhook/
        └── route.ts.example       # Exemplo API Route
```

---

## 🧪 Como Testar

### 1. Abrir Console do Navegador (F12)

Você deve ver:

```
[Kwai Pixel] Carregado: SEU_PIXEL_ID
[Kwai Pixel] Evento pageview disparado
```

### 2. Testar com URL

```
http://localhost:3006?kwai_pixel=TEST_ID&clickid=TEST123
```

### 3. Verificar SessionStorage

```javascript
sessionStorage.getItem('kwai_pixel_id')
sessionStorage.getItem('kwai_clickid')
```

---

## 🎨 API do Hook

```typescript
const {
  // 🎯 Eventos Principais
  trackPurchase,              // Depósito/compra
  trackInitiatedCheckout,     // Abrir modal
  trackCompleteRegistration,  // Registro
  trackPageView,              // Page view
  trackAddToCart,             // Carrinho
  
  // 🛠️ Utilidades
  track,              // Evento customizado
  isKwaiLoaded,       // Verificar se carregou
  hasClickId,         // Verificar campanha
  getCampaignInfo,    // Info da campanha
} = useKwaiTracker()
```

---

## 📋 Checklist para Produção

- [ ] Obter Pixel ID no [Kwai Business Manager](https://business.kwai.com)
- [ ] Testar com `?kwai_pixel=SEU_ID` na URL
- [ ] Implementar `trackPurchase` no sucesso do depósito
- [ ] Implementar `trackInitiatedCheckout` ao abrir modal
- [ ] Implementar `trackCompleteRegistration` no registro
- [ ] Instalar [Kwai Pixel Helper](https://chrome.google.com/webstore) (Chrome)
- [ ] Validar eventos no Event Manager
- [ ] Testar com clickid real de campanha

---

## 🔥 Exemplo Completo - Modal de Depósito

```tsx
'use client'

import { useState } from 'react'
import { useKwaiTracker } from '@/lib/hooks/useKwaiTracker'
import api from '@/lib/api'

export function DepositModal() {
  const [valor, setValor] = useState(50)
  const { trackInitiatedCheckout, trackPurchase } = useKwaiTracker()

  const handleOpen = () => {
    // ⚠️ Rastrear abertura do modal
    trackInitiatedCheckout(valor)
  }

  const handleConfirm = async () => {
    const response = await api.post('/deposits', { valor })
    const { transaction_id } = response.data
    
    // 🔥 RASTREAR CONVERSÃO
    trackPurchase(valor, transaction_id, {
      payment_method: 'pix'
    })
  }

  return (
    <button onClick={handleOpen}>
      Depositar R$ {valor}
    </button>
  )
}
```

---

## 🆘 Troubleshooting

### ❌ Eventos não aparecem no console

```javascript
// Verificar se carregou
window.kwaiq
```

### ❌ Pixel não carrega

Adicione o pixel ID na URL:
```
?kwai_pixel=SEU_PIXEL_ID
```

### ❌ ClickID não persiste

```javascript
// Verificar sessionStorage
sessionStorage.getItem('kwai_clickid')
```

---

## 📞 Suporte

- **Docs Oficiais**: https://docs.qingque.cn/d/home/eZQDaewub9hw8vS2dHfz5OKl-
- **Business Manager**: https://business.kwai.com
- **Pixel Helper**: Chrome Web Store

---

## 🎉 Pronto para Uso!

✅ Implementação completa  
✅ Documentação detalhada  
✅ Exemplos de código  
✅ Suporte TypeScript  
✅ Client-side + Server-side  

**Próximo passo**: Obter seu Pixel ID e começar a rastrear conversões! 🚀

👉 **Leia o [KWAI-GUIA-RAPIDO.md](./KWAI-GUIA-RAPIDO.md) para começar agora!**


