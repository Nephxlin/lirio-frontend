'use client'

import { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, FreeMode } from 'swiper/modules'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import GameCard from '../games/GameCard'
import OptimizedImage from '../common/OptimizedImage'
import api from '@/lib/api'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/free-mode'

interface Game {
  id: number
  name: string
  code: string
  cover: string | null
  banner: string | null
  status: number
  provider: {
    id: number
    name: string
    code: string
  }
}

interface Category {
  id: number
  name: string
  description: string | null
  image: string | null
  slug: string
  games: Game[]
}

interface CategoriesSectionProps {
  onOpenRegister?: () => void
}

export default function CategoriesSection({ onOpenRegister }: CategoriesSectionProps = {}) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await api.get('/settings/categories-with-games?limit=15')
      if (response.data.status) {
        // Normalizar dados da API
        const normalizedCategories = (response.data.data || []).map((cat: any) => ({
          ...cat,
          games: (cat.games || []).map((game: any) => ({
            id: game.id,
            name: game.name || game.gameName,
            code: game.code || game.gameCode,
            cover: game.cover || game.banner,
            banner: game.banner || game.cover,
            status: game.status,
            provider: game.provider || { id: 0, name: 'Unknown', code: 'unknown' },
          })),
        }))
        setCategories(normalizedCategories)
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-12">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="category-section"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500/20 to-gold-700/20 border border-gold-500/30 animate-pulse"></div>
                  <div className="h-8 bg-gradient-to-r from-dark-200 via-dark-300 to-dark-200 rounded-lg w-48 animate-pulse"></div>
                </div>
                <div className="flex gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-dark-200 to-dark-300 border border-gold-500/20 animate-pulse"></div>
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-dark-200 to-dark-300 border border-gold-500/20 animate-pulse"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.1 + j * 0.05 }}
                    className="aspect-[3/4] bg-gradient-to-br from-dark-200 via-dark-300 to-dark-200 rounded-lg border border-gold-500/10 animate-pulse"
                  ></motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {categories.map((category, index) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="relative category-section"
        >
          {/* Category Header */}
          <div className="flex items-center justify-between mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
            >
              <div className="flex items-center gap-3 mb-2">
                {category.image && (
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500/20 to-gold-700/20 border border-gold-500/30 p-2 flex items-center justify-center overflow-hidden"
                  >
                    <OptimizedImage
                      src={category.image}
                      alt={category.name}
                      width={40}
                      height={40}
                      className="object-contain"
                      quality={90}
                    />
                  </motion.div>
                )}
                <h2 className="text-3xl font-black bg-gradient-to-r from-gold-400 via-gold-200 to-gold-400 bg-clip-text text-transparent">
                  {category.name}
                </h2>
              </div>
              {category.description && (
<>             
<p className="text-white text-sm">{category.description}</p>

</>   
              )}
            </motion.div>
            {category.games && category.games.length > 6 && (
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.1, x: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className={`swiper-button-prev-${category.id} category-nav-btn group`}
                >
                  <ChevronLeft size={20} className="text-gold-400 group-hover:text-gold-300 transition-colors" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6, ease: 'linear' }}
                  />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, x: 3 }}
                  whileTap={{ scale: 0.95 }}
                  className={`swiper-button-next-${category.id} category-nav-btn group`}
                >
                  <ChevronRight size={20} className="text-gold-400 group-hover:text-gold-300 transition-colors" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6, ease: 'linear' }}
                  />
                </motion.button>
              </div>
            )}
          </div>

          {/* Games Carousel */}
          {category.games && category.games.length > 0 ? (
            <Swiper
              modules={[Navigation, FreeMode]}
              spaceBetween={16}
              slidesPerView={2}
              freeMode={true}
              navigation={{
                prevEl: `.swiper-button-prev-${category.id}`,
                nextEl: `.swiper-button-next-${category.id}`,
              }}
              breakpoints={{
                640: {
                  slidesPerView: 3,
                },
                768: {
                  slidesPerView: 4,
                },
                1024: {
                  slidesPerView: 5,
                },
                1280: {
                  slidesPerView: 6,
                },
              }}
              className="category-swiper"
            >
              {category.games.map((game) => (
                <SwiperSlide key={game.id}>
                  <GameCard
                    game={{
                      id: game.id,
                      name: game.name,
                      code: game.code,
                      cover: game.cover,
                      banner: game.banner,
                      status: game.status,
                      provider: game.provider,
                      isFavorite: false,
                    } as any}
                    onOpenRegister={onOpenRegister}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <div className="inline-flex flex-col items-center gap-3 px-8 py-6 rounded-2xl bg-gradient-to-br from-dark-200/50 to-dark-300/50 border border-gold-500/20">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-5xl opacity-50"
                >
                  🎮
                </motion.div>
                <p className="text-gray-400 font-medium">Nenhum jogo nesta categoria</p>
                <p className="text-sm text-gray-500">Em breve novos jogos serão adicionados</p>
              </div>
            </motion.div>
          )}
<p className="text-yellow-400 text-sm mt-2">Clique nos cards para Jogar Agora !</p>
          {/* Divider */}
          {index < categories.length - 1 && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: index * 0.1 + 0.4 }}
              className="mt-12"
            >
              <div className="h-[2px] bg-gradient-to-r from-transparent via-gold-500/30 to-transparent relative overflow-hidden">
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-400/50 to-transparent"
                />
              </div>
            </motion.div>
          )}
        </motion.div>
      ))}

      <style jsx global>{`
        /* Category Navigation Buttons */
        .category-nav-btn {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(26, 26, 26, 0.95) 100%);
          border: 2px solid rgba(245, 158, 11, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4), 0 0 20px rgba(245, 158, 11, 0.15);
          overflow: hidden;
        }

        .category-nav-btn:hover {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(234, 179, 8, 0.15) 100%);
          border-color: rgba(245, 158, 11, 0.7);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5), 0 0 30px rgba(245, 158, 11, 0.3);
        }

        .category-nav-btn:active {
          transform: scale(0.95);
        }

        .category-swiper .swiper-slide {
          height: auto;
        }

        .category-swiper .swiper-button-disabled {
          opacity: 0.3;
          cursor: not-allowed;
          border-color: rgba(75, 85, 99, 0.4) !important;
        }

        .category-swiper .swiper-button-disabled svg {
          color: #6b7280 !important;
        }

        /* Category Section Hover Effect */
        .category-section {
          padding: 24px;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(10, 10, 10, 0.3) 0%, rgba(26, 26, 26, 0.3) 100%);
          border: 1px solid rgba(245, 158, 11, 0.1);
          transition: all 0.4s ease;
        }

        .category-section:hover {
          background: linear-gradient(135deg, rgba(10, 10, 10, 0.5) 0%, rgba(26, 26, 26, 0.5) 100%);
          border-color: rgba(245, 158, 11, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 40px rgba(245, 158, 11, 0.1);
        }

        /* Loading Skeleton Premium */
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .animate-pulse {
          background: linear-gradient(
            90deg,
            rgba(26, 26, 26, 0.5) 0%,
            rgba(50, 50, 50, 0.5) 50%,
            rgba(26, 26, 26, 0.5) 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }

        /* Responsivo */
        @media (max-width: 640px) {
          .category-nav-btn {
            width: 36px;
            height: 36px;
          }

          .category-section {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  )
}

