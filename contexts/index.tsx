'use client'

import { ReactNode } from 'react'
import { AuthProvider } from './AuthContext'
import { PermissionsProvider } from './PermissionsContext'
import { WalletProvider } from './WalletContext'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <PermissionsProvider>
        <WalletProvider>{children}</WalletProvider>
      </PermissionsProvider>
    </AuthProvider>
  )
}

