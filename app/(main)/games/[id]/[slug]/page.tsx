'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { X, Loader2, Trophy, EyeOff, ArrowLeft, Gamepad2 } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
// import { useKwaiPageView } from '@/lib/hooks/useKwaiPageView' // Não é mais necessário - contentView dispara automaticamente
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import GameWinsCarousel from '@/components/games/GameWinsCarousel'

interface Game {
  id: number
  name: string
  slug: string
  cover: string
  categoryId?: number
  categories?: Array<{ id: number; name: string; slug: string }>
}

export default function GamePage() {
  const router = useRouter()
  const params = useParams()
  const [gameUrl, setGameUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gameName, setGameName] = useState<string>('')
  const [showWinsCarousel, setShowWinsCarousel] = useState(true)
  const [showBalance, setShowBalance] = useState(false)
  const [categoryGames, setCategoryGames] = useState<Game[]>([])
  const [currentCategoryId, setCurrentCategoryId] = useState<number | null>(null)
  const { wallet, getTotalBalance } = useWallet()
  const toastShownRef = useRef(false) // Flag para garantir que toast apareça apenas uma vez
  
  // 🔥 Rastrear visualização da página de jogo (DESATIVADO - contentView dispara automaticamente no KwaiPixelLoader)
  // useKwaiPageView('game_play', { 
  //   content_type: 'game', 
  //   content_id: params.id as string,
  //   content_name: params.slug as string 
  // })

  useEffect(() => {
    const launchGame = async () => {
      try {
        setIsLoading(true)
        const gameId = params.id
        const slug = params.slug
        
        if (!gameId) {
          router.push('/home')
          return
        }

        // Extrair nome do jogo do slug
        if (slug && typeof slug === 'string') {
          const name = slug.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')
          setGameName(name)
        }

        // Fazer requisição para lançar o jogo
        const response = await api.post(`/games/${gameId}/launch`)
        
        if (response.data.status && response.data.data?.gameUrl) {
          setGameUrl(response.data.data.gameUrl)
          
          // Buscar informações do jogo para pegar a categoria
          try {
            const gameInfoResponse = await api.get(`/games/${gameId}`)
            
            if (gameInfoResponse.data.status && gameInfoResponse.data.data) {
              const gameData = gameInfoResponse.data.data
              
              // Um jogo pode ter múltiplas categorias, vamos pegar a primeira
              if (gameData.categories && gameData.categories.length > 0) {
                const firstCategory = gameData.categories[0]
                const categoryId = firstCategory.id
                
                setCurrentCategoryId(categoryId)
                
                // Buscar jogos da mesma categoria
                const categoryGamesResponse = await api.get(`/games?categoryId=${categoryId}&limit=50`)
                
                if (categoryGamesResponse.data.status && categoryGamesResponse.data.data?.games) {
                  const allGames = categoryGamesResponse.data.data.games
                  
                  // Filtrar apenas jogos com cover/thumbnail
                  const gamesWithCovers = allGames.filter((g: Game) => !!g.cover)
                  
                  setCategoryGames(gamesWithCovers)
                }
              }
            }
          } catch (err) {
            console.error('Erro ao buscar jogos da categoria:', err)
          }
          
          // Toast informativo após carregar o jogo (apenas uma vez)
          if (!toastShownRef.current) {
            toastShownRef.current = true
            setTimeout(() => {
              toast('💡 Em caso de erro atualizar a tela ou usar as setas para trocar de jogos', {
                duration: 5000,
                position: 'bottom-center',
                icon: '🎮',
                style: {
                  background: '#1a1a1a',
                  color: '#f59e0b',
                  border: '2px solid rgba(245, 158, 11, 0.3)',
                  fontWeight: 'bold',
                  fontSize: '13px',
                },
              })
            }, 2000) // Mostra após 2 segundos do jogo carregar
          }
        } else {
          setError('Erro ao obter URL do jogo')
          toast.error('Erro ao carregar jogo')
        }
      } catch (error: any) {
        console.error('Erro ao lançar jogo:', error)
        setError(error.response?.data?.error || 'Erro ao carregar jogo')
        toast.error(error.response?.data?.error || 'Erro ao carregar jogo')
        
        // Redirecionar para home após 3 segundos
        setTimeout(() => {
          router.push('/home')
        }, 3000)
      } finally {
        setIsLoading(false)
      }
    }

    launchGame()
  }, [params.id, router])

  const handleClose = () => {
    // Voltar para a home
    router.push('/home')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-gold-500 mx-auto mb-4" />
          <p className="text-white text-lg">Iniciando jogo...</p>
        </div>
      </div>
    )
  }

  if (error || !gameUrl) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <X size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-white text-lg mb-4">{error || 'Erro ao carregar jogo'}</p>
          <button
            onClick={() => router.push('/home')}
            className="btn-gold"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-black flex flex-col relative overflow-hidden">
      {/* Header do Jogo - Apenas Mobile */}
      <div className="md:hidden bg-dark-100 border-b border-dark-200 px-4 py-2.5 flex items-center justify-between relative z-50 flex-shrink-0">
        <button
          onClick={handleClose}
          className="flex items-center gap-2 text-white hover:text-red-400 transition"
        >
          <ArrowLeft size={20} />
          <span className=" sm:inline text-sm">Voltar </span>
        </button>
        
        {/* Saldo Total */}
        {wallet && (
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-dark-300/80 to-dark-200/80 backdrop-blur-md border border-gold-500/30 shadow-lg shadow-gold-500/10 hover:border-gold-500/50 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          >
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-gold-500 to-gold-400 animate-pulse group-hover:scale-110 transition-transform"></div>
            </div>
            <span className="text-sm font-bold bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 bg-clip-text text-transparent min-w-[80px] text-center">
              {showBalance ? formatCurrency(getTotalBalance()) : '••••••'}
            </span>
          </button>
        )}
        
        <button
          onClick={() => setShowWinsCarousel(!showWinsCarousel)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-white text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-gold-500/20"
        >
          {showWinsCarousel ? (
            <>
              <EyeOff size={14} />
              <span className="hidden sm:inline">Ocultar Vitórias</span>
              <span className="sm:hidden">Ocultar</span>
            </>
          ) : (
            <>
              <Trophy size={14} />
              <span className="hidden sm:inline">Mostrar Vitórias</span>
              <span className="sm:hidden">Vitórias</span>
            </>
          )}
        </button>
      </div>
      
      {/* Carrossel de Vitórias - Mobile Horizontal */}
      <div className="md:hidden relative z-40 flex-shrink-0">
        <GameWinsCarousel gameName={gameName || 'Este Jogo'} isVisible={showWinsCarousel} />
      </div>

      {/* Layout Desktop: Lista Jogos + Game + Timeline Vertical */}
      <div className="flex-1 flex relative min-h-0 overflow-hidden">
        {/* Lista de Jogos da Categoria - Desktop */}
        <div className="hidden md:flex w-96 bg-dark-100 border-r border-gold-500/30 flex-col flex-shrink-0 overflow-hidden z-10">
          <div className="p-4 border-b border-gold-500/30 bg-dark-200/50 backdrop-blur-sm flex-shrink-0">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Gamepad2 size={16} className="text-gold-500" />
              Jogos da Categoria
            </h3>
            <p className="text-xs text-dark-400 mt-1">{categoryGames.length} jogos</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 min-h-0">
            <div className="grid grid-cols-2 gap-2">
              {categoryGames.map((game) => (
                <button
                  key={game.id}
                  onClick={() => router.push(`/games/${game.id}/${game.slug}`)}
                  className={`p-2 rounded-lg border transition-all hover:scale-105 group ${
                    game.id === parseInt(params.id as string)
                      ? 'border-gold-500 bg-gradient-to-br from-gold-500/20 to-gold-400/20 shadow-lg shadow-gold-500/20'
                      : 'border-gold-500/20 hover:border-gold-500/50 bg-dark-200/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-full aspect-square rounded-lg overflow-hidden border border-gold-500/30 bg-dark-300">
                      <img
                        src={
                          game.cover
                            ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/uploads/${game.cover}`
                            : '/placeholder-game.png'
                        }
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Ctext fill="%23999" font-family="Arial" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E🎮%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                    <p className={`text-xs font-semibold text-center line-clamp-2 transition-colors ${
                      game.id === parseInt(params.id as string)
                        ? 'text-gold-400'
                        : 'text-white group-hover:text-gold-400'
                    }`}>
                      {game.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Game Iframe */}
        <div className="flex-1 relative min-w-0 min-h-0 z-0" style={{ overflow: 'hidden' }}>
          <iframe
            src={gameUrl}
            className="w-full h-full"
            style={{ 
              border: 'none',
              pointerEvents: 'auto'
            }}
            allow="autoplay; fullscreen; payment; clipboard-write"
            allowFullScreen
            title="Game"
          />
        </div>

        {/* Timeline Vertical - Desktop */}
        <div className="hidden md:flex w-80 bg-dark-100 border-l border-gold-500/30 flex-col flex-shrink-0 overflow-hidden z-10">
          <GameWinsCarousel gameName={gameName || 'Este Jogo'} isVisible={true} isVertical={true} />
        </div>
      </div>
    </div>
  )
}

