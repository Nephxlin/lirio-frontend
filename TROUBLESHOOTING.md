# 🔧 Troubleshooting - Otimizações

## ❌ Erro: "hostname is not configured under images"

### Mensagem Completa
```
Error: Invalid src prop (http://localhost:3005/uploads/...) on `next/image`, 
hostname "localhost" is not configured under images in your `next.config.js`
```

### ✅ Solução

Este erro ocorre quando o Next.js Image tenta carregar uma imagem de um domínio não configurado.

**1. Verificar `next.config.ts`**

O arquivo já foi atualizado com:
```ts
images: {
  remotePatterns: [...],
  domains: ['localhost'], // ✅ IMPORTANTE
}
```

**2. Reiniciar o servidor**

O Next.js **precisa** ser reiniciado após mudanças no `next.config.ts`:

```bash
# Parar o servidor atual (Ctrl+C)

# Limpar cache (opcional mas recomendado)
rm -rf .next

# Reiniciar
npm run dev
```

**3. Se ainda persistir**

Adicione `unoptimized` temporariamente:
```tsx
<Image 
  src="..." 
  alt="..."
  unoptimized // ⚠️ Apenas para debug
/>
```

---

## ❌ Erro: Imagens não aparecem

### Possíveis Causas

**1. Backend não está rodando**
```bash
# Verificar se a API está ativa em localhost:3005
curl http://localhost:3005/uploads/games/[nome-arquivo]
```

**2. URL incorreta no código**
```tsx
// ❌ ERRADO
src="/uploads/game.png"

// ✅ CORRETO
src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/game.png`}
```

**3. Variável de ambiente não configurada**
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3005
```

---

## ❌ Erro: Module not found (Dynamic Import)

### Mensagem
```
Module not found: Can't resolve '@/components/modals/DepositModal'
```

### Solução
Verificar se o componente existe e o caminho está correto:
```bash
# Verificar se o arquivo existe
ls components/modals/DepositModal.tsx
```

Se o arquivo não existir, criar ou remover o import dinâmico.

---

## ❌ Build falha com erro de TypeScript

### Mensagem
```
Type error: Property 'fill' does not exist on type 'ImgHTMLAttributes'
```

### Solução
Isso significa que você está misturando `<img>` com props do Next.js `<Image>`.

```tsx
// ❌ ERRADO
<img fill sizes="..." />

// ✅ CORRETO - Next.js Image
import Image from 'next/image'
<Image fill sizes="..." />

// ✅ CORRETO - HTML img
<img src="..." alt="..." />
```

---

## ❌ Lighthouse score não melhorou

### Checklist

- [ ] Testado em **modo anônimo** (Ctrl+Shift+N)
- [ ] Cache do navegador limpo
- [ ] Build de **produção** (`npm run build && npm start`)
- [ ] Throttling **4G** ativado no DevTools
- [ ] Testado em **modo Mobile**

### Passo a passo correto

```bash
# 1. Build de produção
npm run build

# 2. Iniciar em modo produção
npm run start

# 3. Abrir em anônimo
# Chrome: Ctrl+Shift+N
# URL: http://localhost:3006

# 4. DevTools > Lighthouse
# - Device: Mobile
# - Throttling: 4G
# - Clear storage: ✅
```

---

## ❌ Erro: "Cannot find module 'sharp'"

### Mensagem
```
Error: Cannot find module 'sharp'
```

### Solução

Next.js usa `sharp` para otimizar imagens. Instale:

```bash
npm install sharp

# Ou se usar yarn
yarn add sharp
```

Depois reinicie:
```bash
npm run dev
```

---

## ❌ Performance ainda ruim em mobile

### Possíveis Causas

**1. Testando em modo development**
```bash
# ❌ Development (lento)
npm run dev

# ✅ Production (rápido)
npm run build && npm run start
```

**2. Imagens muito grandes**
```bash
# Verificar tamanho das imagens em /public
ls -lh public/*.png public/*.jpg

# Idealmente: < 100KB por imagem
```

**3. JavaScript muito pesado**
```bash
# Analisar bundle
npm run build
# Procurar por arquivos .js grandes em .next/static
```

---

## ❌ Erro: "Image with src ... has a 'fill' but is missing 'sizes'"

### Mensagem
```
Image with src "..." has a "fill" property but is missing required "sizes" property
```

### Solução

Sempre adicione `sizes` quando usar `fill`:

```tsx
<Image
  src="..."
  alt="..."
  fill
  sizes="(max-width: 768px) 100vw, 50vw" // ✅ OBRIGATÓRIO
/>
```

### Guia de sizes comuns

```tsx
// Card de jogo (grid responsivo)
sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"

// Avatar pequeno
sizes="96px"

// Imagem full width
sizes="100vw"

// Banner
sizes="(max-width: 768px) 100vw, 80vw"
```

---

## ❌ Console cheio de warnings

### "Image with src ... was detected as the Largest Contentful Paint"

**Isso é BOM!** Significa que o Next.js detectou a imagem principal.

Para melhorar ainda mais:
```tsx
<Image
  src="..."
  alt="..."
  priority // ✅ Adicionar para LCP
  fill
  sizes="..."
/>
```

### "Using the `style` prop with `fill` is not recommended"

```tsx
// ❌ Evitar
<Image fill style={{ objectFit: 'cover' }} />

// ✅ Usar className
<Image fill className="object-cover" />
```

---

## 🆘 Ainda com problemas?

### Comandos de debug

```bash
# 1. Limpar tudo
rm -rf .next node_modules
npm install

# 2. Verificar versões
npm list next react react-dom

# 3. Build verbose
npm run build --verbose

# 4. Verificar porta ocupada
netstat -ano | findstr :3006

# 5. Testar sem cache
npm run build && npm run start -- --no-cache
```

### Logs úteis

```bash
# Ver logs do Next.js
# No console onde rodou npm run dev

# Ver Network no browser
# DevTools > Network > Filter: Img

# Ver tamanho do bundle
# Após build, verificar: .next/static/chunks/
```

---

## 📞 Checklist Final

Antes de relatar um problema:

- [ ] Reiniciei o servidor após mudar `next.config.ts`
- [ ] `.env.local` está configurado
- [ ] Backend está rodando em `localhost:3005`
- [ ] Testei em modo produção (`npm run build && npm start`)
- [ ] Limpei cache (`.next` folder)
- [ ] Reinstalei dependências se necessário
- [ ] Console do navegador não mostra erros de rede
- [ ] Imagens existem no caminho especificado
- [ ] Testei em anônimo/privado

---

## 🎯 Quick Fixes

### Reset completo
```bash
# Windows
rmdir /s /q .next node_modules
npm install
npm run dev

# Linux/Mac
rm -rf .next node_modules
npm install
npm run dev
```

### Teste rápido de imagem
```tsx
// Adicione temporariamente no código
<img 
  src="http://localhost:3005/uploads/test.png" 
  alt="test"
  onError={(e) => console.log('Erro ao carregar:', e)}
  onLoad={() => console.log('Imagem carregada!')}
/>
```

### Verificar se Next.js vê as mudanças
```tsx
// Adicione no next.config.ts
const nextConfig: NextConfig = {
  images: {
    // ... sua config
  },
  // Adicionar para debug
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};
```

---

**Última atualização:** Novembro 2025
**Versão Next.js:** 14.2.0+

