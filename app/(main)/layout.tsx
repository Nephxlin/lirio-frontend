'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BottomNav from '@/components/layout/BottomNav'
import { useAuth } from '@/contexts/AuthContext'

// Dynamic imports para modais pesados (lazy loading)
const DepositModal = dynamic(() => import('@/components/modals/DepositModal'), {
  loading: () => null,
  ssr: false,
})
const WithdrawModal = dynamic(() => import('@/components/modals/WithdrawModal'), {
  loading: () => null,
  ssr: false,
})
const LoginModal = dynamic(() => import('@/components/modals/LoginModal'), {
  loading: () => null,
  ssr: false,
})

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading, isNewUser, setIsNewUser } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginMode, setLoginMode] = useState<'login' | 'register'>('login')

  useEffect(() => {
    // Home é completamente pública - sem redirecionamento
    // Outras páginas podem exigir autenticação se necessário
    if (!isLoading && !isAuthenticated && pathname !== '/home') {
      // Não redireciona - permite acesso público
      // router.push('/home')
    }
  }, [isAuthenticated, isLoading, pathname, router])

  // Abrir modal de depósito para novos usuários
  useEffect(() => {
    if (isNewUser && isAuthenticated && !isLoading) {
      const timer = setTimeout(() => {
        setShowDepositModal(true)
        setIsNewUser(false) // Reset flag
      }, 1000) // Aguarda 1 segundo após o cadastro
      return () => clearTimeout(timer)
    }
  }, [isNewUser, isAuthenticated, isLoading])

  // Remover loading screen - permite acesso imediato
  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-dark-50 flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
  //     </div>
  //   )
  // }

  // Verificar se está em uma página de jogo
  const isGamePage = pathname?.startsWith('/games/')

  return (
    <div className={`${isGamePage ? 'h-screen' : 'min-h-screen'} flex flex-col relative`} style={{ overflow: isGamePage ? 'hidden' : 'auto' }}>
      <Header
        onOpenDeposit={() => setShowDepositModal(true)}
        onOpenWithdraw={() => setShowWithdrawModal(true)}
        onOpenLogin={() => {
          setLoginMode('login')
          setShowLoginModal(true)
        }}
        onOpenRegister={() => {
          setLoginMode('register')
          setShowLoginModal(true)
        }}
      />
      <main className={`flex-1 relative ${isGamePage ? 'overflow-hidden' : ''}`}>{children}</main>
      {!isGamePage && <Footer />}
      
      {/* Bottom Navigation Mobile - Sempre visível e acima de tudo */}
      <BottomNav onOpenDeposit={() => setShowDepositModal(true)} />

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        initialMode={loginMode}
      />
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
      />
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
      />
    </div>
  )
}

