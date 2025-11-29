import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { ClientLayout } from '@/components/layout/ClientLayout'

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
        <ClientLayout>
          {children}
        </ClientLayout>
        
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
