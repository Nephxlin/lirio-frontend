'use client'

import { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { Trophy, TrendingUp, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/autoplay'

interface GameWin {
  id: number
  playerName: string
  amount: number
  multiplier: number
  time: string
}

// Gerar dados fictícios de vitórias no jogo atual
const generateFakeGameWins = (gameName: string): GameWin[] => {
  const playerNames = [
    'João S.', 'Maria O.', 'Pedro L.', 'Ana C.', 'Carlos M.',
    'Juliana F.', 'Rafael B.', 'Camila R.', 'Lucas V.', 'Beatriz A.',
  ]

  const wins: GameWin[] = []

  for (let i = 0; i < 10; i++) {
    const amount = Math.floor(Math.random() * 600) + 30 // R$ 30 a R$ 630
    const multiplier = (Math.random() * 40 + 2).toFixed(2) // 2x a 42x
    const minutesAgo = Math.floor(Math.random() * 20) // 0-20 minutos atrás

    wins.push({
      id: i + 1,
      playerName: playerNames[Math.floor(Math.random() * playerNames.length)],
      amount,
      multiplier: parseFloat(multiplier),
      time: getTimeAgo(minutesAgo),
    })
  }

  return wins
}

const getTimeAgo = (minutes: number): string => {
  if (minutes === 0) return 'Agora'
  if (minutes === 1) return '1 min'
  if (minutes < 60) return `${minutes} min`
  return 'recente'
}

interface GameWinsCarouselProps {
  gameName: string
  isVisible: boolean
  isVertical?: boolean
}

export default function GameWinsCarousel({ gameName, isVisible, isVertical = false }: GameWinsCarouselProps) {
  const [gameWins, setGameWins] = useState<GameWin[]>([])
  const [onlinePlayers, setOnlinePlayers] = useState<number>(0)

  useEffect(() => {
    // Gerar vitórias fictícias
    setGameWins(generateFakeGameWins(gameName))

    // Recuperar ou definir número inicial de jogadores online do localStorage
    const storedPlayers = localStorage.getItem('onlinePlayers')
    const initialPlayers = storedPlayers 
      ? parseInt(storedPlayers, 10)
      : Math.floor(Math.random() * 200) + 150 // Entre 150 e 350
    
    setOnlinePlayers(initialPlayers)

    // Atualizar vitórias a cada 8 segundos
    const winsInterval = setInterval(() => {
      setGameWins(generateFakeGameWins(gameName))
    }, 8000)

    // Atualizar jogadores online a cada 3-5 segundos (mais frequente)
    const playersInterval = setInterval(() => {
      setOnlinePlayers(prev => {
        // Variar entre -5 a +8 jogadores
        const change = Math.floor(Math.random() * 14) - 5
        const newCount = prev + change
        // Manter entre 100 e 500 jogadores
        const finalCount = Math.max(100, Math.min(500, newCount))
        
        // Salvar no localStorage
        localStorage.setItem('onlinePlayers', finalCount.toString())
        
        return finalCount
      })
    }, Math.random() * 2000 + 3000) // Entre 3-5 segundos

    return () => {
      clearInterval(winsInterval)
      clearInterval(playersInterval)
    }
  }, [gameName])

  if (gameWins.length === 0) {
    return null
  }

  // Renderização Vertical (Desktop)
  if (isVertical) {
    return (
      <div className="h-full flex flex-col bg-dark-100 overflow-hidden">
        {/* Header fixo */}
        <div className="p-4 border-b border-gold-500/30 bg-dark-200/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="text-gold-500" size={16} />
            <h4 className="text-white font-bold text-sm">Vitórias Recentes</h4>
            <TrendingUp className="text-green-500 animate-pulse" size={14} />
          </div>
          
          {/* Badge de Jogadores Online */}
          <motion.div
            key={onlinePlayers}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/40"
          >
            <Users className="text-green-400" size={14} />
            <span className="text-green-400 font-bold text-sm">
              {onlinePlayers.toLocaleString('pt-BR')}
            </span>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          </motion.div>
        </div>

        {/* Timeline Vertical */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
          {gameWins.map((win, index) => (
            <motion.div
              key={`${win.id}-${index}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              <div className="card p-3 bg-gradient-to-br from-dark-300/90 to-dark-200/90 border border-gold-500/20 hover:border-gold-500/50 transition-all hover:scale-105 cursor-pointer group">
                {/* Avatar e Nome */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-casino flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg">
                    {win.playerName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">
                      {win.playerName}
                    </p>
                    <p className="text-xs text-dark-400">{win.time}</p>
                  </div>
                </div>

                {/* Valor e Multiplicador */}
                <div className="flex items-center justify-between pt-2 border-t border-gold-500/20">
                  <div>
                    <p className="text-xs text-dark-400 mb-0.5">Ganhou</p>
                    <p className="text-green-500 font-bold text-lg">
                      {formatCurrency(win.amount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-dark-400 mb-0.5">Multi</p>
                    <p className="text-gold-500 font-bold text-lg">
                      {win.multiplier}x
                    </p>
                  </div>
                </div>

                {/* Indicator */}
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gold-500 animate-pulse shadow-lg shadow-gold-500/50"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  // Renderização Horizontal (Mobile)
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full bg-gradient-to-r from-dark-100/95 via-dark-200/95 to-dark-100/95 backdrop-blur-sm border-y border-gold-500/20 relative z-50"
        >
          <div className="px-3 py-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Trophy className="text-gold-500" size={14} />
                <h4 className="text-white font-semibold text-xs">Vitórias Recentes</h4>
                <TrendingUp className="text-green-500 animate-pulse" size={12} />
              </div>
              
              {/* Badge de Jogadores Online */}
              <motion.div
                key={onlinePlayers}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/40 backdrop-blur-sm"
              >
                <Users className="text-green-400" size={12} />
                <span className="text-green-400 font-bold text-[11px]">
                  {onlinePlayers.toLocaleString('pt-BR')}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
              </motion.div>
            </div>

            <Swiper
              modules={[Autoplay]}
              spaceBetween={8}
              slidesPerView="auto"
              autoplay={{
                delay: 1,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={true}
              speed={4000}
              allowTouchMove={true}
              className="game-wins-swiper"
            >
              {[...gameWins, ...gameWins].map((win, index) => (
                <SwiperSlide key={`${win.id}-${index}`} style={{ width: 'auto' }}>
                  <div className="card p-2 min-w-[200px] bg-gradient-to-br from-dark-300/80 to-dark-200/80 border border-gold-500/20 hover:border-gold-500/40 transition-all group backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-gradient-casino flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {win.playerName.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-semibold text-xs truncate">
                            {win.playerName}
                          </p>
                          <p className="text-[10px] text-dark-400">{win.time}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-green-500 font-bold text-sm">
                          {formatCurrency(win.amount)}
                        </p>
                        <p className="text-[10px] text-gold-500 font-semibold">
                          {win.multiplier}x
                        </p>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <style jsx global>{`
            .game-wins-swiper .swiper-slide {
              width: auto !important;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

