'use client'

import { useState, useEffect } from 'react'
import { X, Copy, Check, Users, Gift, Share2, TrendingUp, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'

interface ReferralModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ReferralModal({ isOpen, onClose }: ReferralModalProps) {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [referralStats, setReferralStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadReferralStats()
    }
  }, [isOpen])

  const loadReferralStats = async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/profile/referral-stats')
      if (response.data.status) {
        setReferralStats(response.data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      toast.error('Erro ao carregar dados de indicação')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = () => {
    if (!referralStats?.referralLink) {
      toast.error('Link não disponível')
      return
    }
    
    navigator.clipboard.writeText(referralStats.referralLink)
    setCopied(true)
    toast.success('Link copiado!')
    setTimeout(() => setCopied(false), 3000)
  }

  const handleShare = async () => {
    if (!referralStats?.referralLink) {
      toast.error('Link não disponível')
      return
    }

    const shareData = {
      title: 'Venha jogar no melhor cassino online!',
      text: `🎰 Use meu código e ganhe bônus! 🎁`,
      url: referralStats.referralLink,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        toast.success('Link compartilhado!')
      } catch (error) {
        // Usuário cancelou ou erro
        console.log('Compartilhamento cancelado')
      }
    } else {
      handleCopyLink()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0a0a0a] w-full max-w-md relative rounded-xl sm:rounded-2xl shadow-2xl border-2 border-gold-500/50 my-2 sm:my-4 mx-2 sm:mx-auto max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden"
            style={{ backgroundColor: '#0a0a0a' }}
          >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 via-transparent to-purple-500/5 pointer-events-none overflow-hidden" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50" />
            
            <div className="relative p-4 sm:p-6 overflow-y-auto flex-1">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="bg-gradient-to-br from-gold-500 to-gold-600 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-xl shadow-gold-500/50 flex-shrink-0"
                  >
                    <Users size={20} className="text-white sm:w-[26px] sm:h-[26px]" />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-2xl font-bold text-white truncate">
                      Programa de Indicação
                    </h2>
                    <p className="text-xs sm:text-sm text-gold-400 font-medium">Indique e ganhe!</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-dark-400 hover:text-white transition-colors p-1.5 sm:p-2 hover:bg-dark-700 rounded-lg flex-shrink-0"
                >
                  <X size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
                </div>
              ) : referralStats ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 sm:space-y-6"
                >
                  {/* Estatísticas */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-2 border-purple-500/30 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center"
                    >
                      <Users size={24} className="text-purple-400 mx-auto mb-1 sm:mb-2 sm:w-8 sm:h-8" />
                      <p className="text-2xl sm:text-3xl font-black text-white">{referralStats.totalReferred || 0}</p>
                      <p className="text-xs sm:text-sm text-purple-300 font-semibold mt-0.5 sm:mt-1">Amigos Indicados</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-gold-500/20 to-gold-600/20 border-2 border-gold-500/30 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center"
                    >
                      <Gift size={24} className="text-gold-400 mx-auto mb-1 sm:mb-2 sm:w-8 sm:h-8" />
                      <p className="text-2xl sm:text-3xl font-black text-gold-400 break-words">
                        {formatCurrency(referralStats.totalBonusEarned || 0)}
                      </p>
                      <p className="text-xs sm:text-sm text-gold-300 font-semibold mt-0.5 sm:mt-1">Total Ganho</p>
                    </motion.div>
                  </div>

                  {/* Seu Link */}
                  <div className="bg-gradient-to-br from-gold-500/20 to-gold-600/20 border-2 border-gold-500/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Share2 size={16} className="text-gold-400 sm:w-5 sm:h-5 flex-shrink-0" />
                      <h3 className="text-white font-bold text-base sm:text-lg truncate">Seu Link de Indicação</h3>
                    </div>

                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={referralStats.referralLink || ''}
                        readOnly
                        className="flex-1 min-w-0 px-2 sm:px-3 py-2 sm:py-2.5 bg-dark-800 border border-dark-600 rounded-lg text-black text-xs sm:text-sm font-mono overflow-hidden text-ellipsis"
                        onClick={(e) => e.currentTarget.select()}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopyLink}
                        className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-dark-900 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-gold-500/50 flex-shrink-0"
                      >
                        {copied ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <Check size={18} className="sm:w-5 sm:h-5" />
                          </motion.div>
                        ) : (
                          <Copy size={18} className="sm:w-5 sm:h-5" />
                        )}
                      </motion.button>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleShare}
                      className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm sm:text-base font-bold rounded-lg transition-all shadow-lg shadow-purple-500/50 flex items-center justify-center gap-2"
                    >
                      <Share2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                      Compartilhar Link
                    </motion.button>
                  </div>

                  {/* Como Funciona */}
                  <div className="bg-gradient-to-br from-dark-700 to-dark-800 border border-dark-600 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={16} className="text-gold-400 sm:w-5 sm:h-5 flex-shrink-0" />
                      <h3 className="text-black font-bold text-sm sm:text-base">Como Funciona?</h3>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-gold-400 font-bold text-xs sm:text-sm">1</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-black text-xs sm:text-sm font-semibold">Compartilhe seu link</p>
                          <p className="text-dark-400 text-xs mt-0.5">Envie para amigos e familiares</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-gold-400 font-bold text-xs sm:text-sm">2</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-black text-xs sm:text-sm font-semibold">Eles se cadastram</p>
                          <p className="text-dark-400 text-xs mt-0.5">Usando seu link de indicação</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-gold-400 font-bold text-xs sm:text-sm">3</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-black text-xs sm:text-sm font-semibold">Vocês ganham bônus!</p>
                          <p className="text-dark-400 text-xs mt-0.5">
                            R$ {referralStats.bonusPerReferral || 0} para cada um
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Benefícios */}
                  <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-2 border-green-500/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp size={16} className="text-green-400 sm:w-5 sm:h-5 flex-shrink-0" />
                      <h3 className="text-white font-bold text-sm sm:text-base">Benefícios</h3>
                    </div>

                    <ul className="space-y-2 text-xs sm:text-sm">
                      <li className="flex items-start gap-2 text-green-300">
                        <span className="text-green-400 font-bold flex-shrink-0">✓</span>
                        <span>Bônus imediato no cadastro do amigo</span>
                      </li>
                      <li className="flex items-start gap-2 text-green-300">
                        <span className="text-green-400 font-bold flex-shrink-0">✓</span>
                        <span>Sem limite de indicações</span>
                      </li>
                      <li className="flex items-start gap-2 text-green-300">
                        <span className="text-green-400 font-bold flex-shrink-0">✓</span>
                        <span>Bônus para você e seu amigo</span>
                      </li>
                    </ul>
                  </div>

                  {/* Código de Indicação */}
                  {referralStats.inviteCode && (
                    <div className="bg-dark-800 border border-dark-600 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                      <p className="text-dark-400 text-xs mb-2">Seu Código de Indicação</p>
                      <p className="text-gold-400 text-xl sm:text-2xl font-black font-mono tracking-wider break-all">
                        {referralStats.inviteCode}
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-dark-400">Erro ao carregar dados</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

