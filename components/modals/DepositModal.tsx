'use client'

import { useState, useEffect } from 'react'
import { X, Copy, Check, Loader2, Wallet, Sparkles, TrendingUp, DollarSign, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useWallet } from '@/contexts/WalletContext'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { QRCodeSVG } from 'qrcode.react'
import { formatCurrency } from '@/lib/utils'
import { useKwaiPixelContext } from '@/contexts/KwaiPixelContext'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
}

// Valores sugeridos em múltiplos de 5
const SUGGESTED_VALUES = [5,10, 20, 30, 50, 100, 200, 500, 1000]

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const { user } = useAuth()
  const { refreshWallet } = useWallet()
  const { trackCheckout, trackPurchase } = useKwaiPixelContext()
  const [amount, setAmount] = useState('')
  const [selectedValue, setSelectedValue] = useState<number | null>(null)
  const [acceptBonus, setAcceptBonus] = useState(true)
  const [step, setStep] = useState<'form' | 'qrcode'>('form')
  const [qrcodeData, setQrcodeData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [checking, setChecking] = useState(false)
  const [countdown, setCountdown] = useState(15)
  const [canVerify, setCanVerify] = useState(false)
  const [qrSize, setQrSize] = useState(220)
  const [qrCodeExpiration, setQrCodeExpiration] = useState(300) // 5 minutos em segundos
  const [isQrCodeExpired, setIsQrCodeExpired] = useState(false)
  
  // Configurações de bônus
  const [depositBonusPercent, setDepositBonusPercent] = useState(0)
  const [depositBonusRollover, setDepositBonusRollover] = useState(0)
  const [depositBonusFirstOnly, setDepositBonusFirstOnly] = useState(true)
  const [isFirstDeposit, setIsFirstDeposit] = useState(false)

  const handleSelectValue = (value: number) => {
    setSelectedValue(value)
    setAmount(value.toString())
  }

  const handleCustomAmount = (value: string) => {
    setSelectedValue(null)
    setAmount(value)
  }

  useEffect(() => {
    if (isOpen) {
      // Carregar configurações ao abrir
      loadBonusSettings()
      checkFirstDeposit()
    } else {
      // Reset ao fechar
      setStep('form')
      setAmount('')
      setSelectedValue(null)
      setQrcodeData(null)
      setCopied(false)
      setCountdown(15)
      setCanVerify(false)
      setAcceptBonus(true)
      setQrCodeExpiration(300)
      setIsQrCodeExpired(false)
    }
  }, [isOpen])

  const loadBonusSettings = async () => {
    try {
      const response = await api.get('/settings')
      if (response.data.status && response.data.data) {
        setDepositBonusPercent(Number(response.data.data.depositBonus || 0))
        setDepositBonusRollover(Number(response.data.data.depositBonusRollover || 0))
        setDepositBonusFirstOnly(response.data.data.depositBonusFirstOnly !== false) // Default true
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de bônus:', error)
    }
  }

  const checkFirstDeposit = async () => {
    try {
      const response = await api.get('/wallet/deposits')
      if (response.data.status) {
        const deposits = response.data.data
        // Verificar se deposits é um array
        if (Array.isArray(deposits)) {
          // Se não tem depósitos ou todos estão pending, é primeiro depósito
          const hasCompletedDeposit = deposits.some((d: any) => d.status === 'completed')
          setIsFirstDeposit(!hasCompletedDeposit)
        } else {
          // Se não é array, considera como primeiro depósito
          setIsFirstDeposit(true)
        }
      }
    } catch (error) {
      console.error('Erro ao verificar depósitos:', error)
      setIsFirstDeposit(true) // Em caso de erro, assume primeiro depósito
    }
  }

  // Ajustar tamanho do QR Code baseado no tamanho da tela
  useEffect(() => {
    const updateQrSize = () => {
      const width = window.innerWidth
      if (width < 380) {
        setQrSize(160)  // Telas muito pequenas
      } else if (width < 640) {
        setQrSize(180)  // Mobile normal
      } else {
        setQrSize(220)  // Desktop
      }
    }
    
    updateQrSize()
    window.addEventListener('resize', updateQrSize)
    return () => window.removeEventListener('resize', updateQrSize)
  }, [])

  // Countdown de 15 segundos para habilitar verificação manual
  useEffect(() => {
    if (step === 'qrcode' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      setCanVerify(true)
    }
  }, [step, countdown])

  // Contador de expiração do QR Code (5 minutos)
  useEffect(() => {
    if (step === 'qrcode' && qrCodeExpiration > 0 && !isQrCodeExpired) {
      const timer = setTimeout(() => {
        setQrCodeExpiration(qrCodeExpiration - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (qrCodeExpiration === 0 && !isQrCodeExpired) {
      setIsQrCodeExpired(true)
      toast.error('QR Code expirado! Gere um novo QR Code.')
    }
  }, [step, qrCodeExpiration, isQrCodeExpired])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.cpf) {
      toast.error('CPF não encontrado')
      return
    }

    setIsLoading(true)
    try {
      const response = await api.post('/wallet/deposit', {
        amount: parseFloat(amount),
        cpf: user.cpf,
        accept_bonus: acceptBonus,
      })

      if (response.data.status && response.data.data) {
        const data = response.data.data
        
        if (!data.qrcode || data.qrcode.length === 0) {
          toast.error('Erro: QR Code não foi gerado corretamente')
          return
        }
        
        setQrcodeData(data)
        setStep('qrcode')
        setCountdown(15)
        setCanVerify(false)
        setQrCodeExpiration(300) // Reset do contador de 5 minutos
        setIsQrCodeExpired(false)
        
        // 🎯 Rastrear início de checkout no Kwai Pixel
        trackCheckout(parseFloat(amount), data.idTransaction, 'BRL').catch(err => {
          console.warn('[Kwai] Erro ao rastrear checkout:', err)
        })

        toast.success('QR Code gerado com sucesso!')
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao gerar QR Code'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const checkDepositStatus = async () => {
    setChecking(true)
    try {
      const response = await api.post('/wallet/deposit/verify', {
        idTransaction: qrcodeData.idTransaction,
      })

      if (response.data.status && response.data.data) {
        const { status, paid } = response.data.data

        if (status === 1 || paid === true) {
          // Aprovado
          const depositAmount = parseFloat(amount)

          // 💾 Salvar data do último depósito no localStorage para tracking de re-purchase
          const lastDepositDate = new Date().toISOString()
          localStorage.setItem('kwai_last_deposit_date', lastDepositDate)
          localStorage.setItem('kwai_last_deposit_amount', depositAmount.toString())
          
          // 🎯 Rastrear compra completa no Kwai Pixel
          trackPurchase(depositAmount, qrcodeData.idTransaction, 'BRL', 'pix').catch(err => {
            console.warn('[Kwai] Erro ao rastrear compra:', err)
          })
          
          toast.success('Depósito aprovado! Saldo atualizado.')
          await refreshWallet()
          onClose()
        } else {
          // Ainda pendente
          toast('Pagamento ainda não detectado. Tente novamente em alguns instantes.', {
            icon: 'ℹ️'
          })
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao verificar status'
      toast.error(message)
    } finally {
      setChecking(false)
    }
  }

  const copyToClipboard = async () => {
    const code = qrcodeData?.qrcode || qrcodeData?.payload
    if (!code) {
      toast.error('Código não disponível')
      return
    }

    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('Código copiado!')
      setTimeout(() => setCopied(false), 3000)
    } catch (error) {
      toast.error('Erro ao copiar código')
    }
  }

  // Formatar tempo restante (mm:ss)
  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto overflow-x-hidden"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0a0a0a] w-full max-w-md relative rounded-2xl shadow-2xl border-2 border-gold-500/50 my-4 mx-auto max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden"
            style={{ backgroundColor: '#0a0a0a' }}
          >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 via-transparent to-purple-500/5 pointer-events-none overflow-hidden" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50" />
            
            <div className="relative p-4 sm:p-6 overflow-y-auto overflow-x-hidden flex-1">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="bg-gradient-to-br from-gold-500 to-gold-600 p-2 sm:p-3 rounded-xl shadow-xl shadow-gold-500/50"
                  >
                    <Wallet size={22} className="text-white sm:w-[26px] sm:h-[26px]" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      Depositar
                    </h2>
                    <p className="text-xs sm:text-sm text-gold-400 font-medium">Rápido e seguro via PIX</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-dark-400 hover:text-white transition-colors p-1.5 sm:p-2 hover:bg-dark-700 rounded-lg"
                >
                  <X size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Step 1: Form */}
              {step === 'form' && (
                <motion.form
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-6 w-full"
                >
                  {/* Valores Sugeridos */}
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={16} className="text-gold-400 sm:w-[18px] sm:h-[18px]" />
                      <label className="text-sm sm:text-base font-bold text-white">
                        Valores Sugeridos
                      </label>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3 sm:mb-4 w-full">
                      {SUGGESTED_VALUES.map((value, index) => {
                        // Mostrar bônus se: (1º depósito E firstOnly=true) OU (firstOnly=false)
                        const showBonus = depositBonusPercent > 0 && (!depositBonusFirstOnly || isFirstDeposit);
                        const bonusAmount = showBonus 
                          ? (value * depositBonusPercent) / 100 
                          : 0;
                        const totalAmount = value + bonusAmount;
                        
                        return (
                          <motion.button
                            key={value}
                            type="button"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSelectValue(value)}
                            className={`relative py-2.5 sm:py-3 px-2 sm:px-2.5 rounded-xl font-bold transition-all duration-300 overflow-hidden group min-w-0 ${
                              selectedValue === value
                                ? 'bg-gradient-to-br from-gold-500 to-gold-600 text-gray-900 shadow-2xl shadow-gold-500/60 ring-2 ring-gold-400 scale-105'
                                : 'bg-[#1a1a1a] text-white hover:bg-[#252525] border-2 border-gray-700 hover:border-gold-500/50'
                            }`}
                            style={selectedValue === value ? {} : { backgroundColor: '#1a1a1a' }}
                            disabled={isLoading}
                          >
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            
                            <div className="relative flex flex-col items-center gap-0.5">
                              {selectedValue === value && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute -top-1 -right-1"
                                >
                                  <Zap size={14} className="text-white drop-shadow-lg" />
                                </motion.div>
                              )}
                              
                              {/* Valor Principal */}
                              <span className={`text-sm sm:text-lg font-black leading-tight ${selectedValue === value ? 'text-gray-900' : 'text-white'}`}>
                                R$ {value}
                              </span>
                              
                              {/* Mostrar Bônus se for primeiro depósito */}
                              {bonusAmount > 0 && (
                                <div className="flex flex-col items-center gap-0.5">
                                  <div className="flex items-center gap-0.5">
                                    <Sparkles size={10} className={selectedValue === value ? 'text-gray-900' : 'text-gold-400'} />
                                    <span className={`text-[9px] sm:text-[11px] font-bold ${selectedValue === value ? 'text-gray-900/80' : 'text-gold-400'}`}>
                                      +{formatCurrency(bonusAmount, 'R$').replace('R$ ', '')}
                                    </span>
                                  </div>
                                  <span className={`text-[8px] sm:text-[10px] font-black ${selectedValue === value ? 'text-gray-900/90' : 'text-green-400'}`}>
                                    ={formatCurrency(totalAmount, 'R$').replace('R$ ', '')}
                                  </span>
                                </div>
                              )}
                              
                              {/* Mostrar indicativo se não tiver bônus */}
                              {!showBonus && value >= 100 && (
                                <span className={`text-[9px] sm:text-[11px] font-semibold opacity-60 ${selectedValue === value ? 'text-gray-900' : 'text-gray-400'}`}>
                                  {depositBonusFirstOnly && !isFirstDeposit ? 'Apenas 1º depósito' : 'Sem bônus'}
                                </span>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Campo Customizado */}
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign size={16} className="text-gold-400 sm:w-[18px] sm:h-[18px]" />
                      <label className="text-sm sm:text-base font-bold text-white">
                        Ou Digite o Valor
                      </label>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gold-400 font-black text-lg sm:text-xl">
                        R$
                      </span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => handleCustomAmount(e.target.value)}
                        className="w-full pl-12 sm:pl-14 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-700 rounded-xl text-white text-lg sm:text-xl font-bold focus:border-gold-500 focus:ring-4 focus:ring-gold-500/30 transition-all placeholder:text-gray-500"
                        style={{ backgroundColor: '#1a1a1a' }}
                        placeholder="0,00"
                        min="5"
                        step="0.01"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-gray-400 font-medium">
                        Min: R$ 5,00 | Max: R$ 10.000,00
                      </p>
                      {amount && parseFloat(amount) >= 100 && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-1 text-sm text-gold-400 font-bold"
                        >
                          <TrendingUp size={14} />
                          Bônus disponível!
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Calculadora de Bônus */}
                  {amount && parseFloat(amount) >= 5 && depositBonusPercent > 0 && (!depositBonusFirstOnly || isFirstDeposit) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full p-4 bg-gradient-to-br from-gold-500/20 via-gold-500/10 to-purple-500/10 border-2 border-gold-500/30 rounded-xl"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={18} className="text-gold-400" />
                        <h3 className="text-white font-bold text-base">
                          {depositBonusFirstOnly && isFirstDeposit ? 'Bônus de Primeiro Depósito' : 'Bônus de Depósito'}
                        </h3>
                      </div>

                      <div className="space-y-3">
                        {/* Cálculo do Bônus */}
                        <div className="bg-dark-800/50 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Valor do Depósito:</span>
                            <span className="text-white font-semibold">{formatCurrency(parseFloat(amount))}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Bônus ({depositBonusPercent}%):</span>
                            <span className="text-gold-400 font-bold">
                              + {formatCurrency((parseFloat(amount) * depositBonusPercent) / 100)}
                            </span>
                          </div>
                          <div className="border-t border-gray-700 pt-2 flex items-center justify-between">
                            <span className="text-white font-semibold">Total a Receber:</span>
                            <span className="text-green-400 font-bold text-lg">
                              {formatCurrency(parseFloat(amount) + (parseFloat(amount) * depositBonusPercent) / 100)}
                            </span>
                          </div>
                        </div>

                        {/* Checkbox para Aceitar Bônus */}
                        <div className="flex items-start gap-3 p-3 bg-dark-800/30 rounded-lg">
                          <input
                            type="checkbox"
                            checked={acceptBonus}
                            onChange={(e) => setAcceptBonus(e.target.checked)}
                            className="mt-1 w-4 h-4 text-gold-500 bg-gray-700 border-gray-600 rounded focus:ring-gold-500"
                            disabled={isLoading}
                          />
                          <label className="text-sm text-white flex-1 cursor-pointer" onClick={() => setAcceptBonus(!acceptBonus)}>
                            <span className="font-semibold text-gold-400">
                              Aceito receber o bônus de {depositBonusPercent}%
                            </span>
                            <p className="text-xs text-gray-400 mt-1">
                              ⚡ O bônus terá rollover de <span className="text-gold-400 font-semibold">{depositBonusRollover}x</span> e deve ser usado para jogar. Você também terá rollover de {depositBonusRollover}x sobre o valor depositado. Desmarque se preferir apenas o valor depositado sem rollover de bônus.
                            </p>
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Aviso caso NÃO seja primeiro depósito E bônus seja apenas para primeiro */}
                  {amount && parseFloat(amount) >= 5 && !isFirstDeposit && depositBonusFirstOnly && depositBonusPercent > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"
                    >
                      <p className="text-sm text-blue-400">
                        ℹ️ O bônus de primeiro depósito é válido apenas para o primeiro depósito. Este depósito não receberá bônus adicional.
                      </p>
                    </motion.div>
                  )}

                  {/* Botão Submit */}
                  <motion.button
                    type="submit"
                    disabled={isLoading || !amount}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative w-full py-3.5 sm:py-5 text-gray-900 font-black text-base sm:text-lg rounded-xl shadow-2xl shadow-gold-500/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
                    style={{ 
                      background: 'linear-gradient(to right, #f59e0b, #d97706)',
                      color: '#111827'
                    }}
                  >
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                      {isLoading ? (
                        <>
                          <Loader2 size={22} className="animate-spin sm:w-[26px] sm:h-[26px]" />
                          <span>Gerando QR Code...</span>
                        </>
                      ) : (
                        <>
                          <Zap size={22} className="drop-shadow-lg sm:w-[26px] sm:h-[26px]" />
                          <span>Gerar QR Code PIX</span>
                        </>
                      )}
                    </div>
                  </motion.button>
                </motion.form>
              )}

              {/* Step 2: QR Code */}
              {step === 'qrcode' && qrcodeData && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 sm:space-y-6 w-full"
                >
                  {/* Temporizador de Expiração */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-center p-3 rounded-lg ${
                      isQrCodeExpired 
                        ? 'bg-red-500/20 border border-red-500/50' 
                        : qrCodeExpiration < 60 
                          ? 'bg-orange-500/20 border border-orange-500/50'
                          : 'bg-blue-500/20 border border-blue-500/50'
                    }`}
                  >
                    {isQrCodeExpired ? (
                      <div className="flex items-center justify-center gap-2">
                        <X size={20} className="text-red-400" />
                        <span className="text-red-400 font-bold">QR Code Expirado!</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-xs sm:text-sm ${qrCodeExpiration < 60 ? 'text-orange-400' : 'text-blue-400'}`}>
                          {qrCodeExpiration < 60 ? '⏰ Expirando em breve!' : '⏱️ Tempo restante'}
                        </span>
                        <span className={`text-2xl sm:text-3xl font-black ${
                          qrCodeExpiration < 60 ? 'text-orange-400' : 'text-blue-400'
                        }`}>
                          {formatTimeRemaining(qrCodeExpiration)}
                        </span>
                        <span className="text-[10px] sm:text-xs text-gray-400">
                          {qrCodeExpiration < 60 ? 'Realize o pagamento rapidamente!' : 'para realizar o pagamento'}
                        </span>
                      </div>
                    )}
                  </motion.div>

                  {/* QR Code com efeito */}
                  <div className="relative w-full">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', damping: 20 }}
                      className={`bg-white p-4 sm:p-6 rounded-2xl flex justify-center items-center relative overflow-hidden mx-auto max-w-full ${
                        isQrCodeExpired ? 'opacity-50 grayscale' : ''
                      }`}
                    >
                      {/* Animated corners */}
                      <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-t-4 border-l-4 border-gold-500" />
                      <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-t-4 border-r-4 border-gold-500" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-b-4 border-l-4 border-gold-500" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-b-4 border-r-4 border-gold-500" />
                      
                      <div className="flex items-center justify-center max-w-full">
                        <QRCodeSVG
                          value={qrcodeData.qrcode || qrcodeData.payload || 'ERROR'}
                          size={qrSize}
                          level="H"
                          includeMargin
                          className="max-w-full h-auto"
                        />
                      </div>
                    </motion.div>
                    
                    {/* Pulse effect */}
                    {!isQrCodeExpired && (
                      <div className="absolute inset-0 rounded-2xl border-2 border-gold-500 animate-ping opacity-20" />
                    )}
                    
                    {/* Overlay de Expiração */}
                    {isQrCodeExpired && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                      >
                        <div className="text-center p-4">
                          <X size={48} className="text-red-500 mx-auto mb-2" />
                          <p className="text-white font-bold text-lg">QR Code Expirado</p>
                          <p className="text-gray-300 text-sm mt-1">Gere um novo código</p>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Código Copia e Cola */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-dark-700 to-dark-800 border border-dark-600 rounded-xl p-3 sm:p-4"
                  >
                    <p className="text-[10px] sm:text-xs text-dark-400 mb-2 flex items-center gap-1.5 sm:gap-2">
                      <Copy size={12} className="sm:w-[14px] sm:h-[14px]" />
                      Código PIX Copia e Cola:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={qrcodeData.qrcode || qrcodeData.payload || ''}
                        readOnly
                        className="flex-1 bg-dark-900 border border-dark-600 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-black text-[10px] sm:text-xs font-mono truncate"
                        placeholder={!qrcodeData.qrcode && !qrcodeData.payload ? 'Código não disponível' : ''}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={copyToClipboard}
                        disabled={!qrcodeData.qrcode && !qrcodeData.payload || isQrCodeExpired}
                        className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-dark-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition-all shadow-lg shadow-gold-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  </motion.div>

                  {/* Mensagem de QR Code Expirado */}
                  {isQrCodeExpired && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-red-500/20 border-2 border-red-500 rounded-xl p-4 text-center"
                    >
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <X size={24} className="text-red-500" />
                        <h3 className="text-red-500 font-bold text-lg">QR Code Expirado</h3>
                      </div>
                      <p className="text-red-400 text-sm mb-4">
                        O tempo de 5 minutos expirou. Por favor, gere um novo QR Code para realizar o depósito.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setStep('form')}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all"
                      >
                        Gerar Novo QR Code
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Contador e Botão de Verificação */}
                  {!isQrCodeExpired && countdown > 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-r from-purple-900/30 to-gold-900/30 border border-purple-700/50 rounded-xl p-3 sm:p-4 text-center"
                    >
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <Loader2 size={18} className="text-gold-500 sm:w-5 sm:h-5" />
                        </motion.div>
                        <span className="text-xs sm:text-sm font-semibold text-white">
                          Aguarde {countdown}s para verificar...
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-dark-400">
                        Após realizar o pagamento, aguarde para verificar o status
                      </p>
                    </motion.div>
                  ) : !isQrCodeExpired && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={checkDepositStatus}
                      disabled={!canVerify || checking || isQrCodeExpired}
                      className="relative w-full py-3.5 sm:py-5 text-gray-900 font-black text-base sm:text-lg rounded-xl shadow-2xl shadow-gold-500/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
                      style={{ 
                        background: 'linear-gradient(to right, #f59e0b, #d97706)',
                        color: '#111827'
                      }}
                    >
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      
                      <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                        {checking ? (
                          <>
                            <Loader2 size={22} className="animate-spin sm:w-[26px] sm:h-[26px]" />
                            <span>Verificando...</span>
                          </>
                        ) : (
                          <>
                            <Check size={22} className="drop-shadow-lg sm:w-[26px] sm:h-[26px]" />
                            <span>Verificar Pagamento</span>
                          </>
                        )}
                      </div>
                    </motion.button>
                  )}

                  {/* Botão Voltar */}
                  {!isQrCodeExpired && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep('form')}
                      className="w-full py-2.5 sm:py-3 bg-dark-700 hover:bg-dark-600 border border-dark-600 text-white text-sm sm:text-base font-semibold rounded-xl transition-all"
                    >
                      ← Voltar
                    </motion.button>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
