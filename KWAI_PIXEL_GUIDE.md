# Guia de Uso - Kwai Pixel Tracking

Sistema completo de tracking de eventos do Kwai Pixel para Next.js usando API REST direta.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Configuração Inicial](#configuração-inicial)
- [Como Usar](#como-usar)
- [Eventos Disponíveis](#eventos-disponíveis)
- [Exemplos Práticos](#exemplos-práticos)
- [Debug](#debug)
- [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

Este sistema implementa tracking de eventos Kwai Pixel através de requisições diretas para a API REST do Kwai (`https://www.adsnebula.com/log/common/api`), substituindo a implementação anterior baseada em SDK JavaScript.

### Características

- ✅ Envio para **múltiplos pixels** simultaneamente
- ✅ Captura automática de `clickid` e `mmpcode` da URL
- ✅ Armazenamento em cookies (30 dias)
- ✅ Retry automático em caso de falha
- ✅ Timeout de 10 segundos
- ✅ Painel de debug em desenvolvimento
- ✅ TypeScript completo
- ✅ Não bloqueia a UI

## ⚙️ Configuração Inicial

### 1. Backend - Configurar Pixels

Acesse o painel admin e configure os pixels Kwai em:

```
GET /admin/kwai-pixels
POST /admin/kwai-pixels
```

**Dados necessários:**
- `pixelId`: ID do pixel Kwai
- `accessToken`: Token de acesso da API Kwai
- `name`: Nome descritivo (opcional)
- `isActive`: true/false

### 2. Frontend - Já Está Configurado

O sistema já está integrado no `ClientLayout.tsx`:

```typescript
<KwaiPixelProvider>
  <Providers>
    <KwaiClickIdCapture />
    <KwaiDebugPanel />
    {children}
  </Providers>
</KwaiPixelProvider>
```

## 🚀 Como Usar

### Importar o Hook

```typescript
import { useKwaiPixelContext } from '@/contexts/KwaiPixelContext'
```

### Usar no Componente

```typescript
function MeuComponente() {
  const { trackEvent, trackPurchase, trackPageView } = useKwaiPixelContext()
  
  // ... seu código
}
```

## 📊 Eventos Disponíveis

### 1. Visualização de Conteúdo

```typescript
await trackPageView('nome_da_pagina', 'page')

// Exemplos
await trackPageView('home', 'page')
await trackPageView('product_details', 'product')
```

### 2. Registro Completo

```typescript
await trackRegistration()
```

### 3. Início de Checkout

```typescript
await trackCheckout(valor, transactionId?, moeda?)

// Exemplo
await trackCheckout(100.50, 'TXN-123', 'BRL')
```

### 4. Compra Completa

```typescript
await trackPurchase(valor, orderId, moeda?, paymentMethod?)

// Exemplo
await trackPurchase(250.00, 'ORDER-456', 'BRL', 'pix')
```

### 5. Adicionar ao Carrinho

```typescript
await trackAddToCart(valor, moeda?)

// Exemplo
await trackAddToCart(50.00, 'BRL')
```

### 6. Clique em Botão

```typescript
await trackButtonClick('nome_do_botao')

// Exemplo
await trackButtonClick('depositar_agora')
```

### 7. Eventos de Re-compra

```typescript
await trackRepurchase(dias, valor?, moeda?)

// Exemplos
await trackRepurchase(1, 100.00, 'BRL')  // 1 dia
await trackRepurchase(2, 200.00, 'BRL')  // 2 dias
await trackRepurchase(3, 150.00, 'BRL')  // 3 dias
await trackRepurchase(7, 300.00, 'BRL')  // 7 dias
```

### 8. Evento Genérico

```typescript
await trackEvent('EVENT_CONTENT_VIEW', {
  content_name: 'test',
  content_type: 'page',
  custom_prop: 'valor'
})
```

## 💡 Exemplos Práticos

### Exemplo 1: Tracking em Página

```typescript
'use client'

import { useEffect } from 'react'
import { useKwaiPixelContext } from '@/contexts/KwaiPixelContext'

export default function HomePage() {
  const { trackPageView } = useKwaiPixelContext()
  
  useEffect(() => {
    trackPageView('home', 'page')
  }, [trackPageView])
  
  return <div>...</div>
}
```

### Exemplo 2: Tracking de Compra

```typescript
'use client'

import { useKwaiPixelContext } from '@/contexts/KwaiPixelContext'

export function CheckoutButton({ amount, orderId }: Props) {
  const { trackPurchase } = useKwaiPixelContext()
  
  const handleCheckout = async () => {
    try {
      // Processar pagamento...
      await processPayment()
      
      // Rastrear compra
      await trackPurchase(amount, orderId, 'BRL', 'pix')
      
      // Sucesso!
    } catch (error) {
      // Tratar erro
    }
  }
  
  return <button onClick={handleCheckout}>Finalizar Compra</button>
}
```

### Exemplo 3: Tracking de Registro

```typescript
const handleRegister = async (data: RegisterData) => {
  const { trackRegistration } = useKwaiPixelContext()
  
  try {
    // Registrar usuário
    await registerUser(data)
    
    // Rastrear registro
    await trackRegistration()
    
    // Redirecionar
    router.push('/home')
  } catch (error) {
    // Tratar erro
  }
}
```

## 🐛 Debug

### Painel de Debug (Desenvolvimento)

O painel de debug aparece automaticamente em modo desenvolvimento. Clique no botão 🎯 no canto inferior direito.

**Informações exibidas:**
- Status do sistema (Pronto/Carregando/Erro)
- Lista de pixels ativos
- ClickID e MMP Code capturados
- Botão para testar eventos

### URL de Teste

Para testar, adicione parâmetros na URL:

```
http://localhost:3006/home?test_clickid=TESTE123&mmpcode=BR
```

Parâmetros suportados:
- `clickid`
- `click_id`
- `kwai_clickid`
- `test_clickid` (para testes)
- `mmpcode`
- `mmp_code`
- `kwai_mmpcode`

### Logs no Console

Em desenvolvimento, todos os eventos são logados:

```
[useKwaiPixel] 📊 Rastreando evento: { event: 'EVENT_CONTENT_VIEW', ... }
[useKwaiPixel] ✅ Pixel 12345: Evento EVENT_CONTENT_VIEW enviado
[Kwai Track API] 📤 Enviando evento: { pixelId: '12345', ... }
```

## 🔧 Troubleshooting

### ❌ Erro: "clickid não encontrado"

**Causa:** Usuário não veio de anúncio Kwai.

**Solução:** 
- Para testes, use `?test_clickid=TESTE123` na URL
- Em produção, apenas usuários de anúncios Kwai terão clickid

### ❌ Erro: "Nenhum pixel configurado"

**Causa:** Nenhum pixel ativo no backend.

**Solução:**
1. Acesse o admin: `/admin/kwai-pixels`
2. Crie um novo pixel com `pixelId` e `accessToken`
3. Certifique-se que `isActive = true`

### ❌ Erro: "accessToken não configurado"

**Causa:** Pixel criado sem `accessToken`.

**Solução:**
1. Acesse `/admin/kwai-pixels/:id`
2. Edite o pixel e adicione o `accessToken`

### ❌ Erro: "Timeout ao enviar evento"

**Causa:** API do Kwai não respondeu em 10 segundos.

**Solução:**
- O sistema automaticamente tenta até 2x
- Se persistir, verifique conexão com internet

### ⚠️ Evento não aparece no painel Kwai

**Possíveis causas:**
1. ClickID inválido ou não capturado
2. Pixel ID incorreto
3. Access Token inválido
4. Evento em modo teste (`testFlag: true`)

**Debug:**
1. Abra o painel de debug (botão 🎯)
2. Verifique se ClickID está capturado
3. Verifique se pixels estão carregados
4. Clique em "Enviar Evento Teste"
5. Verifique logs do console

## 📚 Estrutura de Arquivos

```
casino-frontend/
├── app/
│   └── api/
│       └── kwai-track/
│           └── route.ts          # API Route para envio
├── components/
│   └── kwai/
│       ├── KwaiPixelProvider.tsx # Wrapper do Provider
│       ├── KwaiClickIdCapture.tsx # Captura de clickid
│       └── KwaiDebugPanel.tsx    # Painel de debug
├── contexts/
│   └── KwaiPixelContext.tsx      # Context e Provider
├── lib/
│   └── kwai/
│       ├── useKwaiPixel.ts       # Hook principal
│       └── utils.ts              # Utilitários
└── types/
    └── kwai.ts                   # Tipos TypeScript
```

## 🔐 Segurança

- ✅ `accessToken` trafega apenas via API Route (server-side)
- ✅ Frontend envia requisição para `/api/kwai-track`
- ✅ Backend Next.js faz proxy para API Kwai
- ✅ Nunca expor `accessToken` no cliente

## 📝 Tipos de Eventos

| Evento | Constant | Quando Usar |
|--------|----------|-------------|
| Visualização | `EVENT_CONTENT_VIEW` | Ao visualizar página/produto |
| Registro | `EVENT_COMPLETE_REGISTRATION` | Ao completar cadastro |
| Início Checkout | `EVENT_INITIATE_CHECKOUT` | Ao iniciar processo de compra |
| Compra | `EVENT_COMPLETE_ORDER` | Ao completar compra |
| Carrinho | `EVENT_ADD_CART` | Ao adicionar item ao carrinho |
| Botão | `EVENT_BUTTON_CLICK` | Ao clicar em botão importante |
| Re-compra 1D | `EVENT_PURCHASE_1_DAY` | Compra após 1 dia |
| Re-compra 2D | `EVENT_PURCHASE_2_DAY` | Compra após 2 dias |
| Re-compra 3D | `EVENT_PURCHASE_3_DAY` | Compra após 3 dias |
| Re-compra 7D | `EVENT_PURCHASE_7_DAY` | Compra após 7 dias |

## 🌐 API Endpoints

### Frontend

#### GET `/api/kwai-track`
Health check da API de tracking.

#### POST `/api/kwai-track`
Envia evento para API do Kwai.

**Body:**
```json
{
  "access_token": "string",
  "clickid": "string",
  "event_name": "EVENT_CONTENT_VIEW",
  "pixelId": "string",
  "mmpcode": "PL",
  "properties": "{\"content_name\":\"test\"}"
}
```

### Backend

#### GET `/api/settings/kwai-pixels`
Retorna pixels ativos (incluindo `accessToken`).

## 🎉 Pronto!

O sistema está completamente configurado e pronto para uso. Para qualquer dúvida:

1. Consulte este guia
2. Verifique os logs no console (modo dev)
3. Use o painel de debug (botão 🎯)
4. Teste com `?test_clickid=TESTE` na URL

