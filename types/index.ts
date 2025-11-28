// User types
export interface User {
  id: number
  name: string
  lastName?: string
  email: string
  cpf: string
  phone: string
  avatar?: string
  inviterCode?: string
  createdAt: string
  wallet?: Wallet
  statistics?: UserStatistics
}

export interface Wallet {
  balance: number
  balanceBonus: number
  balanceWithdrawal: number
  balanceBonusRollover: number
  balanceDepositRollover: number
  totalBet: number
  totalWon: number
  totalLose: number
  hideBalance: boolean
  vipLevel: number
  vipPoints: number
}

export interface UserStatistics {
  totalDeposits: number
  totalWithdrawals: number
  favoriteGamesCount: number
}

// Game types
export interface Game {
  id: number
  name: string
  code: string
  cover?: string
  provider: string
  providerCode: string
  type?: string
  isFeatured: boolean
  views: number
  categories?: string[]
  isFavorite?: boolean
}

export interface GameDetail extends Game {
  description?: string
  rtp?: number
  isMobile: boolean
  hasFreespins: boolean
}

// Banner types
export interface Banner {
  id: number
  title: string
  description?: string
  image: string
  link?: string
}

// Category types
export interface Category {
  id: number
  name: string
  description?: string
  image?: string
  slug: string
}

// Provider types
export interface Provider {
  id: number
  code: string
  name: string
  rtp?: number
}

// Transaction types
export interface Deposit {
  id: number
  amount: number
  status: number
  statusText: string
  type?: string
  currency: string
  symbol: string
  createdAt: string
}

export interface Withdrawal {
  id: number
  amount: number
  status: number
  statusText: string
  pixKey?: string
  pixType?: string
  currency: string
  symbol: string
  createdAt: string
  updatedAt: string
}

export interface WalletChange {
  id: number
  amount: number
  beforeBalance: number
  afterBalance: number
  type: string
  description?: string
  createdAt: string
}

// Settings types
export interface Settings {
  softwareName?: string
  softwareDescription?: string
  softwareLogo?: string
  softwareFavicon?: string
  currencyCode: string
  prefix: string
  minDeposit: number
  maxDeposit: number
  minWithdrawal: number
  maxWithdrawal: number
  depositBonus: number
  disableSpin: boolean
}

// API Response types
export interface ApiResponse<T = any> {
  status: boolean
  message?: string
  data?: T
}

export interface PaginatedResponse<T> {
  items?: T[]
  games?: T[]
  deposits?: T[]
  withdrawals?: T[]
  changes?: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

