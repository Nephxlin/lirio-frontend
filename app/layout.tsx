import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Providers } from '@/contexts'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { KwaiPixelLoader, KwaiPixelInit } from '@/components/tracker/KwaiPixelLoader'
import { KwaiRepurchaseTracker } from '@/components/tracker/KwaiRepurchaseTracker'
import { KwaiDebugPanel } from '@/components/tracker/KwaiDebugPanel'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Casino - Jogue e Ganhe',
  description: 'O melhor cassino online do Brasil',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  themeColor: '#18181b',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'Casino - Jogue e Ganhe',
    description: 'O melhor cassino online do Brasil',
    siteName: 'Casino',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Preconnect para recursos externos */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'} />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'} />
        
        {/* Preconnect para Kwai CDN - PRIORIDADE MÁXIMA */}
        <link rel="preconnect" href="https://s21-def.ap4r.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://s21-def.ap4r.com" />
      </head>
      <body className={inter.className}>
        {/* Kwai Pixel Loader - Sempre carrega primeiro */}
        <KwaiPixelLoader />
        
        <ErrorBoundary>
          <Providers>
            {/* Kwai Pixel Init - Busca API e inicializa */}
            <KwaiPixelInit />
            <KwaiRepurchaseTracker />
            <KwaiDebugPanel />
            
            {children}
          </Providers>
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
        
        {/* Scripts de analytics podem ser carregados com estratégia lazy */}
        {process.env.NODE_ENV === 'production' && (
          <Script
            id="analytics"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `
                // Seu código de analytics aqui
                console.log('Analytics loaded');
              `,
            }}
          />
        )}
      </body>
    </html>
  )
}
