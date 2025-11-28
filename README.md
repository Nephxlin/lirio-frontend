# Casino Frontend - Next.js

Front-end do cassino desenvolvido em Next.js 14 com TypeScript, Tailwind CSS e animações.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações declarativas
- **GSAP** - Animações avançadas
- **Axios** - HTTP client
- **React Hook Form + Zod** - Formulários e validação
- **Swiper** - Carrossel de banners
- **QRCode.react** - Geração de QR Code PIX

## 📦 Instalação

```bash
# Instalar dependências
yarn install

# Rodar em desenvolvimento
yarn dev

# Build para produção
yarn build

# Iniciar em produção
yarn start
```

O projeto rodará em: `http://localhost:3005`

## 🔗 Backend

O frontend se conecta com o backend Node.js em: `http://localhost:3000/api`

Certifique-se de que o backend está rodando antes de iniciar o frontend.

## 📁 Estrutura do Projeto

```
casino-frontend/
├── app/
│   ├── (auth)/          # Páginas de autenticação
│   │   ├── login/
│   │   └── register/
│   ├── (main)/          # Páginas principais
│   │   ├── home/
│   │   ├── profile/
│   │   └── games/[id]/[slug]/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── layout/          # Header, Footer
│   ├── games/           # GameCard, GameGrid
│   ├── home/            # BannerCarousel
│   └── modals/          # DepositModal, WithdrawModal
├── contexts/            # Context API
│   ├── AuthContext.tsx
│   ├── PermissionsContext.tsx
│   └── WalletContext.tsx
├── lib/                 # Utilitários
│   ├── api.ts          # Axios config
│   └── utils.ts        # Funções auxiliares
├── types/              # TypeScript types
│   └── index.ts
└── public/             # Assets estáticos
```

## 🎯 Funcionalidades

### Autenticação
- ✅ Login com email/CPF
- ✅ Registro de usuário
- ✅ Logout
- ✅ Token JWT persistido no localStorage

### Home
- ✅ Carrossel de banners
- ✅ Grid de jogos com filtros
- ✅ Busca de jogos
- ✅ Filtro por categoria e provider
- ✅ Infinite scroll (carregar mais)

### Jogos
- ✅ Lançar jogo em nova janela
- ✅ Iframe com URL do jogo
- ✅ Exibir saldo do usuário
- ✅ Favoritar jogos
- ✅ Likes em jogos

### Perfil
- ✅ Visualizar informações pessoais
- ✅ Editar perfil (nome, telefone)
- ✅ Exibir saldos (total, disponível para saque)
- ✅ Histórico de depósitos
- ✅ Histórico de saques
- ✅ Jogos favoritos

### Carteira
- ✅ Modal de depósito via PIX
- ✅ Geração de QR Code
- ✅ Verificação automática de pagamento
- ✅ Modal de saque
- ✅ Validações de valor mín/máx
- ✅ Toggle ocultar/mostrar saldo

### Permissions
- ✅ Verificar se usuário pode jogar (saldo)
- ✅ Verificar se pode depositar
- ✅ Verificar se pode sacar
- ✅ Proteção de rotas

## 🎨 Tema

O tema utiliza cores escuras com destaque em roxo/dourado:

- **Primary**: Roxo (gradient casino)
- **Gold**: Dourado para ações importantes
- **Dark**: Tons de cinza/preto para fundo

## 🔒 Segurança

- Token JWT no header de todas as requisições autenticadas
- Interceptor para renovação de token
- Logout automático quando token expira
- Validação de formulários com Zod
- Proteção de rotas privadas

## 📱 Responsividade

O projeto é 100% responsivo com breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🎭 Animações

- **Framer Motion**: Page transitions, hover effects, modals
- **GSAP**: Animações complexas (opcional)
- **Tailwind Animations**: Pulse, spin, bounce customizados

## 🔧 Variáveis de Ambiente

Crie um arquivo `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 📝 Licença

MIT
