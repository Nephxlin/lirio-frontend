'use client'

import { useEffect, useState } from 'react'
import { Game, PaginatedResponse } from '@/types'
import GameCard from './GameCard'
import api from '@/lib/api'
import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface GameGridProps {
  searchQuery?: string
  categoryId?: number
  providerId?: number
  onOpenRegister?: () => void
}

export default function GameGrid({
  searchQuery = '',
  categoryId,
  providerId,
  onOpenRegister,
}: GameGridProps = {}) {
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  useEffect(() => {
    setPage(1)
    setGames([])
    loadGames(1, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, categoryId, providerId])

  const loadGames = async (pageNum: number = page, reset: boolean = false) => {
    if (reset) {
      setIsLoading(true)
    } else {
      setIsLoadingMore(true)
    }

    try {
      const params: any = {
        page: pageNum,
        limit: 20,
      }

      if (searchQuery) params.search = searchQuery
      if (categoryId) params.categoryId = categoryId
      if (providerId) params.providerId = providerId

      const response = await api.get('/games', { params })

      if (response.data.status && response.data.data) {
        const data: PaginatedResponse<Game> = response.data.data
        const newGames = data.games || []

        if (reset) {
          setGames(newGames)
        } else {
          setGames((prev) => [...prev, ...newGames])
        }

        setHasMore(data.pagination.page < data.pagination.totalPages)
        setPage(pageNum)
      }
    } catch (error: any) {
      console.error('Erro ao carregar jogos:', error)
      if (reset) {
        setGames([])
      }
      // Não mostrar toast para não poluir a tela
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadGames(page + 1)
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="skeleton h-64 rounded-lg"></div>
        ))}
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-dark-400 text-lg">Nenhum jogo encontrado</p>
      </div>
    )
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      >
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <GameCard
              game={game}
              onFavoriteChange={() => loadGames(1, true)}
              onOpenRegister={onOpenRegister}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Botão Carregar Mais */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            {isLoadingMore ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Carregando...
              </>
            ) : (
              'Carregar Mais'
            )}
          </button>
        </div>
      )}
    </div>
  )
}

