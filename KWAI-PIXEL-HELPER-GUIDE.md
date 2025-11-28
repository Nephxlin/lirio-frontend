# 🔍 Guia do Kwai Pixel Helper

## ❌ **Erro Atual:**

```
0 pixel(s) found on localhost:3006.

The pixel id in the event code of initiatedCheckout does not match 
the pixel id in the base code, which will affect event tracking, 
please ensure that the pixel id is consistent
```

## 🔧 **Causa do Problema:**

1. **0 pixels found:** O SDK não está sendo carregado corretamente
2. **Pixel ID inconsistente:** Eventos estão usando pixel ID diferente do base code

---

## ✅ **Solução:**

### **Passo 1: Verificar se Backend tem Pixel configurado**

1. Acesse o Admin Panel:
```
http://localhost:3004/dashboard/kwai-pixels
```

2. Verifique se existe um pixel **ATIVO** configurado
3. Se não existir, clique em **"Adicionar Pixel"** e configure:

```
Pixel ID: 0D0NElE9N8onlSxVmaAuGA
Nome: Kwai Pixel Principal
Ativo: ✅ (marcado)
```

4. Salve

---

### **Passo 2: Testar com Pixel ID na URL (Forçar)**

Para garantir que funciona, force o pixel ID via URL:

```
http://localhost:3006?kpid=0D0NElE9N8onlSxVmaAuGA
```

---

### **Passo 3: Verificar Console do Navegador**

Abra o Console (F12) e procure por:

```
✅ [Kwai Config] Pixel carregado da API: 0D0NElE9N8onlSxVmaAuGA
✅ [Kwai Pixel] Loader instalado
✅ [Kwai Pixel] 🚀 Carregando pixel ID: 0D0NElE9N8onlSxVmaAuGA
✅ [Kwai Pixel] ✅ SDK carregado com sucesso!
```

Se não aparecer, há um problema de carregamento.

---

### **Passo 4: Verificar `window.kwaiq` no Console**

No Console (F12), digite:

```javascript
window.kwaiq
```

**Deve retornar:**
```javascript
{
  load: ƒ (e,o),
  instance: ƒ (e),
  ...
}
```

Se retornar `undefined`, o SDK não carregou.

---

## 🐛 **Diagnóstico de Problemas Comuns**

### **Problema 1: SDK não carrega (0 pixels found)**

**Sintomas:**
- Kwai Pixel Helper mostra "0 pixels found"
- Console não mostra logs de SDK carregado

**Soluções:**

#### **A. Verificar se Script está na página**
No Console:
```javascript
document.querySelector('script[id="kwai-pixel-loader"]')
```

Se retornar `null`, o componente `KwaiPixel` não está sendo renderizado.

#### **B. Verificar se tem Pixel ID**
No Console:
```javascript
sessionStorage.getItem('kwai_pixel_id')
```

Se retornar `null`, configure no Admin Panel ou passe via URL.

#### **C. Forçar recarga**
```
Ctrl + Shift + R
```

---

### **Problema 2: Pixel ID inconsistente**

**Sintomas:**
- Pixel Helper mostra erro: "pixel id does not match"
- Eventos disparam mas não aparecem no Kwai

**Causa:**
- `kwaiq.load(PIXEL_A)` carrega um pixel
- `kwaiq.instance(PIXEL_B).track()` usa outro pixel

**Solução:**

Todos os componentes devem usar o **mesmo pixel ID**.

Verificar se está consistente:

```javascript
// Console (F12)
sessionStorage.getItem('kwai_pixel_id')
// Deve ser: "0D0NElE9N8onlSxVmaAuGA"
```

---

## 📝 **Checklist de Verificação**

Execute isso no Console (F12) para diagnóstico completo:

```javascript
console.log('=== KWAI PIXEL DIAGNÓSTICO ===')
console.log('1. Pixel ID na URL:', new URLSearchParams(window.location.search).get('kpid'))
console.log('2. Pixel ID no sessionStorage:', sessionStorage.getItem('kwai_pixel_id'))
console.log('3. Script Loader existe?', !!document.querySelector('script[id="kwai-pixel-loader"]'))
console.log('4. Script Init existe?', !!document.querySelector('script[id="kwai-pixel-init"]'))
console.log('5. window.kwaiq existe?', typeof window.kwaiq !== 'undefined')
console.log('6. window.kwaiq.load existe?', typeof window.kwaiq?.load === 'function')
console.log('7. window.kwaiq.instance existe?', typeof window.kwaiq?.instance === 'function')
```

**Resultado esperado:**
```
=== KWAI PIXEL DIAGNÓSTICO ===
1. Pixel ID na URL: "0D0NElE9N8onlSxVmaAuGA"
2. Pixel ID no sessionStorage: "0D0NElE9N8onlSxVmaAuGA"
3. Script Loader existe? true
4. Script Init existe? true
5. window.kwaiq existe? true
6. window.kwaiq.load existe? true
7. window.kwaiq.instance existe? true
```

---

## 🔄 **Passo a Passo para Resolver**

### **1. Limpar tudo e começar do zero:**

```javascript
// No Console (F12)
sessionStorage.clear()
localStorage.clear()
location.reload()
```

### **2. Acessar com Pixel ID forçado:**

```
http://localhost:3006?kpid=0D0NElE9N8onlSxVmaAuGA&debug=true
```

### **3. Aguardar 5 segundos**

### **4. Verificar Debug Panel (canto inferior direito)**

Deve mostrar:
```
SDK Status: 🟢 Carregado
Pixel ID: 0D0NElE9N8onlSxVmaAuGA
```

### **5. Testar um evento:**

Clique em "Depositar" e gere um QR Code.

No Debug Panel deve aparecer:
```
✅ initiatedCheckout  15:30:45
```

### **6. Verificar Kwai Pixel Helper**

A extensão deve mostrar:
```
✅ 1 pixel(s) found
✅ initiatedCheckout event detected
```

---

## 🎯 **Se Ainda Não Funcionar**

### **Teste Manual do SDK:**

No Console (F12), execute:

```javascript
// 1. Verificar se SDK carregou
console.log(window.kwaiq)

// 2. Carregar pixel manualmente
window.kwaiq.load('0D0NElE9N8onlSxVmaAuGA')

// 3. Disparar evento de teste
window.kwaiq.instance('0D0NElE9N8onlSxVmaAuGA').track('initiatedCheckout', {
  value: 50,
  currency: 'BRL',
  transaction_id: 'TEST123'
})

// 4. Ver se Pixel Helper detectou
// (Verificar extensão)
```

---

## 📞 **Último Recurso**

Se nada funcionar, o problema pode ser:

1. **Firewall/VPN bloqueando CDN:** `https://s21-def.ap4r.com`
2. **Extensão bloqueando scripts:** Desative AdBlock, uBlock, etc
3. **Navegador com restrições:** Teste em modo anônimo
4. **Rede corporativa:** Tente outra rede

**Teste de conectividade:**
```
https://s21-def.ap4r.com/kos/s101/nlav112572/pixel/events.js
```

Se não carregar nessa URL, é problema de rede.

---

## ✅ **Quando Funcionar:**

Kwai Pixel Helper deve mostrar:

```
✅ Kwai Pixel (0D0NElE9N8onlSxVmaAuGA)
✅ Base Code: Found
✅ Events: 
   - pageview (1)
   - contentView (2)
   - initiatedCheckout (1)
   - purchase (0)
```

---

**Data:** 28 de Novembro de 2025  
**Versão:** 4.0 (Troubleshooting Guide)


