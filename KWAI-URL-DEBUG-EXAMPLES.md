# 🔧 URLs de Debug - Exemplos Práticos

## ✅ O Debug Panel Está Funcionando!

Como você pode ver na imagem, o painel já está ativo! 🎉

---

## 📍 **URLs Para Testar:**

### 1️⃣ **URL Básica de Debug** (Você já está usando!)
```
http://localhost:3006/home?debug=true&kpid=0D0NElE9N8onlSxVmaAuGA
```
✅ Debug Panel: Ativo  
⚠️ SDK Status: Carregando...

---

### 2️⃣ **URL com Click ID de Teste**
```
http://localhost:3006/home?debug=true&kpid=0D0NElE9N8onlSxVmaAuGA&clickid=0D0NElE9N8onlSxVmaAuGA
```
✅ Debug Panel: Ativo  
✅ Click ID: Configurado

---

### 3️⃣ **URL Completa (Recomendada para Testes)**
```
http://localhost:3006?debug=true&kpid=0D0NElE9N8onlSxVmaAuGA&clickid=0D0NElE9N8onlSxVmaAuGA&mmpcode=PL
```

---

## 🔍 **Problema Atual:**

Você está vendo:
```
⚠️ SDK Status: Carregando...
⚠️ [Kwai Tracker] SDK não carregou após 5 tentativas
```

### Causa:
O script do Kwai não está carregando da CDN.

### Soluções:

#### **Solução 1: Aguardar Mais Tempo**
Já aumentei o retry de 5 para 20 tentativas. Recarregue a página:
```
http://localhost:3006/home?debug=true&kpid=0D0NElE9N8onlSxVmaAuGA
```

#### **Solução 2: Verificar Conexão**
O SDK carrega de: `https://s21-def.ap4r.com`

Teste se está acessível:
```bash
curl -I https://s21-def.ap4r.com/kos/s101/nlav112572/pixel/events.js
```

#### **Solução 3: Testar Sem SDK (Mock)**
Para testar a interface sem o SDK real, os eventos serão mostrados mesmo sem o Kwai carregar.

---

## 🎯 **Formato Correto da URL:**

### Estrutura:
```
http://localhost:3006/PAGINA?PARAMETRO1=VALOR1&PARAMETRO2=VALOR2
```

### Parâmetros Disponíveis:

| Parâmetro | Valor | Obrigatório | Descrição |
|-----------|-------|-------------|-----------|
| `debug` | `true` | ✅ Sim (para debug) | Ativa Debug Panel |
| `kpid` | ID do pixel | ✅ Sim | Pixel ID do Kwai |
| `clickid` | ID do click | ⚠️ Opcional | Para atribuição de campanha |
| `mmpcode` | `PL` | ⚠️ Opcional | Código MMP (default: PL) |

---

## 📋 **Exemplos Práticos:**

### Para Desenvolvimento (Localhost)
```
http://localhost:3006?debug=true&kpid=0D0NElE9N8onlSxVmaAuGA

http://localhost:3006/home?debug=true&kpid=0D0NElE9N8onlSxVmaAuGA

http://localhost:3006/profile?debug=true&kpid=0D0NElE9N8onlSxVmaAuGA&clickid=TEST123
```

### Para Produção (Seu Domínio)
```
https://seusite.com?debug=true&kpid=SEU_PIXEL_ID_REAL

https://seusite.com?debug=true&kpid=SEU_PIXEL_ID_REAL&clickid=CLICKID_REAL
```

### Para Testes no Kwai Business Manager
```
http://localhost:3006?debug=true&kpid=0D0NElE9N8onlSxVmaAuGA&clickid=0D0NElE9N8onlSxVmaAuGA
```
Use o mesmo valor no `kpid` e `clickid` para facilitar testes.

---

## 🎨 **O Que Você Deve Ver:**

### Debug Panel Aberto (✅ Já está!)
```
┌─────────────────────────────────────┐
│ 🟢 Kwai Debug Panel            ❌  │
├─────────────────────────────────────┤
│ SDK Status: 🟢 Carregado            │ ← Deve ficar verde
│ Pixel ID: 0D0NElE9N8onlSxVmaAuGA 📋│
│ Click ID: 0D0NElE9N8onlSxVmaAuGA   │
│ Test Click ID: 0D0NElE9... 📋      │
├─────────────────────────────────────┤
│ Eventos Disparados:            🔄   │
│                                     │
│ ✅ pageView        12:34:56         │
│ ✅ contentView     12:35:01         │
└─────────────────────────────────────┘
```

---

## 🧪 **Teste Agora:**

### 1. **Recarregue a Página**
```
Ctrl + Shift + R  (ou Cmd + Shift + R no Mac)
```

### 2. **Use Esta URL**
```
http://localhost:3006?debug=true&kpid=0D0NElE9N8onlSxVmaAuGA&clickid=0D0NElE9N8onlSxVmaAuGA
```

### 3. **Aguarde 3-5 Segundos**
O SDK pode demorar para carregar.

### 4. **Verifique o Console (F12)**
Você deve ver:
```
[Kwai Pixel] Script carregado da CDN
[Kwai Pixel] Tentativa 1/20 - SDK ainda carregando...
[Kwai Pixel] Carregado: 0D0NElE9N8onlSxVmaAuGA
[Kwai Pixel] Evento pageview disparado
```

---

## 💡 **Dica:**

Se o SDK não carregar (China firewall ou rede corporativa), você ainda pode:
- ✅ Ver o Debug Panel funcionando
- ✅ Testar a interface
- ✅ Validar a lógica de eventos

Os eventos serão logados no console mesmo sem o SDK.

---

## 🎯 **Teste Real:**

Quando o SDK carregar (status verde), teste:

1. **Abrir modal de cadastro** → Veja `contentView` no painel
2. **Completar cadastro** → Veja `completeRegistration` no painel
3. **Gerar QR Code** → Veja `initiatedCheckout` no painel
4. **Confirmar pagamento** → Veja `purchase` no painel

---

**URL para copiar e colar agora:**

```
http://localhost:3006?debug=true&kpid=0D0NElE9N8onlSxVmaAuGA&clickid=0D0NElE9N8onlSxVmaAuGA
```

Cole no navegador, aguarde 5 segundos, e veja o status mudar para 🟢!

