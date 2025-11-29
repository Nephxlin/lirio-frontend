'use client'

import { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'
import { Providers } from '@/contexts'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { KwaiPixelProvider } from '@/components/kwai/KwaiPixelProvider'
import { KwaiClickIdCapture } from '@/components/kwai/KwaiClickIdCapture'
import { KwaiDebugPanel } from '@/components/kwai/KwaiDebugPanel'

interface ClientLayoutProps {
  children: ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <>
      <ErrorBoundary>
        <KwaiPixelProvider>
          <Providers>
            {/* Captura automática de clickid/mmpcode da URL */}
            <KwaiClickIdCapture />
            
            {/* Painel de debug (apenas em desenvolvimento) */}
            <KwaiDebugPanel />
            
            {children}
          </Providers>
        </KwaiPixelProvider>
      </ErrorBoundary>
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#27272a',
            color: '#fff',
            border: '1px solid #3f3f46',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  )
}



