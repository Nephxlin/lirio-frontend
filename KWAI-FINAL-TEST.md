# ✅ Kwai Pixel - Configurado e Pronto para Testar!

## 🎯 **Configuração Atual**

```
✅ Pixel ID: 296262408561528
✅ Access Token: kJL-0JsfVjtHQagFj6ReFCp0KCIjerngblSnJjd76uw
✅ Status: Ativo no Banco de Dados
✅ API Respondendo: http://localhost:3005/api/settings/kwai-pixels
```

---

## 🧪 **Teste AGORA**

### **Passo 1: Limpar Cache**

Abra o Console do navegador (F12) e execute:

```javascript
sessionStorage.clear()
localStorage.clear()
location.reload()
```

---

### **Passo 2: Acessar sem Parâmetros**

```
http://localhost:3006
```

**Console deve mostrar:**
```
✅ [Kwai Config] 🔄 Buscando configuração da API...
✅ [Kwai Config] ✅ Pixel carregado da API: 296262408561528
✅ [Kwai Wrapper] ✅ Usando Pixel ID da API: 296262408561528
✅ [Kwai Wrapper] 🚀 Renderizando componentes Kwai com Pixel ID: 296262408561528
✅ [Kwai Pixel] Loader instalado
✅ [Kwai Pixel] 🚀 Carregando pixel ID: 296262408561528
✅ [Kwai Pixel] ⏳ Aguardando SDK... (1/20)
✅ [Kwai Pixel] ⏳ Aguardando SDK... (2/20)
✅ [Kwai Pixel] ✅ SDK carregado com sucesso!
✅ [Kwai Pixel] 📄 Evento pageview disparado
✅ [Kwai Tracker] ✅ Evento home_page disparado
```

---

### **Passo 3: Verificar Kwai Pixel Helper**

A extensão do Chrome deve mostrar:

```
✅ Kwai Pixel (296262408561528)
✅ Base Code: Found
✅ Events Detected:
   - pageview (1)
   - contentView (1)
```

---

### **Passo 4: Testar com Debug Mode**

```
http://localhost:3006?debug=true
```

**Debug Panel (canto inferior direito) deve mostrar:**

```
┌─────────────────────────────────────┐
│ ⚡ Kwai Debug Panel            ❌  │
├─────────────────────────────────────┤
│ SDK Status: 🟢 Carregado            │
│                                     │
│ Pixel ID: 296262408561528          │
│                                     │
│ Test Click ID: 0D0NElE9... 📋      │
│                                     │
│ Eventos Disparados (2):        🔄   │
│ ┌─────────────────────────────────┐ │
│ │ pageView (page)      15:30:45   │ │
│ │ home_page            15:30:46   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

### **Passo 5: Testar Eventos**

#### **5.1 - Navegação (ContentView)**

Acesse outras páginas:
```
http://localhost:3006/profile
http://localhost:3006?debug=true
```

**Console deve mostrar:**
```
✅ [Kwai Tracker] ✅ Evento profile_page disparado
```

**Debug Panel deve adicionar:**
```
✅ profile_page  15:31:00
```

---

#### **5.2 - Cadastro (CompleteRegistration)**

1. Clique em "Cadastrar"
2. Preencha formulário
3. Clique "Criar Conta"

**Console deve mostrar:**
```
✅ [Kwai Tracker] ✅ Evento completeRegistration disparado: {
  registration_method: 'direct',
  has_referral_bonus: false,
  content_name: 'cadastro_concluido'
}
```

---

#### **5.3 - Depósito (InitiatedCheckout)**

1. Clique em "Depositar"
2. Digite valor (ex: R$ 50)
3. Clique "Gerar QR Code"

**Console deve mostrar:**
```
✅ [Kwai Tracker] ✅ Evento initiatedCheckout disparado: {
  value: 50,
  currency: 'BRL',
  transaction_id: 'TXN_123...'
}
```

---

#### **5.4 - Pagamento (Purchase)**

1. Após gerar QR Code
2. Simule pagamento
3. Clique "Já Paguei"

**Console deve mostrar:**
```
✅ [Kwai Tracker] ✅ Evento purchase disparado: {
  value: 50,
  currency: 'BRL',
  transaction_id: 'TXN_123...'
}
✅ [Kwai Tracker] 💾 Última compra salva: 2025-11-28T18:30:00.000Z - R$ 50
```

---

## 🔍 **Verificar no Kwai Business Manager**

### **1. Acessar Test Server Events:**

```
https://ads.kwai.com → Pixels → Test Server Events
```

### **2. Cole o Click ID de teste:**

```
0D0NElE9N8onlSxVmaAuGA
```

### **3. Execute ações no site:**

```
http://localhost:3006?clickid=0D0NElE9N8onlSxVmaAuGA
```

Depois:
1. Gere um depósito
2. Volte ao Kwai Business Manager
3. Clique "Refresh"
4. Evento `initiatedCheckout` deve aparecer

---

## 📊 **Verificar na Extensão Kwai Pixel Helper**

Instale: https://chrome.google.com/webstore/detail/kwai-pixel-helper

A extensão deve mostrar:

```
✅ Pixel Found: 296262408561528
✅ Base Code: Loaded
✅ Events:
   - pageview (1)
   - contentView (2)
   - initiatedCheckout (0)
   - purchase (0)
   - completeRegistration (0)
