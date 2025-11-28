'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

interface PermissionsContextData {
  canPlay: () => boolean
  canDeposit: () => boolean
  canWithdraw: () => boolean
  canAccessGame: (gameId: number) => boolean
  checkPermission: (action: string) => boolean
}

const PermissionsContext = createContext<PermissionsContextData>(
  {} as PermissionsContextData
)

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()

  const canPlay = (): boolean => {
    if (!isAuthenticated || !user) {
      toast.error('Você precisa fazer login para jogar')
      return false
    }

    if (!user.wallet) {
      toast.error('Carteira não encontrada')
      return false
    }

    const totalBalance =
      (user.wallet.balance || 0) + (user.wallet.balanceBonus || 0)

    if (totalBalance <= 0) {
      toast.error('Você precisa ter saldo para jogar')
      return false
    }

    return true
  }

  const canDeposit = (): boolean => {
    if (!isAuthenticated || !user) {
      toast.error('Você precisa fazer login para depositar')
      return false
    }

    return true
  }

  const canWithdraw = (): boolean => {
    if (!isAuthenticated || !user) {
      toast.error('Você precisa fazer login para sacar')
      return false
    }

    if (!user.wallet) {
      toast.error('Carteira não encontrada')
      return false
    }

    const withdrawableBalance = user.wallet.balanceWithdrawal || 0

    if (withdrawableBalance <= 0) {
      toast.error('Você não tem saldo disponível para saque')
      return false
    }

    return true
  }

  const canAccessGame = (gameId: number): boolean => {
    if (!isAuthenticated) {
      toast.error('Você precisa fazer login para acessar este jogo')
      return false
    }

    return true
  }

  const checkPermission = (action: string): boolean => {
    switch (action) {
      case 'play':
        return canPlay()
      case 'deposit':
        return canDeposit()
      case 'withdraw':
        return canWithdraw()
      default:
        return isAuthenticated
    }
  }

  return (
    <PermissionsContext.Provider
      value={{
        canPlay,
        canDeposit,
        canWithdraw,
        canAccessGame,
        checkPermission,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  )
}

export function usePermissions() {
  const context = useContext(PermissionsContext)
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider')
  }
  return context
}

