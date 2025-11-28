'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import BannerCarousel from '@/components/home/BannerCarousel'
import { useAuth } from '@/contexts/AuthContext'
import { useKwaiPageView } from '@/lib/hooks/useKwaiPageView'
import api from '@/lib/api'

// Dynamic imports para componentes pesados (lazy loading)
const WinningBetsCarousel = dynamic(() => import('@/components/home/WinningBetsCarousel'), {
  loading: () => <div className="h-24 bg-dark-100/50 animate-pulse rounded-lg" />,
  ssr: true,
})
const CategoriesSection = dynamic(() => import('@/components/home/CategoriesSection'), {
  loading: () => (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-dark-100/50 animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  ),
  ssr: true,
})
const LoginModal = dynamic(() => import('@/components/modals/LoginModal'), {
  loading: () => null,
  ssr: false,
})

export default function HomePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [referrerInfo, setReferrerInfo] = useState<any>(null)
  
  // 🔥 Rastrear visualização da página home
  useKwaiPageView('home_page', { content_type: 'landing_page' })

  // Detectar código de referência na URL
  useEffect(() => {
    const refCode = searchParams.get('ref')
    if (refCode) {
      setReferralCode(refCode)
      // Buscar informações do indicador
      api.get(`/profile/referrer/${refCode}`)
        .then(response => {
          if (response.data.status) {
            setReferrerInfo(response.data.data)
          }
        })
        .catch(error => {
          console.error('Erro ao buscar indicador:', error)
        })
    }
  }, [searchParams])

  // Mostrar modal de login automaticamente se não estiver autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // Se tem código de referência, mostrar imediatamente
      // Senão, aguardar um pouco antes de mostrar o modal
      const delay = referralCode ? 100 : 500
      const timer = setTimeout(() => {
        setShowLoginModal(true)
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, authLoading, referralCode])

  return (
    <div className="min-h-screen">
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        initialMode="register"
        referralCode={referralCode}
        referrerInfo={referrerInfo}
      />

      {/* Banner Carousel */}
      <div className="container mx-auto px-4 py-6">
        <BannerCarousel />
      </div>

      {/* Carrossel de Vitórias Recentes */}
      <WinningBetsCarousel />

      {/* Categorias de Jogos */}
      <CategoriesSection 
        onOpenRegister={() => setShowLoginModal(true)}
      />
    </div>
  )
}

