# 📊 Mapa de Eventos Kwai Pixel

## ✅ **Eventos Configurados e Onde Disparam**

---

### **1. `pageView`** (Automático)
**Arquivo:** `KwaiPixelLoader.tsx`  
**Quando dispara:** Logo após o SDK carregar  
**Dados enviados:**
```javascript
{
  // Sem dados adicionais
}
```

---

### **2. `contentView`** (Visualização de Página)
**Arquivos:** 
- `app/(main)/home/page.tsx` → `home_page`
- `app/(main)/profile/page.tsx` → `profile_page`  
- `app/(main)/games/[id]/[slug]/page.tsx` → `game_play`

**Quando dispara:** Quando cada página carrega  
**Dados enviados:**
```javascript
{
  content_name: 'home_page', // ou 'profile_page', 'game_play'
  content_type: 'page',
  content_id: 'game_id', // apenas para game_play
}
```

---

### **3. `completeRegistration`** 🔥
**Arquivo:** `components/modals/LoginModal.tsx` (linha 133)  
**Quando dispara:** Quando o usuário **completa o cadastro** com sucesso  
**Dados enviados:**
```javascript
{
  registration_method: 'referral' | 'direct',
  has_referral_bonus: true | false,
  content_name: 'cadastro_concluido',
}
```

**Fluxo:**
```
1. Usuário clica em "Cadastrar"
2. Preenche formulário
3. Clica "Criar Conta"
4. ✅ Evento completeRegistration dispara
5. Modal fecha
```

---

### **4. `initiatedCheckout`** 🔥
**Arquivo:** `components/modals/DepositModal.tsx` (linha 185)  
**Quando dispara:** Quando o **QR Code é gerado** com sucesso  
**Dados enviados:**
```javascript
{
  value: 50.00,           // Valor do depósito
  currency: 'BRL',        // Moeda
  transaction_id: 'TXN_123', // ID da transação
}
```

**Fluxo:**
```
1. Usuário clica em "Depositar"
2. Seleciona valor (ex: R$ 50)
3. Clica "Gerar QR Code"
4. ✅ Evento initiatedCheckout dispara
5. QR Code é exibido
```

---

### **5. `purchase`** 🔥
**Arquivo:** `components/modals/DepositModal.tsx` (linha 218)  
**Quando dispara:** Quando o **pagamento é confirmado**  
**Dados enviados:**
```javascript
{
  value: 50.00,           // Valor pago
  currency: 'BRL',        // Moeda
  transaction_id: 'TXN_123', // ID da transação
}
```

**Fluxo:**
```
1. Usuário faz pagamento via PIX
2. Clica "Já Paguei"
3. Sistema verifica pagamento
4. ✅ Pagamento confirmado
5. ✅ Evento purchase dispara
6. Saldo é atualizado
```

---

### **6. `purchase1Day`, `purchase2Day`, `purchase3Day`, `purchase7Day`** 🔄
**Arquivo:** `components/tracker/KwaiRepurchaseTracker.tsx`  
**Quando dispara:** Automaticamente, **X dias após a última compra**  
**Dados enviados:**
```javascript
{
  days_since_last_purchase: 1, // ou 2, 3, 7
}
```

**Fluxo:**
```
1. Usuário faz primeira compra (evento purchase)
2. Data salva no localStorage
3. Componente verifica diariamente
4. No dia 1 após compra: ✅ purchase1Day
5. No dia 2: ✅ purchase2Day
6. No dia 3: ✅ purchase3Day
7. No dia 7: ✅ purchase7Day
```

---

## 🧪 **Como Testar Cada Evento:**

### **✅ Testar `completeRegistration`:**
1. Acesse: `http://localhost:3006`
2. Clique em "Cadastrar"
3. Preencha todos os campos
4. Clique "Criar Conta"
5. **Console deve mostrar:**
   ```
   ✅ [Kwai Tracker] ✅ Evento completeRegistration disparado: {
     registration_method: 'direct',
     has_referral_bonus: false,
     content_name: 'cadastro_concluido'
   }
   ```

---

### **✅ Testar `initiatedCheckout`:**
1. Faça login
2. Clique em "Depositar"
3. Selecione valor (ex: R$ 50)
4. Clique "Gerar QR Code"
5. **Console deve mostrar:**
   ```
   ✅ [Kwai Tracker] ✅ Evento initiatedCheckout disparado: {
     value: 50,
     currency: 'BRL',
     transaction_id: 'TXN_123...'
   }
   ```

---

### **✅ Testar `purchase`:**
1. Após gerar QR Code
2. Faça pagamento (ou simule)
3. Clique "Já Paguei"
4. Aguarde verificação
5. **Console deve mostrar:**
   ```
   ✅ [Kwai Tracker] ✅ Evento purchase disparado: {
     value: 50,
     currency: 'BRL',
     transaction_id: 'TXN_123...'
   }
   ✅ [Kwai Tracker] 💾 Última compra salva: 2025-11-28T...
   ```

---

## 📊 **Verificar no Kwai Business Manager:**

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

### **4. Verifique eventos:**
- Cadastre-se → `completeRegistration`
- Gere QR Code → `initiatedCheckout`
- Confirme pagamento → `purchase`

---

## ⚠️ **IMPORTANTE:**

### **✅ CORRETO - Ordem dos Eventos:**
```
1. pageView           → Página carrega
2. contentView        → Página específica carrega
3. completeRegistration → APÓS cadastro ser concluído
4. initiatedCheckout  → APÓS QR Code ser gerado
5. purchase           → APÓS pagamento ser confirmado
```

### **❌ ERRADO:**
```
❌ completeRegistration disparando após pagamento
❌ initiatedCheckout sem transaction_id
❌ purchase sem value
```

---

## 🔧 **Assinatura Correta das Funções:**

### **`trackCompleteRegistration()`**
```typescript
trackCompleteRegistration(properties?: KwaiEventProperties)

// Exemplo:
trackCompleteRegistration({
  registration_method: 'direct',
  content_name: 'cadastro_concluido'
})
```

### **`trackInitiatedCheckout()`**
```typescript
trackInitiatedCheckout(
  value: number,
  transactionId: string,
  currency: string = 'BRL'
)

// Exemplo:
trackInitiatedCheckout(50, 'TXN_123', 'BRL')
```

### **`trackPurchase()`**
```typescript
trackPurchase(
  value: number,
  transactionId: string,
  currency: string = 'BRL'
)

// Exemplo:
trackPurchase(50, 'TXN_123', 'BRL')
```

---

## ✅ **Correções Aplicadas:**

### **ANTES (Errado):**
```typescript
// ❌ DepositModal.tsx (linha 185)
trackInitiatedCheckout(parseFloat(amount), {
  content_type: 'deposit',
  content_name: 'qrcode_gerado',
  payment_method: 'pix',
  has_bonus: acceptBonus,
  transaction_id: data.idTransaction, // ← Errado no objeto
})
```

### **AGORA (Correto):**
```typescript
// ✅ DepositModal.tsx (linha 185)
trackInitiatedCheckout(
  parseFloat(amount),        // Valor
  data.idTransaction,        // Transaction ID (obrigatório)
  'BRL'                      // Moeda
)
```

---

**Data:** 28 de Novembro de 2025  
**Pixel ID:** 296262408561528  
**Status:** ✅ Eventos Corrigidos e no Lugar Certo

