# Documentação do Kwai Pixel - Developer Mode

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Instalação](#instalação)
3. [Configuração](#configuração)
4. [Uso Básico](#uso-básico)
5. [Eventos Disponíveis](#eventos-disponíveis)
6. [Exemplos Práticos](#exemplos-práticos)
7. [Testes e Debug](#testes-e-debug)
8. [FAQ](#faq)

## 🎯 Visão Geral

O Kwai Pixel foi implementado em **Developer Mode** para permitir rastreamento flexível de eventos de conversão. Esta implementação permite:

- ✅ Rastreamento client-side de eventos
- ✅ Suporte a múltiplos pixels
- ✅ Rastreamento de atribuição via `clickid`
- ✅ Eventos customizados com propriedades
- ✅ Integração fácil com React/Next.js

## 📦 Instalação

O Kwai Pixel já está instalado e configurado no projeto. Os arquivos principais são:

```
casino-frontend/
├── components/tracker/
│   ├── kwaiPixel.tsx          # Componente do Pixel
│   └── KwaiTrackerExample.tsx # Exemplo de uso
├── lib/
│   ├── hooks/
│   │   └── useKwaiTracker.ts  # Hook para rastreamento
│   └── types/
│       └── kwai.ts            # Tipos TypeScript
└── app/
    └── layout.tsx             # Pixel já integrado
```

## ⚙️ Configuração

### 1. Via Parâmetros de URL

O pixel pode ser configurado via URL, permitindo diferentes pixels por campanha:

```
https://seusite.com?kwai_pixel=SEU_PIXEL_ID&clickid=ABC123&mmpcode=PL
```

**Parâmetros:**
- `kwai_pixel` ou `pixel_id`: ID do seu pixel Kwai
- `clickid` ou `kwai_clickid`: Click ID da campanha (para atribuição)
- `mmpcode` ou `kwai_mmpcode`: Código MMP (default: 'PL')

### 2. Via Props (Opcional)

```tsx
import { KwaiPixel } from '@/components/tracker/kwaiPixel'

export default function Layout({ children }) {
  return (
    <html>
      <body>
        <KwaiPixel pixelId="SEU_PIXEL_ID" />
        {children}
      </body>
    </html>
  )
}
```

### 3. Persistência na Sessão

Os parâmetros são salvos automaticamente no `sessionStorage`:
- `kwai_pixel_id`: ID do pixel
- `kwai_clickid`: Click ID da campanha
- `kwai_mmpcode`: Código MMP

## 🚀 Uso Básico

### Hook `useKwaiTracker`

```tsx
'use client'

import { useKwaiTracker } from '@/lib/hooks/useKwaiTracker'

export function MeuComponente() {
  const {
    trackPageView,
    trackInitiatedCheckout,
    trackPurchase,
    hasClickId,
  } = useKwaiTracker()

  // Rastrear visualização de página
  const handlePageView = () => {
    trackPageView({
      content_name: 'nome_da_pagina',
      content_type: 'tipo'
    })
  }

  // Rastrear início de checkout (modal de depósito)
  const handleOpenDeposit = (valor: number) => {
    trackInitiatedCheckout(valor, {
      content_type: 'deposit'
    })
  }

  // Rastrear compra/depósito concluído
  const handleDepositSuccess = (valor: number, transactionId: string) => {
    trackPurchase(valor, transactionId, {
      payment_method: 'pix'
    })
  }

  return (
    <div>
      {/* Seu componente */}
    </div>
  )
}
```

## 📊 Eventos Disponíveis

### 1. Content View (Page View)

Rastreia visualização de páginas ou conteúdos.

```typescript
trackPageView({
  content_name: 'pagina_inicial',
  content_type: 'home'
})
```

### 2. Initiated Checkout

Rastreia quando o usuário inicia o processo de checkout (ex: abre o modal de depósito).

```typescript
trackInitiatedCheckout(50, {
  content_type: 'deposit',
  content_name: 'modal_deposito'
})
```

### 3. Purchase

Rastreia compras/depósitos concluídos. **Evento mais importante para conversão!**

```typescript
trackPurchase(
  100,                    // Valor em BRL
  'TXN-123456',          // ID da transação
  {
    payment_method: 'pix',
    content_type: 'deposit'
  }
)
```

### 4. Add to Cart

Rastreia adições ao carrinho.

```typescript
trackAddToCart(50, 'PRODUCT-123', {
  content_name: 'nome_produto'
})
```

### 5. Complete Registration

Rastreia registro de novos usuários.

```typescript
trackCompleteRegistration({
  registration_method: 'email'
})
```

### 6. Evento Customizado

```typescript
track('nomeEvento', {
  propriedade1: 'valor1',
  propriedade2: 'valor2'
})
```

## 💡 Exemplos Práticos

### Exemplo 1: Componente de Depósito

```tsx
'use client'

import { useState } from 'react'
import { useKwaiTracker } from '@/lib/hooks/useKwaiTracker'

export function DepositModal() {
  const [valor, setValor] = useState(50)
  const { trackInitiatedCheckout, trackPurchase } = useKwaiTracker()

  const handleOpen = () => {
    // Rastrear abertura do modal
    trackInitiatedCheckout(valor)
  }

  const handleDepositSuccess = async (transactionId: string) => {
    // Processar depósito...
    
    // Rastrear conversão
    trackPurchase(valor, transactionId, {
      payment_method: 'pix',
      content_type: 'deposit'
    })
  }

  return (
    <div>
      <button onClick={handleOpen}>Depositar R$ {valor}</button>
    </div>
  )
}
```

### Exemplo 2: Página de Registro

```tsx
'use client'

import { useKwaiTracker } from '@/lib/hooks/useKwaiTracker'
import { useEffect } from 'react'

export function RegisterPage() {
  const { trackCompleteRegistration } = useKwaiTracker()

  const handleRegister = async (userData: any) => {
    // Processar registro...
    
    // Rastrear conversão de registro
    trackCompleteRegistration({
      registration_method: 'email',
      user_type: 'new'
    })
  }

  return (
    <form onSubmit={handleRegister}>
      {/* Formulário de registro */}
    </form>
  )
}
```

### Exemplo 3: Rastreamento de Página com useEffect

```tsx
'use client'

import { useEffect } from 'react'
import { useKwaiTracker } from '@/lib/hooks/useKwaiTracker'

export function GamePage({ gameId }: { gameId: string }) {
  const { trackPageView } = useKwaiTracker()

  useEffect(() => {
    // Rastrear visualização ao carregar a página
    trackPageView({
      content_name: `jogo_${gameId}`,
      content_type: 'game'
    })
  }, [gameId, trackPageView])

  return <div>{/* Conteúdo do jogo */}</div>
}
```

### Exemplo 4: Verificar Campanha Ativa

```tsx
'use client'

import { useKwaiTracker } from '@/lib/hooks/useKwaiTracker'
import { useEffect } from 'react'

export function PromoHeader() {
  const { hasClickId, getCampaignInfo } = useKwaiTracker()

  useEffect(() => {
    if (hasClickId()) {
      const info = getCampaignInfo()
      console.log('Usuário veio de campanha:', info)
      
      // Mostrar banner especial, bônus, etc.
    }
  }, [hasClickId, getCampaignInfo])

  return (
    <div>
      {hasClickId() && (
        <div className="promo-banner">
          🎉 Bem-vindo! Você tem bônus especial da campanha!
        </div>
      )}
    </div>
  )
}
```

## 🧪 Testes e Debug

### 1. Console do Navegador

Todos os eventos são logados no console:

```
[Kwai Pixel] Carregado: SEU_PIXEL_ID
[Kwai Pixel] Evento pageview disparado
[Kwai Tracker] Evento purchase disparado: { value: 100, currency: 'BRL', ... }
```

### 2. Kwai Pixel Helper (Chrome Extension)

Instale a extensão oficial do Kwai para verificar:
- ✅ Pixel carregado corretamente
- ✅ Eventos sendo disparados
- ✅ Parâmetros corretos

### 3. Verificar SessionStorage

```javascript
// No console do navegador
console.log(sessionStorage.getItem('kwai_pixel_id'))
console.log(sessionStorage.getItem('kwai_clickid'))
console.log(sessionStorage.getItem('kwai_mmpcode'))
```

### 4. Testar URL com Parâmetros

```
http://localhost:3006?kwai_pixel=SEU_PIXEL_ID&clickid=TEST123
```

### 5. Verificar Objeto Global

```javascript
// No console do navegador
console.log(window.kwaiq)
console.log(window.KwaiAnalyticsObject)
```

## ❓ FAQ

### Como obter meu Pixel ID?

1. Acesse o [Kwai for Business Manager](https://business.kwai.com)
2. Vá em Assets > Pixel
3. Clique em "Create Pixel"
4. Selecione "Developer Mode"
5. Copie o Pixel ID fornecido

### O pixel funciona sem clickid?

Sim! O pixel rastreia todos os eventos, mas eventos **sem clickid** não serão atribuídos a campanhas específicas.

### Como testar em desenvolvimento?

O pixel funciona em localhost. Para testar:

```bash
# Iniciar servidor
npm run dev

# Acessar com parâmetros
http://localhost:3006?kwai_pixel=SEU_PIXEL_ID&clickid=TEST123
```

### Quantos pixels posso ter?

Você pode usar múltiplos pixels. Cada campanha pode ter seu próprio pixel ID passado via URL.

### Os eventos são enviados em tempo real?

Sim! Os eventos são enviados imediatamente quando disparados via JavaScript.

### Como rastrear eventos server-side?

Para rastreamento server-side, você precisa:
1. `access_token` do pixel
2. Fazer requisições POST para `https://www.adsnebula.com/log/common/api`
3. Ver exemplo em PHP fornecido no código

### Como saber se minha conversão foi registrada?

Verifique:
1. Console do navegador (deve mostrar logs)
2. Kwai Pixel Helper extension
3. Kwai Business Manager > Events > Events Manager

### Qual a diferença entre `trackInitiatedCheckout` e `trackPurchase`?

- `trackInitiatedCheckout`: Usuário **iniciou** o processo (abriu modal)
- `trackPurchase`: Transação **concluída** (conversão confirmada) ✅

Sempre use `trackPurchase` para conversões reais!

## 📞 Suporte

- **Documentação Oficial**: [Kwai Pixel Docs](https://docs.qingque.cn/d/home/eZQDaewub9hw8vS2dHfz5OKl-)
- **Business Manager**: [business.kwai.com](https://business.kwai.com)
- **Pixel Helper**: [Chrome Web Store](https://chrome.google.com/webstore)

## 📝 Checklist de Implementação

- [x] Pixel instalado no layout
- [x] Hook `useKwaiTracker` criado
- [x] Tipos TypeScript definidos
- [x] Suporte a parâmetros de URL
- [x] Persistência em sessionStorage
- [ ] Testar com Pixel ID real
- [ ] Instalar Pixel Helper extension
- [ ] Implementar em componentes de conversão
- [ ] Testar eventos no Event Manager
- [ ] Documentar pixels por campanha

---

✅ **Implementação completa!** Agora você pode rastrear conversões do Kwai diretamente no seu frontend Next.js.

