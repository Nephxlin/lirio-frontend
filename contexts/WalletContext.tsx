'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useAuth } from './AuthContext'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Wallet } from '@/types'

interface WalletContextData {
  wallet: Wallet | null
  isLoading: boolean
  refreshWallet: () => Promise<void>
  getTotalBalance: () => number
  getWithdrawableBalance: () => number
  toggleHideBalance: () => Promise<void>
}

const WalletContext = createContext<WalletContextData>({} as WalletContextData)

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, refreshUser } = useAuth()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Sincronizar wallet com user
  useEffect(() => {
    if (user?.wallet) {
      setWallet(user.wallet)
    }
  }, [user])

  const refreshWallet = async () => {
    if (!isAuthenticated) return

    setIsLoading(true)
    try {
      const response = await api.get('/wallet')
      
      if (response.data.status && response.data.data) {
        const walletData = response.data.data
        setWallet(walletData)
        
        // Atualizar também no AuthContext
        await refreshUser()
      }
    } catch (error) {
      console.error('Erro ao atualizar carteira:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTotalBalance = (): number => {
    if (!wallet) return 0
    return (wallet.balance || 0) + (wallet.balanceBonus || 0)
  }

  const getWithdrawableBalance = (): number => {
    if (!wallet) return 0
    return wallet.balanceWithdrawal || 0
  }

  const toggleHideBalance = async () => {
    if (!isAuthenticated) return

    try {
      const response = await api.post('/wallet/toggle-hide-balance')
      
      if (response.data.status) {
        await refreshWallet()
        toast.success(
          wallet?.hideBalance ? 'Saldo visível' : 'Saldo oculto'
        )
      }
    } catch (error) {
      toast.error('Erro ao alterar visibilidade do saldo')
    }
  }

  return (
    <WalletContext.Provider
      value={{
        wallet,
        isLoading,
        refreshWallet,
        getTotalBalance,
        getWithdrawableBalance,
        toggleHideBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

