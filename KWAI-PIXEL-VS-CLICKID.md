# 🔍 Kwai: Pixel ID vs Click ID

## ⚠️ **ERRO IMPORTANTE - CORRIGIDO**

Eu estava usando **`0D0NElE9N8onlSxVmaAuGA`** como **Pixel ID**, mas esse valor é na verdade um **Click ID de teste** (ID da campanha).

---

## 📋 **Diferença Entre Pixel ID e Click ID**

### **1. Pixel ID (SDK ID)**
- ✅ **O que é:** ID do seu Pixel criado no Kwai Ads Manager
- ✅ **Formato:** Normalmente 16-20 caracteres (ex: `ABC123XYZ456`)
- ✅ **Onde obter:** Kwai Ads Manager → Pixels → Criar Pixel
- ✅ **Como usar:** Passa para `kwaiq.load(PIXEL_ID)`
- ✅ **É fixo:** Sempre o mesmo para seu site

**Exemplo de Pixel ID real:**
```
1234567890abcdef  (16 chars)
ABC123XYZ456      (12 chars)
```

---

### **2. Click ID (Campaign ID)**
- ✅ **O que é:** ID único gerado quando alguém clica no seu anúncio
- ✅ **Formato:** Hash aleatório (ex: `0D0NElE9N8onlSxVmaAuGA`)
- ✅ **Onde vem:** URL quando usuário clica no anúncio (`?clickid=XXX`)
- ✅ **Como usar:** Passa como parâmetro nos eventos
- ✅ **É dinâmico:** Diferente para cada clique

**Exemplo de Click ID:**
```
0D0NElE9N8onlSxVmaAuGA  ← Este é um Click ID de teste
```

---

## 🔧 **Como Configurar CORRETAMENTE**

### **Passo 1: Obter seu Pixel ID Real**

1. Acesse: **Kwai Ads Manager** → https://ads.kwai.com
2. Vá em: **Ferramentas** → **Pixels**
3. Clique em: **Criar Pixel**
4. Copie o **Pixel ID** (será algo como: `ABC123XYZ456`)

---

### **Passo 2: Configurar no Admin Panel**

```
http://localhost:3004/dashboard/kwai-pixels
```

Configure:
```
Pixel ID: ABC123XYZ456          ← SEU PIXEL ID REAL (do Kwai Ads)
Access Token: (opcional)
Nome: Kwai Pixel Principal
Ativo: ✅
```

---

### **Passo 3: Testar com Click ID de Teste**

Para testar eventos, use o Click ID de teste na URL:

```
http://localhost:3006?clickid=0D0NElE9N8onlSxVmaAuGA
```

Não confunda com:
```
# ❌ ERRADO (não existe ?kpid= para produção)
http://localhost:3006?kpid=0D0NElE9N8onlSxVmaAuGA

# ✅ CERTO (clickid é para campanha)
http://localhost:3006?clickid=0D0NElE9N8onlSxVmaAuGA
```

---

## 📊 **Fluxo Completo**

### **1. Desenvolvimento (sem anúncio):**

```javascript
// Pixel ID vem da API (configurado no admin)
Pixel ID: ABC123XYZ456 (da API)
Click ID: (não tem)

// Eventos:
kwaiq.load('ABC123XYZ456')
kwaiq.instance('ABC123XYZ456').track('purchase', { value: 50 })
```

---

### **2. Produção (com anúncio):**

```javascript
// Usuário clica no anúncio Kwai:
URL: https://seusite.com?clickid=HASH_ALEATORIO_123

// Sistema captura:
Pixel ID: ABC123XYZ456 (da API)
Click ID: HASH_ALEATORIO_123 (da URL)

// Eventos:
kwaiq.load('ABC123XYZ456')
kwaiq.instance('ABC123XYZ456').track('purchase', { 
  value: 50,
  clickid: 'HASH_ALEATORIO_123'  ← Atribui conversão ao anúncio
})
```

