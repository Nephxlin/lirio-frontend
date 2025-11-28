# 🔌 Kwai Pixel - Integração com API do Backend

## 📋 **Como Funciona**

O sistema agora busca automaticamente o **Pixel ID** e **Access Token** da API do backend, eliminando a necessidade de hardcode.

### **Prioridade de Configuração:**

```
1️⃣ Pixel ID na URL (?kpid=XXX)     → Para testes e debug
2️⃣ Pixel ID da API do Backend     → Configuração em produção
3️⃣ SessionStorage (cache)         → Fallback se API falhar
```

---

## 🚀 **Configuração no Admin Panel**

### **1. Acessar Gerenciamento de Pixels:**
```
http://localhost:3004/dashboard/kwai-pixels
```

### **2. Adicionar Novo Pixel:**
1. Clique em **"Adicionar Pixel"**
2. Preencha com seu Pixel ID real do Kwai Ads Manager:
   - **Pixel ID:** `ABC123XYZ456` (obtenha em https://ads.kwai.com → Pixels)
   - **Access Token:** `SEU_ACCESS_TOKEN_AQUI` (opcional)
   - **Nome:** Ex: "Kwai Pixel Principal"
   - **Descrição:** Ex: "Pixel para campanha principal"
   - **Ativo:** ✅ Marcado
3. Clique em **"Salvar"**

⚠️ **IMPORTANTE:**
- **Pixel ID** é o ID do seu pixel no Kwai Ads Manager (ex: `ABC123XYZ456`)
- **NÃO** confundir com Click ID (ex: `0D0NElE9N8onlSxVmaAuGA`)
- Click ID é para testar eventos, não para configurar aqui

---

## 🔄 **Fluxo Automático**

### **Frontend (`KwaiWrapper.tsx`):**

```typescript
// 1. Verifica URL (prioridade para testes)
const urlPixelId = searchParams.get('kpid')

// 2. Se não tem na URL, busca da API
const { config } = useKwaiPixelConfig()
// config = { pixelId: "...", accessToken: "..." }

// 3. Usa o pixel ID disponível
const pixelId = urlPixelId || config?.pixelId
```

### **Backend (API já implementada):**

**Endpoint:** `GET /api/settings/kwai-pixels`

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "pixelId": "ABC123XYZ",
      "accessToken": "token_secreto",
      "name": "Kwai Pixel Principal",
      "description": "Pixel para campanha principal",
      "isActive": true,
      "createdAt": "2025-11-28T12:00:00.000Z",
      "updatedAt": "2025-11-28T12:00:00.000Z"
    }
  ]
}
```

---

## 🧪 **Testando a Integração**

### **Teste 1: Com Pixel ID na URL (Debug)**
```
http://localhost:3006?debug=true&kpid=0D0NElE9N8onlSxVmaAuGA
```

**Console esperado:**
```
[Kwai Config] 🎯 Usando Pixel ID da URL: 0D0NElE9N8onlSxVmaAuGA
```

---

### **Teste 2: Sem Pixel ID na URL (Produção)**
```
http://localhost:3006
```

**Console esperado:**
```
[Kwai Config] 🔄 Buscando configuração da API...
[Kwai Config] ✅ Pixel carregado da API: ABC123XYZ
[Kwai Pixel] Loader instalado
[Kwai Pixel] 🚀 Carregando pixel ID: ABC123XYZ
```

---

### **Teste 3: API Offline (Fallback para Cache)**
```
# Backend offline
http://localhost:3006
```

**Console esperado:**
```
[Kwai Config] 🔄 Buscando configuração da API...
[Kwai Config] ❌ Erro ao buscar configuração: Network Error
[Kwai Config] 📦 Usando Pixel do cache (fallback): ABC123XYZ
```

---

## 🔐 **Access Token (Para Eventos Server-Side)**

O **Access Token** é salvo no `sessionStorage` e pode ser usado para eventos server-side no futuro.

### **Como Acessar:**
```typescript
const accessToken = sessionStorage.getItem('kwai_access_token')
```

### **Uso Futuro (Server-Side Events):**
```typescript
// Backend - Enviar evento direto para Kwai API
await fetch('https://api.kwai.com/events', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    pixelId: 'ABC123XYZ',
    eventName: 'purchase',
    properties: {
      value: 50,
      currency: 'BRL',
      transaction_id: 'TXN123',
    },
  }),
})
```

---

## 📊 **Logs no Console**

### **✅ Sucesso - Pixel da API:**
```
[Kwai Config] 🔄 Buscando configuração da API...
[Kwai Config] ✅ Pixel carregado da API: ABC123XYZ
[Kwai Pixel] Loader instalado
[Kwai Pixel] 🚀 Carregando pixel ID: ABC123XYZ
[Kwai Pixel] ✅ SDK carregado com sucesso!
[Kwai Pixel] 📄 Evento pageview disparado
```

### **⚠️ Aviso - Nenhum Pixel Configurado:**
```
[Kwai Config] 🔄 Buscando configuração da API...
[Kwai Config] ⚠️ Nenhum pixel ativo encontrado na API
[Kwai Wrapper] ⚠️ Nenhum Pixel ID disponível. Configure no Admin Panel
```

### **🎯 Info - Pixel da URL (Debug):**
```
[Kwai Config] 🎯 Usando Pixel ID da URL: 0D0NElE9N8onlSxVmaAuGA
[Kwai Pixel] Loader instalado
[Kwai Pixel] 🚀 Carregando pixel ID: 0D0NElE9N8onlSxVmaAuGA
```

---

## 🛠️ **Configuração Rápida**

### **1. Backend - Adicionar Pixel no Admin Panel:**
```bash
# Acessar admin panel
http://localhost:3004/dashboard/kwai-pixels

