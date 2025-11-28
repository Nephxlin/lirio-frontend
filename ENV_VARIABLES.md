# 🔐 Variáveis de Ambiente - Casino Frontend

## 📋 Variáveis Necessárias

### Produção (Coolify)

Configure estas variáveis no Coolify para o projeto `casino-frontend`:

```bash
# URL da API Backend (OBRIGATÓRIO)
NEXT_PUBLIC_API_URL=https://seu-backend.coolify.app

# Porta (OPCIONAL - Coolify usa PORT automaticamente)
# Se não definido, Next.js usa porta 3000
PORT=3000
```

## ⚙️ Como Configurar no Coolify

1. Acesse seu projeto `casino-frontend` no Coolify
2. Vá para **Environment Variables**
3. Adicione a variável `NEXT_PUBLIC_API_URL`
4. **IMPORTANTE:** Marque como **"Available in Build Time"**
5. Clique em **Save**
6. Faça **Redeploy** do projeto

## 🔍 Verificação

Para verificar se as variáveis estão configuradas corretamente:

1. Abra o DevTools do navegador (F12)
2. Vá para a aba **Console**
3. Digite: `console.log(process.env.NEXT_PUBLIC_API_URL)`
4. Deve mostrar a URL do seu backend

## ⚠️ Problemas Comuns

### Problema: `NEXT_PUBLIC_API_URL` é `undefined` em produção

**Solução:**
- Certifique-se de marcar a variável como **"Available in Build Time"** no Coolify
- Faça **Redeploy** (não apenas restart)

### Problema: Imagens não carregam

**Solução:**
- Verifique se `NEXT_PUBLIC_API_URL` aponta para o backend correto
- Verifique se não tem `/api` no final da URL
- Exemplo CORRETO: `https://backend.coolify.app`
- Exemplo ERRADO: `https://backend.coolify.app/api`

## 📝 Desenvolvimento Local

Para desenvolvimento local, crie um arquivo `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3005
```

**Nota:** O arquivo `.env.local` não deve ser commitado (já está no `.gitignore`)

