'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Game } from '@/types'
import { Heart, Play } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/contexts/PermissionsContext'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { slugify } from '@/lib/utils'
import OptimizedImage from '@/components/common/OptimizedImage'

interface GameCardProps {
  game: Game
  onFavoriteChange?: () => void
  onOpenRegister?: () => void
}

export default function GameCard({ game, onFavoriteChange, onOpenRegister }: GameCardProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { canPlay } = usePermissions()
  const [isFavorite, setIsFavorite] = useState(game?.isFavorite || false)
  const [isLoading, setIsLoading] = useState(false)

  const handlePlay = async () => {
    if (!game) {
      toast.error('Jogo inválido')
      return
    }
    
    if (!isAuthenticated) {
      // Abrir modal de cadastro ao invés de redirecionar
      if (onOpenRegister) {
        onOpenRegister()
      }
      return
    }

    if (!canPlay()) {
      return
    }

    // Navegar para a página do jogo (ela fará o launch)
    const slug = slugify(game.name)
    router.push(`/games/${game.id}/${slug}`)
  }

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation() // Impede que o clique no favorito acione o jogo
    
    if (!game) {
      toast.error('Jogo inválido')
      return
    }
    
    if (!isAuthenticated) {
      // Abrir modal de cadastro ao invés de mostrar toast
      if (onOpenRegister) {
        onOpenRegister()
      }
      return
    }

    try {
      const response = await api.post(`/games/${game.id}/favorite`)
      
      if (response.data.status) {
        setIsFavorite(!isFavorite)
        toast.success(response.data.message || 'Favorito atualizado')
        onFavoriteChange?.()
      }
    } catch (error) {
      console.error('Erro ao favoritar:', error)
      toast.error('Erro ao favoritar jogo')
    }
  }

  return (
    <motion.div
      onClick={handlePlay}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.05,
        y: -8,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
      }}
      whileTap={{ scale: 0.98 }}
      className="group relative rounded-xl overflow-hidden cursor-pointer game-card"
    >
      {/* Borda animada */}
      <div className="absolute inset-0 rounded-xl border-2 border-gold-500/20 group-hover:border-gold-500/60 transition-all duration-300 z-10 pointer-events-none"></div>
      
      {/* Brilho de fundo ao hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-gold-500/0 via-gold-500/0 to-gold-500/0 group-hover:from-gold-500/10 group-hover:via-transparent group-hover:to-purple-500/10 transition-all duration-500 pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      />

      {/* Imagem do Jogo */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-dark-200 to-dark-300">
        <OptimizedImage
          src={
            game?.cover
              ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/uploads/${game.cover}`
              : '/placeholder-game.png'
          }
          alt={game?.name || 'Game'}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
          className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
          quality={85}
        />

        {/* Badge Featured */}
        {game?.isFeatured && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="absolute top-2 left-2 z-20"
          >
            <div className="relative px-3 py-1.5 rounded-lg overflow-hidden shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-gold-500 to-gold-600"></div>
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
              <span className="relative text-white text-xs font-black flex items-center gap-1">
                ⭐ DESTAQUE
              </span>
            </div>
          </motion.div>
        )}

        {/* Botão Favoritar */}
        <motion.button
          onClick={handleFavorite}
          whileHover={{ scale: 1.15, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-2 right-2 p-2 rounded-full z-20 favorite-btn"
        >
          <Heart
            size={18}
            className={isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}
          />
        </motion.button>

        {/* Overlay com Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 flex flex-col items-center justify-center gap-3 transition-all duration-300 pointer-events-none"
        >
          {/* Ícone de Play */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="play-button"
          >
            {isLoading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                <span className="text-white text-sm font-semibold">Carregando...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shadow-xl">
                  <Play size={24} className="fill-white text-white ml-0.5" />
                </div>
                <span className="text-white text-sm font-bold tracking-wider">JOGAR</span>
              </div>
            )}
          </motion.div>

          {/* Info adicional ao hover */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center px-4"
          >
            <p className="text-white text-base font-bold drop-shadow-lg">{game?.name || 'Game'}</p>
            <p className="text-gold-400 text-xs font-semibold mt-1">
              {typeof game?.provider === 'string' 
                ? game.provider 
                : (game?.provider as any)?.name || 'Provider'}
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Info do Jogo (sempre visível) */}
      <div className="relative p-3 bg-gradient-to-br from-dark-100 to-dark-200 border-t border-gold-500/20">
        <h3 className="font-bold text-white truncate text-sm group-hover:text-gold-400 transition-colors">
          {game?.name || 'Game'}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-400 truncate">
            {typeof game?.provider === 'string' 
              ? game.provider 
              : (game?.provider as any)?.name || 'Provider'}
          </p>
          {(game as any)?.status === 1 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] text-green-400 font-semibold">Online</span>
            </span>
          )}
        </div>
      </div>

      <style jsx>{`
        .game-card {
          background: linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(26, 26, 26, 0.95) 100%);
          box-shadow: 
            0 4px 15px rgba(0, 0, 0, 0.5),
            0 0 20px rgba(245, 158, 11, 0.1);
          transition: all 0.3s ease;
        }

        .game-card:hover {
          box-shadow: 
            0 8px 30px rgba(0, 0, 0, 0.7),
            0 0 40px rgba(245, 158, 11, 0.3),
            inset 0 0 60px rgba(245, 158, 11, 0.05);
        }

        .favorite-btn {
          background: linear-gradient(135deg, rgba(10, 10, 10, 0.8) 0%, rgba(26, 26, 26, 0.8) 100%);
          border: 2px solid rgba(245, 158, 11, 0.3);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .favorite-btn:hover {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(234, 179, 8, 0.2) 100%);
          border-color: rgba(245, 158, 11, 0.6);
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.4);
        }

        .play-button {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          border-radius: 14px;
          font-weight: 900;
          font-size: 15px;
          letter-spacing: 0.5px;
          color: #111827;
          background: linear-gradient(135deg, #f59e0b 0%, #eab308 100%);
          border: 3px solid rgba(255, 255, 255, 0.3);
          box-shadow: 
            0 0 0 2px rgba(245, 158, 11, 0.8),
            0 4px 15px rgba(245, 158, 11, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .play-button:hover {
          border-color: rgba(255, 255, 255, 0.5);
          box-shadow: 
            0 0 0 3px rgba(245, 158, 11, 1),
            0 6px 25px rgba(245, 158, 11, 0.7),
            inset 0 1px 0 rgba(255, 255, 255, 0.4),
            inset 0 -1px 0 rgba(0, 0, 0, 0.3);
          transform: translateY(-2px) scale(1.02);
        }

        .play-button:active {
          transform: translateY(0) scale(0.98);
          box-shadow: 
            0 0 0 2px rgba(245, 158, 11, 0.8),
            0 2px 10px rgba(245, 158, 11, 0.5),
            inset 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .play-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none !important;
        }

        .play-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          transition: left 0.5s;
        }

        .play-button:hover::before {
          left: 100%;
        }

        .play-button::after {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 16px;
          padding: 2px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), transparent, rgba(245, 158, 11, 0.3));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .play-button:hover::after {
          opacity: 1;
        }
      `}</style>
    </motion.div>
  )
}

