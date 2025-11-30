'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Home, 
  ArrowDownToLine, 
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import ReferralModal from '@/components/modals/ReferralModal'

interface BottomNavProps {
  onOpenDeposit?: () => void
}

interface Game {
  id: number
  name: string
  code: string
  slug?: string
}

export default function BottomNav({ onOpenDeposit }: BottomNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [activeItem, setActiveItem] = useState('')
  const [games, setGames] = useState<Game[]>([])
  const [currentGameIndex, setCurrentGameIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [showReferralModal, setShowReferralModal] = useState(false)

  // Verificar se está na rota de games
  const isInGameRoute = pathname?.startsWith('/games/')
  
  // Extrair ID do jogo atual da URL
  const currentGameId = isInGameRoute 
    ? parseInt(pathname?.split('/')[2] || '0')
    : null

  // Carregar lista de jogos quando entrar na rota de games
  useEffect(() => {
    if (isInGameRoute && games.length === 0) {
      loadGames()
    }
  }, [isInGameRoute])

  // Atualizar índice do jogo atual quando mudar de jogo
  useEffect(() => {
    if (currentGameId && games.length > 0) {
      const index = games.findIndex(g => g.id === currentGameId)
      setCurrentGameIndex(index)
    }
  }, [currentGameId, games])

  const loadGames = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/games?limit=100')
      
      if (response.data.status && response.data.data?.games) {
        const gamesList = response.data.data.games
        setGames(gamesList)
      } else if (response.data.status && response.data.data?.items) {
        setGames(response.data.data.items)
      }
    } catch (error) {
      console.error('Erro ao carregar jogos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const navigateToGame = (direction: 'prev' | 'next' | 'random') => {
    if (games.length === 0) {
      toast.error('Carregando jogos...')
      return
    }

    let targetGame: Game | null = null

    if (direction === 'random') {
      // Jogo aleatório (diferente do atual)
      const availableGames = games.filter(g => g.id !== currentGameId)
      if (availableGames.length > 0) {
        targetGame = availableGames[Math.floor(Math.random() * availableGames.length)]
      }
    } else {
      // Navegação sequencial
      let targetIndex = currentGameIndex

      if (direction === 'prev') {
        targetIndex = currentGameIndex > 0 
          ? currentGameIndex - 1 
          : games.length - 1 // Volta para o último
      } else {
        targetIndex = currentGameIndex < games.length - 1 
          ? currentGameIndex + 1 
          : 0 // Volta para o primeiro
      }

      targetGame = games[targetIndex]
    }

    if (targetGame) {
      const slug = targetGame.slug || 
                   targetGame.name.toLowerCase()
                     .replace(/[^a-z0-9]+/g, '-')
                     .replace(/^-+|-+$/g, '')
      
      const newUrl = `/games/${targetGame.id}/${slug}`
      
      router.push(newUrl)
      toast.success(`🎮 ${targetGame.name}`, {
        duration: 2000,
        position: 'top-center',
      })
    } else {
      console.error('targetGame não encontrado')
    }
  }

  const navItems = [
    {
      id: 'home',
      label: 'Início',
      icon: Home,
      href: '/home',
      color: 'text-purple-400',
    },
    {
      id: 'deposit',
      label: 'Depositar',
      icon: ArrowDownToLine,
      isSpecial: true,
      onClick: onOpenDeposit,
    },
    {
      id: 'referral',
      label: 'Indicação',
      icon: Users,
      onClick: () => setShowReferralModal(true),
      color: 'text-green-400',
    },
  ]

  const isActive = (href?: string) => {
    if (!href) return false
    return pathname === href
  }

  return (
    <>
      {/* Modal de Indicação */}
      <ReferralModal 
        isOpen={showReferralModal} 
        onClose={() => setShowReferralModal(false)} 
      />
      
      {/* Spacer para evitar que o conteúdo fique por baixo do menu */}
      <div className="h-16 md:h-0" />
      
      {/* Bottom Navigation */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed bottom-0 left-0 right-0 md:hidden border-t border-gold-500/30 shadow-2xl backdrop-blur-md"
        style={{ 
          backgroundColor: '#0a0a0a',
          zIndex: 9999,
          isolation: 'isolate',
          pointerEvents: 'auto',
          WebkitTransform: 'translateZ(0)',
          transform: 'translateZ(0)'
        }}
      >
        <AnimatePresence mode="wait">
          {isInGameRoute ? (
            /* MODO JOGO: Navegação entre jogos */
            <motion.div
              key="game-nav"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between px-6 py-2.5"
            >
              {/* Seta Esquerda - Jogo Anterior */}
              <motion.button
                onClick={() => navigateToGame('prev')}
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
                disabled={isLoading || games.length === 0}
                className="relative p-1.5 rounded-lg border border-gold-500/50 disabled:opacity-30 disabled:cursor-not-allowed group shadow-lg"
                style={{ backgroundColor: '#1a1a1a' }}
              >
                <ChevronLeft size={20} className="text-gold-400 group-hover:text-gold-300 transition-colors" />
                
                {/* Label */}
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gold-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-dark-800 px-2 py-0.5 rounded">
                  ◀️
                </span>
              </motion.button>

              {/* Seta Direita - Próximo Jogo */}
              <motion.button
                onClick={() => navigateToGame('next')}
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.9 }}
                disabled={isLoading || games.length === 0}
                className="relative p-1.5 rounded-lg border border-gold-500/50 disabled:opacity-30 disabled:cursor-not-allowed group shadow-lg"
                style={{ backgroundColor: '#1a1a1a' }}
              >
                <ChevronRight size={20} className="text-gold-400 group-hover:text-gold-300 transition-colors" />
                
                {/* Label */}
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gold-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-dark-800 px-2 py-0.5 rounded">
                  ▶️
                </span>
              </motion.button>
            </motion.div>
          ) : (
            /* MODO NORMAL: Menu padrão */
            <motion.div
              key="normal-nav"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative flex items-center justify-around px-2 py-1"
            >
              {navItems.map((item, index) => {
                const Icon = item.icon
                const active = isActive(item.href)

                // Botão central especial (Depositar)
                if (item.isSpecial) {
                  return (
                    <motion.button
                      key={item.id}
                      onClick={item.onClick}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="relative -mt-3 flex flex-col items-center z-50"
                    >
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center shadow-xl border border-gold-500/50 relative overflow-hidden"
                        style={{ 
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        }}
                      >
                        <motion.div
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0.8, 0.5],
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="absolute inset-0 rounded-full"
                          style={{ 
                            background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                          }}
                        />
                        
                        <Icon size={16} className="relative z-10" style={{ color: '#111827' }} />
                      </div>
                      
                      <span 
                        className="text-[10px] font-black mt-0.5"
                        style={{ 
                          background: 'linear-gradient(to right, #f59e0b, #d97706)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {item.label}
                      </span>
                    </motion.button>
                  )
                }

                // Botões normais
                if (item.onClick && !item.isSpecial) {
                  // Botões com onClick (como Indicação)
                  const isReferralButton = item.id === 'referral'
                  
                  return (
                    <button
                      key={item.id}
                      onClick={item.onClick}
                      className="flex flex-col items-center gap-1 relative group"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        className="relative p-1.5 rounded-lg transition-all hover:bg-gold-500/10"
                      >
                        {/* Badge para Indicação */}
                        {isReferralButton && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5, type: 'spring' }}
                            className="absolute -top-7 -right-2 z-10 min-w-max"
                          >
                            <div className="relative">
                              {/* Pulse effect */}
                              <motion.div
                                animate={{ 
                                  scale: [1, 1.2, 1],
                                  opacity: [0.5, 0.8, 0.5],
                                }}
                                transition={{ 
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                                className="absolute inset-0 bg-green-500/30 rounded-full blur-sm"
                              />
                              
                              {/* Badge */}
                              <div className="relative bg-gradient-to-r from-green-500 to-green-600 px-1.5 py-0.5 rounded-full border border-green-400/50 shadow-lg">
                                <span className="text-[8px] font-black text-white whitespace-nowrap">
                                  R$ 50 GRÁTIS
                                </span>
                              </div>
                              
                              {/* Seta */}
                              <div 
                                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-green-500"
                              />
                            </div>
                          </motion.div>
                        )}
                        
                        <Icon 
                          size={18} 
                          className={item.color}
                        />
                      </motion.div>
                      
                      <span className="text-[10px] font-semibold transition-colors text-gray-400">
                        {item.label}
                      </span>
                    </button>
                  )
                }
                
                // Botões com Link (como Home e Perfil)
                return (
                  <Link
                    key={item.id}
                    href={item.href || '/home'}
                    className="flex flex-col items-center gap-1 relative group"
                    onClick={() => setActiveItem(item.id)}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      className={`relative p-1.5 rounded-lg transition-all ${
                        active 
                          ? 'bg-gold-500/20' 
                          : 'hover:bg-gold-500/10'
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute -top-1 left-1/2 w-8 h-1 rounded-full"
                          style={{ 
                            background: 'linear-gradient(to right, #f59e0b, #d97706)',
                            transform: 'translateX(-50%)',
                          }}
                          transition={{ type: 'spring', damping: 20 }}
                        />
                      )}
                      
                      <Icon 
                        size={18} 
                        className={active ? 'text-gold-400' : item.color}
                      />
                    </motion.div>
                    
                    <span 
                      className={`text-[10px] font-semibold transition-colors ${
                        active ? 'text-gold-400' : 'text-gray-400'
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Linha decorativa superior */}
        <div 
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ 
            background: 'linear-gradient(to right, transparent, #f59e0b, #d97706, #f59e0b, transparent)',
          }}
        />
      </motion.nav>
    </>
  )
}