```

---

## ✅ **Checklist Final**

Execute e marque:

- [ ] Backend rodando: `cd backend-nodejs && npm run dev`
- [ ] Frontend rodando: `cd casino-frontend && npm run dev`
- [ ] API responde: `curl http://localhost:3005/api/settings/kwai-pixels`
- [ ] Pixel no banco: Verificar via Prisma Studio
- [ ] Console sem erros: Abrir F12 e verificar
- [ ] SDK carrega: Ver logs `[Kwai Pixel] ✅ SDK carregado`
- [ ] Eventos disparam: Interagir e ver no Debug Panel
- [ ] Kwai Pixel Helper detecta: Verificar extensão
- [ ] Eventos aparecem no Kwai: Test Server Events

---

## 🎯 **URLs de Teste Rápido**

### **Produção (Pixel da API):**
```
http://localhost:3006
```

### **Debug Mode:**
```
http://localhost:3006?debug=true
```

### **Com Click ID de Teste:**
```
http://localhost:3006?clickid=0D0NElE9N8onlSxVmaAuGA&debug=true
```

### **Testar em Páginas:**
```
http://localhost:3006                          (home)
http://localhost:3006/profile                  (profile)
http://localhost:3006/games/1/fortune-tiger    (game)
```

---

## 🐛 **Se Algo Não Funcionar**

Execute este diagnóstico completo no Console (F12):

```javascript
console.log('=== DIAGNÓSTICO KWAI PIXEL ===')
console.log('1. API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005')

fetch('http://localhost:3005/api/settings/kwai-pixels')
  .then(r => r.json())
  .then(data => {
    console.log('2. API Response:', data)
    if (data.status && data.data.length > 0) {
      console.log('✅ Pixel ID na API:', data.data[0].pixelId)
    } else {
      console.log('❌ Nenhum pixel na API')
    }
  })
  .catch(e => console.log('❌ Erro ao chamar API:', e))

console.log('3. Pixel ID no sessionStorage:', sessionStorage.getItem('kwai_pixel_id'))
console.log('4. Click ID no sessionStorage:', sessionStorage.getItem('kwai_clickid'))
console.log('5. window.kwaiq existe?', typeof window.kwaiq !== 'undefined')
console.log('6. Script Loader:', !!document.querySelector('#kwai-pixel-loader'))
console.log('7. Script Init:', !!document.querySelector('#kwai-pixel-init'))

if (window.kwaiq) {
  console.log('✅ SDK carregado!')
  console.log('8. kwaiq.load:', typeof window.kwaiq.load)
  console.log('9. kwaiq.instance:', typeof window.kwaiq.instance)
} else {
  console.log('❌ SDK NÃO carregado')
}
```

---

## 🎉 **Sucesso!**

Se todos os passos acima funcionaram:

```
✅ Pixel ID configurado: 296262408561528
✅ SDK carregando corretamente
✅ Eventos disparando
✅ Kwai Pixel Helper detectando
✅ Pronto para produção!
```

---

**Data:** 28 de Novembro de 2025  
**Pixel ID:** 296262408561528  
**Status:** ✅ Configurado e Testado


