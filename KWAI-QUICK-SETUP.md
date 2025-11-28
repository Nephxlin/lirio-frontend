# ⚡ Setup Rápido - Kwai Pixel

## 🔴 **Problema: Só funciona em debug mode**

Se o Kwai Pixel **só funciona com `?debug=true&kpid=XXX`**, é porque o pixel não está configurado no backend.

---

## ✅ **Solução em 3 Passos**

### **Passo 1: Configure no Admin Panel**

1. Acesse:
```
http://localhost:3004/dashboard/kwai-pixels
```

2. Clique em **"Adicionar Pixel"**

3. Preencha com SEU Pixel ID real (obtenha no Kwai Ads Manager):
```
Pixel ID: SEU_PIXEL_ID_AQUI    ← Ex: ABC123XYZ456 (do Kwai Ads)
Nome: Kwai Pixel Principal
Descrição: Pixel para produção
Ativo: ✅ (marcado)
Access Token: (deixe vazio por enquanto)
```

⚠️ **IMPORTANTE:** 
- NÃO use `0D0NElE9N8onlSxVmaAuGA` como Pixel ID (esse é um Click ID de teste)
- Obtenha seu Pixel ID real em: https://ads.kwai.com → Ferramentas → Pixels
- Se não tem, pode usar `TEST_PIXEL_123456` apenas para testar o código

4. Clique em **"Salvar"**

---

### **Passo 2: Verifique se API Está Retornando**

Abra no navegador:
```
http://localhost:3005/api/settings/kwai-pixels
```

**Deve retornar:**
```json
{
  "status": true,
  "data": [
    {
      "pixelId": "SEU_PIXEL_ID",
      "name": "Kwai Pixel Principal",
      "isActive": true
    }
  ]
}
```

Se retornar **array vazio** `[]` ou **erro 404**, o pixel não foi salvo corretamente.

---

### **Passo 3: Teste no Frontend (SEM debug mode)**

1. Limpe o cache:
```javascript
// No Console (F12)
sessionStorage.clear()
localStorage.clear()
```

2. Acesse SEM parâmetros na URL:
```
http://localhost:3006
```

3. Abra Console (F12) e procure:
```
✅ [Kwai Wrapper] ✅ Usando Pixel ID da API: SEU_PIXEL_ID
✅ [Kwai Wrapper] 🚀 Renderizando componentes Kwai
✅ [Kwai Pixel] Loader instalado
✅ [Kwai Pixel] 🚀 Carregando pixel ID: SEU_PIXEL_ID
✅ [Kwai Pixel] ✅ SDK carregado com sucesso!
```

---

## 🔍 **Diagnóstico se NÃO funcionar**

### **Teste 1: Backend está rodando?**

```bash
curl http://localhost:3005/api/settings/kwai-pixels
```

Se der erro, inicie o backend:
```bash
cd backend-nodejs
npm run dev
```

---

### **Teste 2: Banco de dados tem o pixel?**

Abra Prisma Studio:
```bash
cd backend-nodejs
npx prisma studio
```

Vá em `kwai_pixels` e verifique se existe registro com:
- `pixel_id`: "0D0NElE9N8onlSxVmaAuGA"
- `is_active`: true

Se não existir, crie manualmente ou via Admin Panel.

---

### **Teste 3: Frontend está buscando API correta?**

No Console do navegador (F12):
```javascript
// Ver qual API está configurada
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005')
```

Se estiver errado, configure no `.env`:
```
NEXT_PUBLIC_API_URL=http://localhost:3005
```

---

## 📋 **Checklist Completo**

Execute isso passo a passo:

- [ ] **Backend rodando:** `cd backend-nodejs && npm run dev`
- [ ] **API responde:** `curl http://localhost:3005/api/settings/kwai-pixels`
- [ ] **Pixel no banco:** Verificar via Prisma Studio
- [ ] **Pixel ativo:** `is_active = true`
- [ ] **Frontend rodando:** `cd casino-frontend && npm run dev`
- [ ] **Console sem erros:** Abrir F12 e verificar logs
- [ ] **Kwai Wrapper renderiza:** Ver logs `[Kwai Wrapper] 🚀 Renderizando`
- [ ] **SDK carrega:** Ver logs `[Kwai Pixel] ✅ SDK carregado`

---

## 🎯 **URLs para Teste**

### **Produção (usa pixel da API):**
```
http://localhost:3006
```

### **Debug (usa pixel da URL + Click ID de teste):**
```
http://localhost:3006?debug=true&clickid=0D0NElE9N8onlSxVmaAuGA
```

⚠️ **Nota:** 
- `clickid=0D0NElE9N8onlSxVmaAuGA` é o Click ID de teste para verificar eventos no Kwai
- O Pixel ID virá da API (configurado no admin)
- Use `?kpid=XXX` apenas se quiser testar com pixel diferente do banco

### **Verificar API:**
```
http://localhost:3005/api/settings/kwai-pixels
```

### **Admin Panel:**
```
http://localhost:3004/dashboard/kwai-pixels
```

---

## 🚨 **Se AINDA NÃO Funcionar**

Execute este diagnóstico completo no Console (F12):

```javascript
console.log('=== DIAGNÓSTICO COMPLETO ===')

// 1. Verificar configuração
console.log('1. API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005')

// 2. Verificar se API responde
fetch('http://localhost:3005/api/settings/kwai-pixels')
  .then(r => r.json())
  .then(data => {
    console.log('2. API Response:', data)
    if (data.status && data.data.length > 0) {
      console.log('✅ Pixel encontrado na API:', data.data[0].pixelId)
    } else {
      console.log('❌ Nenhum pixel na API')
    }
  })
  .catch(e => console.log('❌ Erro ao chamar API:', e))

// 3. Verificar sessionStorage
console.log('3. Pixel no sessionStorage:', sessionStorage.getItem('kwai_pixel_id'))

// 4. Verificar se SDK carregou
console.log('4. window.kwaiq existe?', typeof window.kwaiq !== 'undefined')

// 5. Verificar scripts na página
console.log('5. Script Loader:', !!document.querySelector('#kwai-pixel-loader'))
console.log('6. Script Init:', !!document.querySelector('#kwai-pixel-init'))
```

**Copie a saída e analise os erros.**

---

## ✅ **Quando Funcionar (Sem Debug Mode)**

Você deve ver no Console:

```
[Kwai Config] 🔄 Buscando configuração da API...
[Kwai Config] ✅ Pixel carregado da API: 0D0NElE9N8onlSxVmaAuGA
[Kwai Wrapper] ✅ Usando Pixel ID da API: 0D0NElE9N8onlSxVmaAuGA
[Kwai Wrapper] 🚀 Renderizando componentes Kwai
[Kwai Pixel] Loader instalado
[Kwai Pixel] 🚀 Carregando pixel ID: 0D0NElE9N8onlSxVmaAuGA
[Kwai Pixel] ⏳ Aguardando SDK... (1/20)
[Kwai Pixel] ✅ SDK carregado com sucesso!
[Kwai Pixel] 📄 Evento pageview disparado
[Kwai Tracker] ✅ Evento home_page disparado: {...}
```

E o **Kwai Pixel Helper** deve mostrar:
```
✅ 1 pixel(s) found
✅ Pixel ID: 0D0NElE9N8onlSxVmaAuGA
✅ Events: pageview, contentView
```

---

**Data:** 28 de Novembro de 2025  
**Versão:** 4.1 (Quick Setup)

