# 🖼️ Guia de Carregamento de Imagens - Casino Frontend

## 📋 Visão Geral

Este guia explica como as imagens são carregadas e exibidas no `casino-frontend`.

## 🔧 Arquitetura

### 1. Utilitário de Imagens (`lib/image-utils.ts`)

O arquivo `image-utils.ts` fornece funções auxiliares para construir URLs de imagens corretamente:

```typescript
// Obtém URL completa da imagem
getImageUrl(path: string | null | undefined): string

// Obtém URL com cache busting
getImageUrlWithCache(path: string | null | undefined, cacheBuster?: number | string): string

// Verifica se uma URL é válida
isValidImageUrl(url: string | null | undefined): boolean
```

**Funciona tanto com URLs absolutas quanto caminhos relativos:**
- Se o backend retornar `http://api.example.com/uploads/banners/image.png` → usa como está
- Se o backend retornar `banners/image.png` → constrói `http://api.example.com/uploads/banners/image.png`

### 2. Componentes Atualizados

Os seguintes componentes usam o utilitário de imagens:

#### **GameCard** (`components/games/GameCard.tsx`)
Exibe capas dos jogos

#### **BannerCarousel** (`components/home/BannerCarousel.tsx`)
Exibe banners na página inicial

#### **Header** (`components/layout/Header.tsx`)
Exibe avatar do usuário

#### **ProfilePage** (`app/(main)/profile/page.tsx`)
Exibe avatar e jogos favoritos

#### **GamePage** (`app/(main)/games/[id]/[slug]/page.tsx`)
Exibe jogos relacionados

### 3. Componente OptimizedImage

O `OptimizedImage` detecta automaticamente se é uma imagem externa (do backend) ou local:

- **Imagens externas** (HTTP/HTTPS): usa `unoptimized` para evitar erros
- **Imagens locais** (`/public`): usa otimização completa do Next.js

## ⚙️ Configuração

### Variável de Ambiente

Configure a URL da API no Coolify:

```bash
NEXT_PUBLIC_API_URL=https://sua-api.coolify.app
```

**⚠️ IMPORTANTE:** A variável deve ser definida no Coolify tanto em **Build Time** quanto em **Runtime**.

### Next.js Config (`next.config.mjs`)

O arquivo está configurado para aceitar imagens de qualquer domínio:

```javascript
images: {
  unoptimized: true, // Desabilitar otimização para evitar problemas em produção
  remotePatterns: [
    { protocol: 'http', hostname: '**' },
    { protocol: 'https', hostname: '**' },
  ],
}
```

## 🐛 Troubleshooting

### Problema: Imagens não carregam em produção

**Causa:** `NEXT_PUBLIC_API_URL` não está definida no Coolify

**Solução:**
1. Vá para o Coolify → seu projeto `casino-frontend`
2. Acesse **Environment Variables**
3. Adicione: `NEXT_PUBLIC_API_URL=https://seu-backend.coolify.app`
4. Marque como **Available in Build Time**
5. Salve e faça **Redeploy**

### Problema: Imagens aparecem quebradas

**Causa:** Backend retornando caminho incorreto ou CORS bloqueando

**Solução:**
1. Verifique se o backend está retornando URLs completas ou caminhos relativos corretos
2. Verifique CORS no backend (deve permitir a origem do frontend)
3. Verifique se as imagens existem no servidor backend

### Problema: Erro 404 nas imagens

**Causa:** Caminho incorreto ou imagem não existe

**Solução:**
1. Abra o DevTools → Network
2. Verifique a URL completa que está sendo requisitada
3. Compare com a estrutura de pastas no backend (`uploads/banners/`, `uploads/games/`, etc)

### Problema: Imagens carregam devagar

**Causa:** Imagens muito grandes ou sem otimização

**Solução:**
1. O backend deve comprimir imagens ao fazer upload
2. Use `OptimizedImage` component sempre que possível
3. Configure cache no servidor backend para arquivos estáticos

## 📝 Exemplos de Uso

### Exibir capa de jogo

```tsx
import { getImageUrl } from '@/lib/image-utils'

<img 
  src={getImageUrl(game.cover)} 
  alt={game.name}
/>
```

### Exibir banner com cache busting

```tsx
import { getImageUrlWithCache } from '@/lib/image-utils'

<img 
  src={getImageUrlWithCache(banner.image, Date.now())} 
  alt={banner.title}
/>
```

### Usar componente OptimizedImage

```tsx
import OptimizedImage from '@/components/common/OptimizedImage'
import { getImageUrl } from '@/lib/image-utils'

<OptimizedImage
  src={getImageUrl(game.cover)}
  alt={game.name}
  fill
  sizes="(max-width: 768px) 50vw, 33vw"
  quality={85}
/>
```

## ✅ Checklist de Deploy

Antes de fazer deploy, verifique:

- [ ] `NEXT_PUBLIC_API_URL` definida no Coolify (Build Time + Runtime)
- [ ] Backend servindo imagens corretamente (`/uploads/*`)
- [ ] CORS configurado no backend para permitir o frontend
- [ ] `next.config.mjs` configurado com `remotePatterns`
- [ ] Todos os componentes usando `getImageUrl()` ao invés de URLs hardcoded

## 🔗 Arquivos Relacionados

- `lib/image-utils.ts` - Utilitários de imagens
- `lib/api.ts` - Cliente API e exportação de URLs
- `components/common/OptimizedImage.tsx` - Componente otimizado
- `next.config.mjs` - Configuração do Next.js

