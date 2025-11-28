# 📚 Kwai Pixel - Índice de Documentação

## 🎯 Começe Aqui

Escolha o guia certo para você:

| Se você quer... | Leia este arquivo | Tempo |
|----------------|-------------------|-------|
| 🚀 **Começar rápido** | [KWAI-GUIA-RAPIDO.md](./KWAI-GUIA-RAPIDO.md) | 3 min |
| 📖 **Entender tudo** | [KWAI-PIXEL-DOCS.md](./KWAI-PIXEL-DOCS.md) | 15 min |
| ✅ **Ver o que foi feito** | [KWAI-IMPLEMENTACAO.md](./KWAI-IMPLEMENTACAO.md) | 5 min |
| 💼 **Exemplo prático** | [components/tracker/INTEGRATION-EXAMPLE.md](./components/tracker/INTEGRATION-EXAMPLE.md) | 10 min |
| 📄 **Resumo geral** | [README-KWAI-PIXEL.md](./README-KWAI-PIXEL.md) | 2 min |

---

## 📁 Arquivos por Categoria

### 📚 Documentação

```
casino-frontend/
├── README-KWAI-PIXEL.md                    # 📄 Resumo e início rápido
├── KWAI-INDEX.md                           # 📚 Este arquivo (índice)
├── KWAI-GUIA-RAPIDO.md                     # ⚡ Guia rápido (3 min)
├── KWAI-PIXEL-DOCS.md                      # 📖 Documentação completa
└── KWAI-IMPLEMENTACAO.md                   # ✅ Detalhes técnicos
```

### 💻 Código - Client-Side

```
casino-frontend/
├── components/tracker/
│   ├── kwaiPixel.tsx                       # 🎯 Componente principal
│   ├── KwaiTrackerExample.tsx              # 📝 Exemplo básico
│   └── INTEGRATION-EXAMPLE.md              # 💼 Exemplo completo
└── lib/
    ├── hooks/
    │   └── useKwaiTracker.ts               # 🔧 Hook para eventos
    └── types/
        └── kwai.ts                         # 📐 Tipos TypeScript
```

### 🔧 Código - Server-Side

```
casino-frontend/
├── lib/
│   └── kwai-server-api.ts                  # 🔐 API server-side
└── app/api/
    └── kwai-webhook/
        └── route.ts.example                # 📡 Exemplo webhook
```

---

## 🎓 Roteiro de Aprendizado

### Para Iniciantes

1. Leia: [README-KWAI-PIXEL.md](./README-KWAI-PIXEL.md)
2. Siga: [KWAI-GUIA-RAPIDO.md](./KWAI-GUIA-RAPIDO.md)
3. Teste: Adicione `?kwai_pixel=TEST` na URL
4. Veja: Console do navegador (F12)

### Para Desenvolvedores

1. Leia: [KWAI-IMPLEMENTACAO.md](./KWAI-IMPLEMENTACAO.md)
2. Entenda: [components/tracker/kwaiPixel.tsx](./components/tracker/kwaiPixel.tsx)
3. Use: [lib/hooks/useKwaiTracker.ts](./lib/hooks/useKwaiTracker.ts)
4. Implemente: [components/tracker/INTEGRATION-EXAMPLE.md](./components/tracker/INTEGRATION-EXAMPLE.md)

### Para Arquitetos

1. Leia: [KWAI-PIXEL-DOCS.md](./KWAI-PIXEL-DOCS.md)
2. Analise: Estrutura de arquivos
3. Implemente: Server-side tracking
4. Otimize: Múltiplos pixels

---

## 🎯 Casos de Uso

### Caso 1: Rastrear Depósito (Básico)

**Arquivo**: Seu componente de depósito

```tsx
import { useKwaiTracker } from '@/lib/hooks/useKwaiTracker'

const { trackPurchase } = useKwaiTracker()

// Quando o depósito for confirmado
trackPurchase(100, 'TXN-123')
```

**Documentação**: [KWAI-GUIA-RAPIDO.md](./KWAI-GUIA-RAPIDO.md) → Seção "Principais Eventos"

---

### Caso 2: Modal Completo de Depósito

**Exemplo completo**: [components/tracker/INTEGRATION-EXAMPLE.md](./components/tracker/INTEGRATION-EXAMPLE.md)

**Eventos rastreados**:
- `trackInitiatedCheckout` - ao abrir modal
- `trackPurchase` - ao confirmar pagamento

---

### Caso 3: Rastreamento Server-Side

**Arquivo**: [lib/kwai-server-api.ts](./lib/kwai-server-api.ts)

```tsx
import { sendPurchaseEvent } from '@/lib/kwai-server-api'

await sendPurchaseEvent(
  { pixel_id: 'XXX', access_token: 'YYY' },
  { value: 100, transaction_id: 'TXN-123' }
)
```

**Documentação**: [KWAI-PIXEL-DOCS.md](./KWAI-PIXEL-DOCS.md) → Seção "Server-Side"

---

### Caso 4: Múltiplos Pixels

**Configuração**: Via URL

```
# Campanha A
https://seusite.com?kwai_pixel=PIXEL_A&clickid=ABC

# Campanha B
https://seusite.com?kwai_pixel=PIXEL_B&clickid=XYZ
```

