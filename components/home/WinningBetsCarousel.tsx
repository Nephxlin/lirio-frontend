'use client'

import { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { Trophy, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/autoplay'

interface WinningBet {
  id: number
  playerName: string
  gameName: string
  amount: number
  multiplier: number
  time: string
}

// Gerar dados fictícios de apostas ganhas
const generateFakeWinningBets = (): WinningBet[] => {
  const playerNames = [
    'João S.', 'Maria O.', 'Pedro L.', 'Ana C.', 'Carlos M.',
    'Juliana F.', 'Rafael B.', 'Camila R.', 'Lucas V.', 'Beatriz A.',
    'Fernando P.', 'Patricia G.', 'Diego S.', 'Amanda T.', 'Rodrigo N.',
    'Mariana L.', 'Gabriel K.', 'Larissa D.', 'Thiago W.', 'Isabela H.'
  ]

  const gameNames = [
    'Fortune Tiger', 'Fortune Ox', 'Fortune Dragon', 'Fortune Rabbit',
    'Fortune Mouse', 'Bikini Paradise', 'Jungle Delight', 'Ganesha Gold',
    'Double Fortune', 'Dragon Tiger Luck', 'Wild Bandito', 'Ninja Raccoon',
    'Lucky Clover', 'Cash Mania', 'Butterfly Blossom'
  ]

  const bets: WinningBet[] = []
  const now = Date.now()

  for (let i = 0; i < 15; i++) {
    const amount = Math.floor(Math.random() * 800) + 20 // R$ 20 a R$ 820
    const multiplier = (Math.random() * 50 + 2).toFixed(2) // 2x a 52x
    const minutesAgo = Math.floor(Math.random() * 30) // 0-30 minutos atrás

    bets.push({
      id: i + 1,
      playerName: playerNames[Math.floor(Math.random() * playerNames.length)],
      gameName: gameNames[Math.floor(Math.random() * gameNames.length)],
      amount,
      multiplier: parseFloat(multiplier),
      time: getTimeAgo(minutesAgo),
    })
  }

  return bets
}

const getTimeAgo = (minutes: number): string => {
  if (minutes === 0) return 'Agora mesmo'
  if (minutes === 1) return '1 minuto atrás'
  if (minutes < 60) return `${minutes} minutos atrás`
  return 'há pouco tempo'
}

export default function WinningBetsCarousel() {
  const [winningBets, setWinningBets] = useState<WinningBet[]>([])

  useEffect(() => {
    // Gerar apostas fictícias
    setWinningBets(generateFakeWinningBets())

    // Atualizar apostas a cada 10 segundos para simular tempo real
    const interval = setInterval(() => {
      setWinningBets(generateFakeWinningBets())
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  if (winningBets.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-dark-100 border-y border-dark-200 py-4"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="text-gold-500" size={20} />
          <h3 className="text-white font-semibold">Saques Recentes</h3>
          <TrendingUp className="text-green-500 animate-pulse" size={16} />
        </div>

        <Swiper
          modules={[Autoplay]}
          spaceBetween={16}
          slidesPerView="auto"
          autoplay={{
            delay: 1,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          loop={true}
          speed={5000}
          allowTouchMove={true}
          className="winning-bets-swiper"
        >
          {[...winningBets, ...winningBets].map((bet, index) => (
            <SwiperSlide key={`${bet.id}-${index}`} style={{ width: 'auto' }}>
              <div className="card p-3 min-w-[280px] bg-gradient-to-br from-dark-200 to-dark-100 border border-gold-500/20 hover:border-gold-500/40 transition-all cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-casino flex items-center justify-center text-white text-xs font-bold">
                      {bet.playerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {bet.playerName}
                      </p>
                      <p className="text-xs text-dark-400">{bet.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className=" text-green-500 font-bold text-lg">
                      {formatCurrency(bet.amount)}
                    </p>
                    <p className="text-xs  text-gold-500 font-semibold">
                      {bet.multiplier}x
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-dark-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-sm text-dark-400 truncate">
                    ganhou em{' '}
                    <span className="text-white font-medium">{bet.gameName}</span>
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .winning-bets-swiper .swiper-slide {
          width: auto !important;
        }
      `}</style>
    </motion.div>
  )
}

