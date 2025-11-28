'use client'

import { useState, useEffect } from 'react'
import { X, Eye, EyeOff, Loader2, UserPlus, LogIn, Sparkles, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { validateCPF } from '@/lib/utils'
import api from '@/lib/api'
import { useKwaiTracker } from '@/lib/hooks/useKwaiTracker'

const loginSchema = z.object({
  email: z.string().min(1, 'E-mail ou CPF é obrigatório'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  cpf: z.string().refine((val) => validateCPF(val), {
    message: 'CPF inválido',
  }),
  phone: z.string().min(10, 'Telefone inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
  acceptBonus: z.boolean().optional(),
  term_a: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

type LoginFormData = z.infer<typeof loginSchema>
type RegisterFormData = z.infer<typeof registerSchema>

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register'
  referralCode?: string | null
  referrerInfo?: {
    referrerId: number
    referrerName: string
    referralCode: string
    bonusAmount: number
  } | null
}

export default function LoginModal({ isOpen, onClose, initialMode = 'register', referralCode, referrerInfo }: LoginModalProps) {
  const { login, register: registerUser } = useAuth()
  const { trackCompleteRegistration, trackContentView } = useKwaiTracker()
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [signupBonusAmount, setSignupBonusAmount] = useState(0)

  // Atualizar modo quando o modal abrir ou initialMode mudar
  useEffect(() => {
    if (isOpen) {
      setMode(referralCode ? 'register' : initialMode)
      loadSignupBonus()
    }
    trackContentView({ content_name: 'modal_login' })
  }, [isOpen, initialMode, referralCode, trackContentView])

  const loadSignupBonus = async () => {
    try {
      const response = await api.get('/settings')
      if (response.data.status && response.data.data) {
        setSignupBonusAmount(Number(response.data.data.signupBonus || 0))
      }
    } catch (error) {
      console.error('Erro ao carregar bônus de cadastro:', error)
    }
  }

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      onClose()
    } catch (error: any) {
      // Capturar erros da API e vinculá-los aos campos específicos
      const errorMessage = error.response?.data?.message || ''
      
      // Verificar se o erro é relacionado a credenciais inválidas
      if (errorMessage.toLowerCase().includes('senha')) {
        loginForm.setError('password', {
          type: 'manual',
          message: errorMessage
        })
      } else if (errorMessage.toLowerCase().includes('e-mail') || errorMessage.toLowerCase().includes('cpf') || errorMessage.toLowerCase().includes('usuário')) {
        loginForm.setError('email', {
          type: 'manual',
          message: errorMessage
        })
      }
      // Se não for um erro de campo específico, o toast já foi mostrado pelo AuthContext
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      // Registrar usuário (já faz login automático no AuthContext)
      await registerUser({
        name: data.name,
        email: data.email,
        cpf: data.cpf.replace(/\D/g, ''),
        phone: data.phone.replace(/\D/g, ''),
        password: data.password,
        term_a: data.term_a,
        referenceCode: referralCode || undefined,
        acceptReferralBonus: data.acceptBonus || false,
        acceptSignupBonus: data.acceptBonus !== false, // Se não desmarcou, aceita
      })
      
      // 🔥 Rastrear registro completo no Kwai
      trackCompleteRegistration({
        registration_method: referralCode ? 'referral' : 'direct',
        has_referral_bonus: data.acceptBonus || false,
        content_name: 'cadastro_concluido',
      })
      
      // O AuthContext já salva o token e redireciona para /home
      onClose()
    } catch (error: any) {
      // Capturar erros da API e vinculá-los aos campos específicos
      const errorMessage = error.response?.data?.message || ''
      
      // Verificar se o erro é relacionado a campos específicos
      if (errorMessage.toLowerCase().includes('cpf')) {
        registerForm.setError('cpf', {
          type: 'manual',
          message: errorMessage
        })
      } else if (errorMessage.toLowerCase().includes('e-mail') || errorMessage.toLowerCase().includes('email')) {
        registerForm.setError('email', {
          type: 'manual',
          message: errorMessage
        })
      } else if (errorMessage.toLowerCase().includes('telefone') || errorMessage.toLowerCase().includes('phone')) {
        registerForm.setError('phone', {
          type: 'manual',
          message: errorMessage
        })
      }
      // Se não for um erro de campo específico, o toast já foi mostrado pelo AuthContext
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
            className="w-full max-w-md relative rounded-2xl shadow-2xl border-2 border-gold-500/50 overflow-hidden max-h-[90vh] overflow-y-auto"
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
                    animate={{ rotate: mode === 'login' ? [0, -10, 10, 0] : [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="bg-gradient-to-br from-gold-500 to-gold-600 p-3 rounded-xl shadow-xl shadow-gold-500/50"
                  >
                    {mode === 'login' ? (
                      <LogIn size={26} className="text-white" />
                    ) : (
                      <UserPlus size={26} className="text-white" />
                    )}
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {mode === 'login' ? 'Entrar' : 'Criar Conta'}
                    </h2>
                    <p className="text-sm text-gold-400 font-medium">
                      {mode === 'login' ? 'Acesse sua conta' : 'Junte-se a nós!'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-dark-400 hover:text-white transition-colors p-2 hover:bg-dark-700 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>

            {/* Login Form */}
            {mode === 'login' && (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    E-mail ou CPF
                  </label>
                  <input
                    type="text"
                    {...loginForm.register('email')}
                    className="w-full px-4 py-3 border-2 border-gray-700 rounded-xl text-white text-base font-semibold focus:border-gold-500 focus:ring-4 focus:ring-gold-500/30 transition-all placeholder:text-gray-500"
                    style={{ backgroundColor: '#1a1a1a' }}
                    placeholder="seu@email.com"
                    disabled={isLoading}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-red-400 text-sm mt-1">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...loginForm.register('password')}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-700 rounded-xl text-white text-base font-semibold focus:border-gold-500 focus:ring-4 focus:ring-gold-500/30 transition-all placeholder:text-gray-500"
                      style={{ backgroundColor: '#1a1a1a' }}
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-red-400 text-sm mt-1">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full py-4 font-black text-lg rounded-xl shadow-2xl shadow-gold-500/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(to right, #f59e0b, #d97706)', color: '#ffffff' }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </button>

                <div className="text-center">
                  <p className="text-dark-400">
                    Não tem uma conta?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="text-primary-400 hover:text-primary-300 font-semibold transition"
                    >
                      Cadastre-se
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* Register Form */}
            {mode === 'register' && (
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                {/* Banner de Indicação */}
                {referrerInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gradient-to-br from-purple-500/20 to-gold-500/20 border-2 border-gold-500/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-gold-500 rounded-lg">
                        <UserPlus className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gold-400 font-semibold">Você foi indicado por</p>
                        <p className="text-lg font-bold text-white">{referrerInfo.referrerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gold-500/10 rounded-lg border border-gold-500/30">
                      <Sparkles className="w-5 h-5 text-gold-400" />
                      <div>
                        <p className="text-xs text-gold-400">Bônus de Boas-Vindas</p>
                        <p className="text-xl font-black text-gold-500">
                          R$ {referrerInfo.bonusAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      ✨ Vocês dois ganham ao completar o cadastro!
                    </p>
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    {...registerForm.register('name')}
                    className="w-full px-4 py-3 border-2 border-gray-700 rounded-xl text-white text-base font-semibold focus:border-gold-500 focus:ring-4 focus:ring-gold-500/30 transition-all placeholder:text-gray-500"
                    style={{ backgroundColor: '#1a1a1a' }}
                    placeholder="João Silva"
                    disabled={isLoading}
                  />
                  {registerForm.formState.errors.name && (
                    <p className="text-red-400 text-sm mt-1">
                      {registerForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    {...registerForm.register('email')}
                    className="w-full px-4 py-3 border-2 border-gray-700 rounded-xl text-white text-base font-semibold focus:border-gold-500 focus:ring-4 focus:ring-gold-500/30 transition-all placeholder:text-gray-500"
                    style={{ backgroundColor: '#1a1a1a' }}
                    placeholder="seu@email.com"
                    disabled={isLoading}
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-red-400 text-sm mt-1">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    CPF
                  </label>
                  <input
                    type="text"
                    {...registerForm.register('cpf')}
                    className="w-full px-4 py-3 border-2 border-gray-700 rounded-xl text-white text-base font-semibold focus:border-gold-500 focus:ring-4 focus:ring-gold-500/30 transition-all placeholder:text-gray-500"
                    style={{ backgroundColor: '#1a1a1a' }}
                    placeholder="000.000.000-00"
                    disabled={isLoading}
                    maxLength={14}
                  />
                  {registerForm.formState.errors.cpf && (
                    <p className="text-red-400 text-sm mt-1">
                      {registerForm.formState.errors.cpf.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Telefone
                  </label>
                  <input
                    type="text"
                    {...registerForm.register('phone')}
                    className="w-full px-4 py-3 border-2 border-gray-700 rounded-xl text-white text-base font-semibold focus:border-gold-500 focus:ring-4 focus:ring-gold-500/30 transition-all placeholder:text-gray-500"
                    style={{ backgroundColor: '#1a1a1a' }}
                    placeholder="(00) 00000-0000"
                    disabled={isLoading}
                    maxLength={15}
                  />
                  {registerForm.formState.errors.phone && (
                    <p className="text-red-400 text-sm mt-1">
                      {registerForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...registerForm.register('password')}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-700 rounded-xl text-white text-base font-semibold focus:border-gold-500 focus:ring-4 focus:ring-gold-500/30 transition-all placeholder:text-gray-500"
                      style={{ backgroundColor: '#1a1a1a' }}
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {registerForm.formState.errors.password && (
                    <p className="text-red-400 text-sm mt-1">
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...registerForm.register('confirmPassword')}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-700 rounded-xl text-white text-base font-semibold focus:border-gold-500 focus:ring-4 focus:ring-gold-500/30 transition-all placeholder:text-gray-500"
                      style={{ backgroundColor: '#1a1a1a' }}
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">
                      {registerForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Checkbox de Aceitar Bônus de Indicação */}
                {referrerInfo && (
                  <div className="p-3 bg-gradient-to-r from-gold-500/10 to-purple-500/10 border border-gold-500/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        {...registerForm.register('acceptBonus')}
                        defaultChecked={true}
                        className="mt-1 w-4 h-4 text-gold-500 bg-gray-700 border-gray-600 rounded focus:ring-gold-500"
                        disabled={isLoading}
                      />
                      <label className="text-sm text-white flex-1">
                        <span className="font-semibold text-gold-400">
                          Aceito receber o bônus de indicação de R$ {referrerInfo.bonusAmount.toFixed(2)}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          Este bônus terá rollover e deve ser usado para jogar. Ao desmarcar, você e {referrerInfo.referrerName} não receberão o bônus.
                        </p>
                      </label>
                    </div>
                  </div>
                )}

                {/* Checkbox de Aceitar Bônus de Cadastro (apenas quando NÃO for indicação) */}
                {!referrerInfo && signupBonusAmount > 0 && (
                  <div className="p-3 bg-gradient-to-r from-gold-500/10 to-green-500/10 border border-gold-500/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        {...registerForm.register('acceptBonus')}
                        defaultChecked={true}
                        className="mt-1 w-4 h-4 text-gold-500 bg-gray-700 border-gray-600 rounded focus:ring-gold-500"
                        disabled={isLoading}
                      />
                      <label className="text-sm text-white flex-1">
                        <span className="font-semibold text-gold-400 flex items-center gap-2">
                          <Sparkles size={16} />
                          Aceito receber o bônus de boas-vindas de R$ {signupBonusAmount.toFixed(2)}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          🎁 Ganhe <span className="text-gold-400 font-semibold">R$ {signupBonusAmount.toFixed(2)}</span> ao criar sua conta! Este bônus terá rollover e deve ser usado para jogar.
                        </p>
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    {...registerForm.register('term_a')}
                    className="mt-1"
                    disabled={isLoading}
                  />
                  <label className="text-sm text-dark-400">
                    Aceito os termos e condições e confirmo que tenho mais de 18 anos
                  </label>
                </div>
                {registerForm.formState.errors.term_a && (
                  <p className="text-red-400 text-sm">
                    {registerForm.formState.errors.term_a.message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full py-4 font-black text-lg rounded-xl shadow-2xl shadow-gold-500/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(to right, #f59e0b, #d97706)', color: '#ffffff' }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    'Criar Conta'
                  )}
                </button>

                <div className="text-center">
                  <p className="text-dark-400">
                    Já tem uma conta?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-primary-400 hover:text-primary-300 font-semibold transition"
                    >
                      Entrar
                    </button>
                  </p>
                </div>
              </form>
            )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