---

### **3. Debug/Testes:**

Para testar sem ter anúncio real, use Click ID fixo:

```javascript
// URL de teste:
http://localhost:3006?clickid=0D0NElE9N8onlSxVmaAuGA&debug=true

// Sistema usa:
Pixel ID: ABC123XYZ456 (da API)
Click ID: 0D0NElE9N8onlSxVmaAuGA (fixo para teste)

// No Kwai Test Server Events:
// Cole o Click ID: 0D0NElE9N8onlSxVmaAuGA
// Verá os eventos aparecerem
```

---

## 🎯 **Parâmetros de URL**

### **`?kpid=XXX` (APENAS para testes/debug)**
- ✅ Sobrescreve Pixel ID da API
- ✅ Útil para testar pixel diferente sem mudar banco
- ⚠️ **NÃO usar em produção**

```
http://localhost:3006?kpid=SEU_PIXEL_TESTE&debug=true
```

---

### **`?clickid=XXX` (Produção e testes)**
- ✅ ID da campanha/anúncio
- ✅ Enviado automaticamente pelo Kwai quando usuário clica
- ✅ Para testes, use: `0D0NElE9N8onlSxVmaAuGA`
- ✅ **Usar em produção**

```
http://localhost:3006?clickid=0D0NElE9N8onlSxVmaAuGA
```

---

## ✅ **Configuração Correta FINAL**

### **No Admin Panel:**
```
Pixel ID: ABC123XYZ456  ← Seu Pixel ID real do Kwai Ads
```

### **Em Produção (URL do anúncio):**
```
https://seusite.com?clickid={CLICK_ID}
                           ↑ Kwai preenche automaticamente
```

### **Em Testes (URL manual):**
```
http://localhost:3006?clickid=0D0NElE9N8onlSxVmaAuGA&debug=true
```

### **No Código (automático):**
```javascript
// kwaiPixel.tsx carrega:
kwaiq.load('ABC123XYZ456')  ← Pixel ID da API

// useKwaiTracker envia eventos:
kwaiq.instance('ABC123XYZ456').track('purchase', {
  value: 50,
  clickid: '0D0NElE9N8onlSxVmaAuGA'  ← Click ID da URL (se existir)
})
```

---

## 🔥 **Como Obter Seu Pixel ID Real**

Se você não tem um Pixel ID ainda:

### **Opção 1: Criar no Kwai Ads Manager**

1. Acesse: https://ads.kwai.com
2. Login na sua conta
3. Menu: **Ferramentas** → **Pixels**
4. Clique: **Criar Pixel**
5. Copie o **Pixel ID** gerado

---

### **Opção 2: Usar Pixel de Teste (APENAS para desenvolvimento)**

Se não tem conta Kwai ainda, pode testar com ID fake:

```
Pixel ID de teste: TEST_PIXEL_123456
```

Mas lembre-se:
- ⚠️ Eventos NÃO aparecerão no Kwai Ads Manager
- ⚠️ Apenas para testar se código funciona
- ✅ Para produção, precisa Pixel ID real

---

## 📝 **Resumo da Correção**

### **❌ ANTES (Errado):**
```javascript
// Usando Click ID como Pixel ID
Pixel ID: 0D0NElE9N8onlSxVmaAuGA  ← ERRADO! Este é Click ID
```

### **✅ AGORA (Correto):**
```javascript
// Pixel ID real da API
Pixel ID: ABC123XYZ456  ← Seu Pixel ID real do Kwai Ads

// Click ID da URL (opcional para atribuição)
Click ID: 0D0NElE9N8onlSxVmaAuGA  ← Para teste de eventos
```

---

**Você precisa obter seu Pixel ID real no Kwai Ads Manager e configurar no Admin Panel!**

**Data:** 28 de Novembro de 2025  
**Versão:** 5.0 (Correção Pixel ID vs Click ID)


