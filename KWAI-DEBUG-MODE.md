# 🔧 Kwai Debug Mode - Guia Completo

## 🎯 O Que É?

O **Kwai Debug Panel** é um painel de debug em tempo real que mostra todos os eventos Kwai sendo disparados, permitindo testar e validar a integração.

---

## 🚀 Como Ativar

### Método 1: Via URL (Recomendado)

Adicione `?debug=true` na URL:

```
http://localhost:3006/home?debug=true&kpid=0D0NElE9N8onlSxVmaAuGA
```

**Com Click ID de Teste**:
```
http://localhost:3006/home?debug=true&kpid=0D0NElE9N8onlSxVmaAuGA&clickid=0D0NElE9N8onlSxVmaAuGA
```

### Método 2: Adicionar Manualmente

O painel abre automaticamente quando `?debug=true` está na URL.

---

## 📊 O Que o Painel Mostra

### 1️⃣ **SDK Status**
- 🟢 Verde: SDK carregado e funcionando
- 🟡 Amarelo: SDK ainda carregando

### 2️⃣ **Informações da Campanha**
- **Pixel ID**: ID do pixel Kwai ativo
- **Click ID**: Click ID da campanha (se houver)
- **Test Click ID**: Click ID fixo para testes

### 3️⃣ **Eventos em Tempo Real**
Lista todos os eventos disparados:
- ✅ `pageView` - Visualização de página
- ✅ `completeRegistration` - Cadastro completo
- ✅ `initiatedCheckout` - QR Code gerado
- ✅ `purchase` - Depósito confirmado
- ✅ `purchase1Day`, `purchase2Day`, etc - Re-purchase

### 4️⃣ **Propriedades dos Eventos**
Clique em "Ver propriedades" para ver todos os dados enviados:
```json
{
  "value": 50,
  "currency": "BRL",
  "transaction_id": "TXN-123",
  "payment_method": "pix",
  "clickid": "0D0NElE9N8onlSxVmaAuGA"
}
```

---

## 🧪 Como Testar

### Teste 1: Verificar SDK

1. Acesse: `http://localhost:3006/home?debug=true&kpid=TEST_ID`
2. Abra o Debug Panel (canto inferior direito)
3. Verifique: **SDK Status** = 🟢 Carregado

---

### Teste 2: Testar PageView

1. Com debug ativo, navegue entre páginas
2. Veja no painel: Evento `pageView` disparado
3. Clique em "Ver propriedades" para ver dados

---

### Teste 3: Testar Cadastro

1. Abra modal de cadastro
2. Veja evento: `contentView` (modal aberto)
3. Complete o cadastro
4. Veja evento: `completeRegistration`

---

### Teste 4: Testar Depósito

1. Abra modal de depósito
2. Gere QR Code
3. Veja evento: `initiatedCheckout`
4. Confirme pagamento (via admin)
5. Veja evento: `purchase`

---

## 🎯 Click ID de Teste Fixo

O painel mostra um **Click ID fixo** para testes:

```
0D0NElE9N8onlSxVmaAuGA
```

### Como Usar:

1. Copie o Click ID do painel (botão copiar)
2. Use na URL:
```
?clickid=0D0NElE9N8onlSxVmaAuGA
```

3. Ou adicione manualmente no sessionStorage:
```javascript
sessionStorage.setItem('kwai_clickid', '0D0NElE9N8onlSxVmaAuGA')
```

### Validar no Kwai Business Manager:

1. Acesse https://business.kwai.com
2. Events → Event Manager
3. Use o Click ID `0D0NElE9N8onlSxVmaAuGA` para filtrar
4. Veja seus eventos de teste aparecerem

---

## 📋 Funcionalidades do Painel

### Botões e Ações:

| Botão | Função |
|-------|--------|
| ❌ Fechar | Fecha o painel |
| 📋 Copiar | Copia Pixel ID ou Click ID |
| 🔄 Limpar | Limpa lista de eventos |
| 📄 Ver propriedades | Expande detalhes do evento |

### Recursos:

- ✅ **Tempo Real**: Eventos aparecem instantaneamente
- ✅ **Histórico**: Mantém últimos 20 eventos
- ✅ **Detalhes**: Mostra todas as propriedades JSON
- ✅ **Copy/Paste**: Facilita testes
- ✅ **Auto-scroll**: Novos eventos no topo