# Adicionar pixel com:
Pixel ID: 0D0NElE9N8onlSxVmaAuGA
Access Token: (opcional)
Nome: Kwai Pixel Teste
Ativo: ✅
```

### **2. Frontend - Testar:**
```bash
# Sem debug (usa pixel da API)
http://localhost:3006

# Com debug (usa pixel da URL + painel visual)
http://localhost:3006?debug=true&kpid=0D0NElE9N8onlSxVmaAuGA
```

---

## 📝 **Checklist de Produção**

Antes de ir para produção, verifique:

- [ ] Pixel ID configurado no Admin Panel (`/dashboard/kwai-pixels`)
- [ ] Pixel marcado como **Ativo** (✅)
- [ ] Access Token configurado (se necessário para server-side)
- [ ] Frontend busca pixel automaticamente (sem `?kpid` na URL)
- [ ] Console mostra: `[Kwai Config] ✅ Pixel carregado da API`
- [ ] SDK carrega corretamente: `[Kwai Pixel] ✅ SDK carregado com sucesso!`
- [ ] Eventos disparam normalmente
- [ ] Kwai Business Manager recebe eventos

---

## 🔄 **Múltiplos Pixels (Futuro)**

O sistema já suporta múltiplos pixels. Para usar:

### **1. Adicionar Vários Pixels no Admin Panel**
```
Pixel 1: Campanha Brasil
Pixel 2: Campanha Portugal
Pixel 3: Campanha Angola
```

### **2. Backend Retorna Lista**
```json
{
  "data": [
    { "pixelId": "PIXEL_BR", "isActive": true },
    { "pixelId": "PIXEL_PT", "isActive": true },
    { "pixelId": "PIXEL_AO", "isActive": false }
  ]
}
```

### **3. Frontend Usa Primeiro Ativo**
```typescript
const activePixel = pixels.find(p => p.isActive) || pixels[0]
```

---

## 🎯 **Vantagens da Nova Abordagem**

### **✅ Antes (Hardcode):**
```typescript
const PIXEL_ID = '0D0NElE9N8onlSxVmaAuGA' // ❌ Hardcoded
```

### **✅ Agora (Dinâmico):**
```typescript
const { config } = useKwaiPixelConfig()
// ✅ Busca automaticamente da API
// ✅ Sem necessidade de rebuild
// ✅ Gerenciado via Admin Panel
// ✅ Suporta múltiplos pixels
// ✅ Cache automático
```

---

## 📞 **Suporte**

Se tiver problemas:

1. **Verificar Console (F12):** Procure por `[Kwai Config]` e `[Kwai Pixel]`
2. **Verificar Admin Panel:** Pixel está ativo?
3. **Verificar API:** `GET /api/settings/kwai-pixels` retorna dados?
4. **Usar Debug Mode:** `?debug=true` para ver painel visual

---

**Data:** 28 de Novembro de 2025  
**Versão:** 3.0 (Integração com API)  
**Status:** ✅ Pronto para Produção

