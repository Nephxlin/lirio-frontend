'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, ArrowUpCircle, Sparkles, DollarSign, Zap, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useWallet } from '@/contexts/WalletContext'
import { usePermissions } from '@/contexts/PermissionsContext'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
}

const pixTypes = [
  { value: 'cpf', label: 'CPF' },
  { value: 'email', label: 'E-mail' },
  { value: 'phone', label: 'Telefone' },
  { value: 'random', label: 'Chave Aleatória' },
]

export default function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const { user } = useAuth()
  const { wallet, refreshWallet, getWithdrawableBalance } = useWallet()
  const { canWithdraw } = usePermissions()
  const [amount, setAmount] = useState('')
  const [pixType, setPixType] = useState('cpf')
  const [pixKey, setPixKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [minWithdrawal, setMinWithdrawal] = useState(20)
  const [maxWithdrawal, setMaxWithdrawal] = useState(5000)

  const withdrawableBalance = getWithdrawableBalance()
  const effectiveMaxWithdrawal = Math.min(withdrawableBalance, maxWithdrawal)

  useEffect(() => {
    if (isOpen) {
      // Buscar configurações ao abrir
      loadSettings()
    } else {
      // Reset ao fechar
      setAmount('')
      setPixType('cpf')
      setPixKey('')
    }
  }, [isOpen])

  const loadSettings = async () => {
    try {
      const response = await api.get('/settings')
      if (response.data.status && response.data.data) {
        const settings = response.data.data
        setMinWithdrawal(settings.minWithdrawal || 20)
        setMaxWithdrawal(settings.maxWithdrawal || 5000)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canWithdraw()) {
      return
    }

    setIsLoading(true)
    try {
      const response = await api.post('/wallet/withdraw', {
        amount: parseFloat(amount),
        pixKey,
        pixType,
      })

      if (response.data.status) {
        toast.success('Saque solicitado com sucesso!')
        await refreshWallet()
        onClose()
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao solicitar saque'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md relative rounded-2xl shadow-2xl border-2 border-gold-500/50 overflow-hidden"
            style={{ backgroundColor: '#0a0a0a' }}
          >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 via-transparent to-purple-500/5 pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="relative p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="bg-gradient-to-br from-gold-500 to-gold-600 p-3 rounded-xl shadow-xl shadow-gold-500/50"
                  >
                    <ArrowUpCircle size={26} className="text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Sacar</h2>
                    <p className="text-sm text-gold-400 font-medium">Retire seus ganhos</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-dark-400 hover:text-white transition-colors p-2 hover:bg-dark-700 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Saldo Disponível */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-2 border-gold-500/40 rounded-xl p-4 mb-6 shadow-lg"
                style={{ background: 'linear-gradient(to right, rgba(88, 28, 135, 0.3), rgba(217, 119, 6, 0.3))' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={18} className="text-gold-400" />
                  <p className="text-sm text-gray-300 font-medium">Saldo disponível para saque:</p>
                </div>
                <p className="text-3xl font-black text-gold-400">
                  {formatCurrency(withdrawableBalance)}
                </p>
              </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Valor */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Valor do Saque
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-700 rounded-xl text-white text-base font-semibold focus:border-gold-500 focus:ring-4 focus:ring-gold-500/30 transition-all placeholder:text-gray-500"
                  style={{ backgroundColor: '#1a1a1a' }}
                  placeholder="R$ 0,00"
                  min={minWithdrawal}
                  max={effectiveMaxWithdrawal}
                  step="0.01"
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-dark-400 mt-1">
                  Mínimo: {formatCurrency(minWithdrawal)} | Máximo: {formatCurrency(effectiveMaxWithdrawal)}
                </p>
                {withdrawableBalance > maxWithdrawal && (
                  <p className="text-xs text-yellow-500 mt-1">
                    ⚠️ Limite por saque: {formatCurrency(maxWithdrawal)}. Para sacar mais, faça múltiplas solicitações.
                  </p>
                )}
              </div>

              {/* Tipo de Chave PIX */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Tipo de Chave PIX
                </label>
                <select
                  value={pixType}
                  onChange={(e) => setPixType(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-700 rounded-xl text-white text-base font-semibold focus:border-gold-500 focus:ring-4 focus:ring-gold-500/30 transition-all placeholder:text-gray-500"
                  style={{ backgroundColor: '#1a1a1a' }}
                  disabled={isLoading}
                >
                  {pixTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chave PIX */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Chave PIX
                </label>
                <input
                  type="text"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-700 rounded-xl text-white text-base font-semibold focus:border-gold-500 focus:ring-4 focus:ring-gold-500/30 transition-all placeholder:text-gray-500"
                  style={{ backgroundColor: '#1a1a1a' }}
                  placeholder={
                    pixType === 'cpf'
                      ? '000.000.000-00'
                      : pixType === 'email'
                      ? 'seu@email.com'
                      : pixType === 'phone'
                      ? '(00) 00000-0000'
                      : 'Sua chave aleatória'
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Aviso */}
              <div className="card p-3 bg-yellow-500/10 border border-yellow-500/30">
                <p className="text-xs text-yellow-500">
                  ⚠️ O saque será analisado e processado em até 24 horas úteis.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !amount || !pixKey}
                className="relative w-full py-4 font-black text-lg rounded-xl shadow-2xl shadow-gold-500/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(to right, #f59e0b, #d97706)', color: '#ffffff' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Solicitando...
                  </>
                ) : (
                  'Solicitar Saque'
                )}
              </button>
            </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