---

## 🔍 Troubleshooting

### Painel Não Abre

**Problema**: Painel não aparece com `?debug=true`

**Solução**:
1. Verifique se a URL tem `?debug=true`
2. Recarregue a página (Ctrl+R)
3. Limpe cache (Ctrl+Shift+R)

---

### SDK Não Carrega

**Problema**: SDK Status = 🟡 Carregando (não muda)

**Solução**:
1. Verifique se o Pixel ID está correto na URL
2. Verifique console (F12) para erros
3. Tente com: `?kpid=0D0NElE9N8onlSxVmaAuGA`

---

### Eventos Não Aparecem

**Problema**: Interajo com a app mas eventos não aparecem

**Solução**:
1. Aguarde SDK carregar (status verde)
2. Verifique console: eventos são logados lá primeiro
3. Clique em "Limpar" e tente novamente

---

## 💡 Dicas de Uso

### 1. **Mantenha Aberto Durante Testes**

```
http://localhost:3006/home?debug=true&kpid=SEU_ID
```

Deixe o painel aberto enquanto testa toda a jornada do usuário.

### 2. **Use Click ID Fixo para Testes**

Sempre use o Click ID de teste para validar no Kwai:
```
&clickid=0D0NElE9N8onlSxVmaAuGA
```

### 3. **Copie Eventos para Reportar**

Use "Ver propriedades" → Copie JSON para reportar bugs ou validar dados.

### 4. **Teste Fluxo Completo**

```
1. PageView ✅
2. Modal Cadastro (contentView) ✅
3. Cadastro (completeRegistration) ✅
4. Modal Depósito ✅
5. QR Code (initiatedCheckout) ✅
6. Pagamento (purchase) ✅
```

---

## 🎨 Interface do Painel

```
┌─────────────────────────────────────┐
│ 🟢 Kwai Debug Panel            ❌  │
├─────────────────────────────────────┤
│ SDK Status: 🟢 Carregado            │
│ Pixel ID: 0D0NElE9N8onlSxVmaAuGA 📋│
│ Click ID: TEST123                   │
│ Test Click ID: 0D0NElE9... 📋      │
├─────────────────────────────────────┤
│ Eventos Disparados:            🔄   │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ ✅ purchase       12:34:56   │   │
│ │ Ver propriedades ▼           │   │
│ └─────────────────────────────┘   │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ ✅ initiatedCheckout 12:34:50│   │
│ └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## 📝 Exemplo de Evento

Quando você gera um QR Code, o painel mostra:

```javascript
{
  "eventName": "initiatedCheckout",
  "timestamp": "12:34:56",
  "status": "success",
  "properties": {
    "value": 50,
    "currency": "BRL",
    "content_type": "deposit",
    "content_name": "qrcode_gerado",
    "payment_method": "pix",
    "has_bonus": true,
    "transaction_id": "TXN-1234567890",
    "clickid": "0D0NElE9N8onlSxVmaAuGA",
    "mmpcode": "PL"
  }
}
```

---

## ✅ Checklist de Teste

Use este checklist para validar tudo:

- [ ] Painel abre com `?debug=true`
- [ ] SDK Status = 🟢 Carregado
- [ ] Pixel ID está correto
- [ ] Click ID de teste copiado
- [ ] Evento `pageView` dispara ao navegar
- [ ] Evento `contentView` dispara ao abrir modals
- [ ] Evento `completeRegistration` no cadastro
- [ ] Evento `initiatedCheckout` ao gerar QR Code
- [ ] Evento `purchase` ao confirmar pagamento
- [ ] Propriedades JSON estão corretas
- [ ] Eventos aparecem no Kwai Business Manager

---

## 🚀 Próximos Passos

1. **Teste Localmente**: Use o painel para validar todos os eventos
2. **Valide no Kwai**: Confirme que eventos chegam no Business Manager
3. **Teste em Produção**: Use com pixel real e clickid real
4. **Monitore**: Mantenha debug ativo durante primeiras campanhas

---

**💡 Dica Final**: Sempre teste com o Click ID fixo `0D0NElE9N8onlSxVmaAuGA` antes de lançar campanhas reais!

---

**Arquivo**: `components/tracker/KwaiDebugPanel.tsx`  
**Status**: ✅ Pronto para uso  
**Versão**: 1.0.0