**Documentação**: [KWAI-PIXEL-DOCS.md](./KWAI-PIXEL-DOCS.md) → Seção "Múltiplos Pixels"

---

## 🔍 Busca Rápida

### Por Funcionalidade

| Funcionalidade | Onde encontrar |
|---------------|----------------|
| Rastrear depósito | `useKwaiTracker` → `trackPurchase` |
| Rastrear registro | `useKwaiTracker` → `trackCompleteRegistration` |
| Rastrear checkout | `useKwaiTracker` → `trackInitiatedCheckout` |
| Verificar campanha | `useKwaiTracker` → `hasClickId` |
| Server-side | `lib/kwai-server-api.ts` |
| Tipos TypeScript | `lib/types/kwai.ts` |

### Por Problema

| Problema | Solução |
|---------|---------|
| Pixel não carrega | [KWAI-PIXEL-DOCS.md](./KWAI-PIXEL-DOCS.md) → FAQ |
| Eventos não aparecem | [KWAI-GUIA-RAPIDO.md](./KWAI-GUIA-RAPIDO.md) → Troubleshooting |
| ClickID não persiste | [KWAI-PIXEL-DOCS.md](./KWAI-PIXEL-DOCS.md) → FAQ |
| Como testar | [KWAI-GUIA-RAPIDO.md](./KWAI-GUIA-RAPIDO.md) → Como Testar |

---

## 📊 API Quick Reference

### Hook useKwaiTracker

```tsx
const {
  // Eventos
  trackPurchase,
  trackInitiatedCheckout,
  trackCompleteRegistration,
  trackPageView,
  trackAddToCart,
  track,
  
  // Utilidades
  isKwaiLoaded,
  hasClickId,
  getCampaignInfo,
} = useKwaiTracker()
```

**Documentação completa**: [KWAI-PIXEL-DOCS.md](./KWAI-PIXEL-DOCS.md) → Seção "API do Hook"

---

## 🧪 Testes

### Testes Manuais

1. **Console do navegador**: [KWAI-GUIA-RAPIDO.md](./KWAI-GUIA-RAPIDO.md) → "Como Testar"
2. **Pixel Helper**: [KWAI-PIXEL-DOCS.md](./KWAI-PIXEL-DOCS.md) → "Testes e Debug"
3. **Event Manager**: [KWAI-PIXEL-DOCS.md](./KWAI-PIXEL-DOCS.md) → "Monitorar no Business Manager"

### URLs de Teste

```bash
# Teste básico
http://localhost:3006?kwai_pixel=TEST_ID

# Teste com campanha
http://localhost:3006?kwai_pixel=TEST_ID&clickid=TEST123&mmpcode=PL
```

---

## 🆘 Ajuda e Suporte

### Documentação Oficial

- **Kwai Pixel Docs**: https://docs.qingque.cn/d/home/eZQDaewub9hw8vS2dHfz5OKl-
- **Business Manager**: https://business.kwai.com
- **Pixel Helper**: Chrome Web Store

### Documentação Interna

- **FAQ**: [KWAI-PIXEL-DOCS.md](./KWAI-PIXEL-DOCS.md) → Seção "FAQ"
- **Troubleshooting**: [KWAI-GUIA-RAPIDO.md](./KWAI-GUIA-RAPIDO.md) → Seção "Troubleshooting Rápido"
- **Exemplos**: [components/tracker/INTEGRATION-EXAMPLE.md](./components/tracker/INTEGRATION-EXAMPLE.md)

---

## ✅ Checklist Completo

### Setup Inicial

- [x] Componente KwaiPixel criado
- [x] Hook useKwaiTracker criado
- [x] Integrado no layout
- [x] Tipos TypeScript definidos
- [x] Documentação completa

### Para Produção

- [ ] Obter Pixel ID no Business Manager
- [ ] Testar com pixel real
- [ ] Instalar Pixel Helper
- [ ] Implementar em depósito
- [ ] Implementar em registro
- [ ] Validar no Event Manager
- [ ] Documentar pixels por campanha

**Documentação**: [KWAI-IMPLEMENTACAO.md](./KWAI-IMPLEMENTACAO.md) → Seção "Checklist"

---

## 🎉 Tudo Pronto!

✅ 8 arquivos de documentação  
✅ 6 arquivos de código  
✅ Exemplos completos  
✅ Guias passo a passo  
✅ Client-side + Server-side  
✅ TypeScript full support  

### 🚀 Próximos Passos

1. Leia o [KWAI-GUIA-RAPIDO.md](./KWAI-GUIA-RAPIDO.md) (3 minutos)
2. Obtenha seu Pixel ID no [Kwai Business Manager](https://business.kwai.com)
3. Teste com `?kwai_pixel=SEU_ID` na URL
4. Implemente nos componentes de conversão
5. Monitore no Event Manager

**Comece agora**: [README-KWAI-PIXEL.md](./README-KWAI-PIXEL.md) 🚀

---

**Última atualização**: Novembro 2025  
**Versão**: 1.0.0  
**Status**: ✅ Produção Ready

