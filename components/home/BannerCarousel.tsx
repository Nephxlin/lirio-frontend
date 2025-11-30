'use client'

import { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import { Banner } from '@/types'
import api from '@/lib/api'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getImageUrl } from '@/lib/image-utils'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    try {
      const response = await api.get('/settings/banners')
      if (response.data.status && response.data.data) {
        setBanners(response.data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar banners:', error)
      // Não mostrar erro ao usuário, apenas não exibir banners
      setBanners([])
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full h-64 md:h-96 skeleton rounded-xl"></div>
    )
  }

  if (banners.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full banner-carousel-container"
    >
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={20}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation
        loop={banners.length > 1}
        className="rounded-xl overflow-hidden banner-swiper"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div
              className="relative w-full h-64 md:h-96 cursor-pointer group overflow-hidden"
              onClick={() => {
                if (banner.link) {
                  window.open(banner.link, '_blank')
                }
              }}
            >
              {/* Background gradiente sempre visível */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f172a]" />
              
              {/* Imagem do banner */}
              <img
                src={getImageUrl(banner.image)}
                alt={banner.title}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                onLoad={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
                onError={(e) => {
                  // Previne loop infinito - remove o handler de erro após a primeira falha
                  e.currentTarget.onerror = null
                  // Esconde a imagem suavemente para mostrar o gradiente
                  e.currentTarget.style.opacity = '0'
                }}
                style={{ opacity: 0 }}
              />
              
              {/* Overlay escuro sobre a imagem para melhor legibilidade do texto */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                <div className="absolute bottom-0 left-0 p-6 md:p-8">
                  <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">
                    {banner.title}
                  </h3>
                  {banner.description && (
                    <p className="text-white/90 text-sm md:text-base max-w-2xl">
                      {banner.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Estilos customizados para os botões de navegação */}
      <style jsx global>{`
        /* Botões de navegação (setas) */
        .banner-swiper .swiper-button-prev,
        .banner-swiper .swiper-button-next {
          width: 40px !important;
          height: 40px !important;
          background: linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(26, 26, 26, 0.95) 100%) !important;
          border: 2px solid rgba(245, 158, 11, 0.5) !important;
          border-radius: 12px !important;
          backdrop-filter: blur(10px) !important;
          -webkit-backdrop-filter: blur(10px) !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5), 0 0 20px rgba(245, 158, 11, 0.2) !important;
        }

        .banner-swiper .swiper-button-prev:hover,
        .banner-swiper .swiper-button-next:hover {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(234, 179, 8, 0.2) 100%) !important;
          border-color: rgba(245, 158, 11, 0.8) !important;
          transform: scale(1.1) !important;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 30px rgba(245, 158, 11, 0.4) !important;
        }

        .banner-swiper .swiper-button-prev:active,
        .banner-swiper .swiper-button-next:active {
          transform: scale(0.95) !important;
        }

        /* Setas customizadas (menor) */
        .banner-swiper .swiper-button-prev:after,
        .banner-swiper .swiper-button-next:after {
          font-size: 18px !important;
          font-weight: bold !important;
          color: #f59e0b !important;
        }

        /* Desabilitado */
        .banner-swiper .swiper-button-disabled {
          opacity: 0.3 !important;
          cursor: not-allowed !important;
          border-color: rgba(75, 85, 99, 0.5) !important;
        }

        .banner-swiper .swiper-button-disabled:after {
          color: #6b7280 !important;
        }

        /* Paginação (bolinhas) */
        .banner-swiper .swiper-pagination-bullet {
          width: 10px !important;
          height: 10px !important;
          background: rgba(255, 255, 255, 0.4) !important;
          opacity: 1 !important;
          transition: all 0.3s ease !important;
          border: 2px solid transparent !important;
        }

        .banner-swiper .swiper-pagination-bullet-active {
          background: linear-gradient(135deg, #f59e0b 0%, #eab308 100%) !important;
          border-color: rgba(245, 158, 11, 0.5) !important;
          width: 28px !important;
          border-radius: 5px !important;
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.6) !important;
        }

        /* Ajuste de posicionamento */
        .banner-swiper .swiper-button-prev {
          left: 12px !important;
        }

        .banner-swiper .swiper-button-next {
          right: 12px !important;
        }

        /* Animação de brilho */
        @keyframes shine {
          0% {
            background-position: -100% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .banner-swiper .swiper-button-prev:hover:before,
        .banner-swiper .swiper-button-next:hover:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          background-size: 200% 100%;
          animation: shine 1.5s infinite;
          border-radius: 10px;
        }

        /* Responsivo - Mobile */
        @media (max-width: 640px) {
          .banner-swiper .swiper-button-prev,
          .banner-swiper .swiper-button-next {
            width: 32px !important;
            height: 32px !important;
          }

          .banner-swiper .swiper-button-prev:after,
          .banner-swiper .swiper-button-next:after {
            font-size: 14px !important;
          }

          .banner-swiper .swiper-button-prev {
            left: 8px !important;
          }

          .banner-swiper .swiper-button-next {
            right: 8px !important;
          }
        }
      `}</style>
    </motion.div>
  )
}

