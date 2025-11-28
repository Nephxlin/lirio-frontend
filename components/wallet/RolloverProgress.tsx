'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Zap, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface RolloverProgressProps {
  bonusRollover: number
  depositRollover: number
  compact?: boolean
  showDetails?: boolean
}

export default function RolloverProgress({
  bonusRollover,
  depositRollover,
  compact = false,
  showDetails = true,
}: RolloverProgressProps) {
  // Garantir que os valores são números válidos
  const safeBonusRollover = Number(bonusRollover) || 0
  const safeDepositRollover = Number(depositRollover) || 0
  const totalRollover = safeBonusRollover + safeDepositRollover
  const hasRollover = totalRollover > 0

  if (!hasRollover) {
    return compact ? (
      <div className="flex items-center gap-2 text-green-500 text-xs">
        <CheckCircle size={14} />
        <span>Sem rollover</span>
      </div>
    ) : null
  }

  // Para exibição compacta (Header)
  if (compact) {
    const displayValue = totalRollover > 9999 
      ? `${(totalRollover / 1000).toFixed(1)}K` 
      : totalRollover.toFixed(0)

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
          <Zap size={12} className="text-yellow-400" />
          <span className="text-xs text-yellow-300 font-semibold">
            Rollover: R$ {displayValue}
          </span>
        </div>
      </div>
    )
  }

  // Para exibição completa (Perfil)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <TrendingUp size={18} className="text-yellow-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Rollover Pendente</h3>
            <p className="text-xs text-yellow-400">Continue jogando para liberar saque</p>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-dark-400">Total a apostar:</span>
          <span className="text-lg font-bold text-yellow-400">
            {formatCurrency(totalRollover)}
          </span>
        </div>
      </div>

      {/* Detalhes */}
      {showDetails && (safeBonusRollover > 0 || safeDepositRollover > 0) && (
        <div className="space-y-2 pt-3 border-t border-yellow-500/20">
          {safeBonusRollover > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-dark-400">
                <span className="inline-block w-2 h-2 bg-gold-500 rounded-full mr-1"></span>
                Rollover Bônus:
              </span>
              <span className="text-sm font-semibold text-yellow-300">
                {formatCurrency(safeBonusRollover)}
              </span>
            </div>
          )}
          {safeDepositRollover > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-dark-400">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                Rollover Depósito:
              </span>
              <span className="text-sm font-semibold text-yellow-300">
                {formatCurrency(safeDepositRollover)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Mensagem motivacional */}
      <div className="mt-3 p-2 bg-yellow-500/10 rounded-lg">
        <p className="text-xs text-yellow-300 text-center">
          ⚡ A cada aposta, você reduz o rollover e se aproxima do saque!
        </p>
      </div>
    </motion.div>
  )
}

