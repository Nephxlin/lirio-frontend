'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useWallet } from '@/contexts/WalletContext'
import { useKwaiPageView } from '@/lib/hooks/useKwaiPageView'
import { User, Wallet, History, Heart, Edit, Sparkles, Users, Copy, Check } from 'lucide-react'
import { formatCurrency, formatCPF, formatPhone, formatDateTime, getInitials } from '@/lib/utils'
import { Deposit, Withdrawal, Game } from '@/types'
import api from '@/lib/api'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import WithdrawModal from '@/components/modals/WithdrawModal'
import RolloverProgress from '@/components/wallet/RolloverProgress'
import OptimizedImage from '@/components/common/OptimizedImage'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const { wallet, getTotalBalance, getWithdrawableBalance } = useWallet()
  const [activeTab, setActiveTab] = useState<'info' | 'deposits' | 'withdrawals' | 'favorites' | 'referrals'>('info')
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [favorites, setFavorites] = useState<Game[]>([])
  const [referralStats, setReferralStats] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  
  // 🔥 Rastrear visualização da página de perfil
  useKwaiPageView('profile_page', { content_type: 'profile' })
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  })

  useEffect(() => {
    if (activeTab === 'deposits') {
      loadDeposits()
    } else if (activeTab === 'withdrawals') {
      loadWithdrawals()
    } else if (activeTab === 'favorites') {
      loadFavorites()
    } else if (activeTab === 'referrals' && !referralStats) {
      loadReferralStats()
    }
  }, [activeTab])

  useEffect(() => {
    loadReferralStats()
  }, [])

  const loadDeposits = async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/profile/deposits')
      if (response.data.status && response.data.data) {
        setDeposits(response.data.data.deposits || [])
      }
    } catch (error) {
      console.error('Erro ao carregar depósitos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadWithdrawals = async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/profile/withdrawals')
      if (response.data.status && response.data.data) {
        setWithdrawals(response.data.data.withdrawals || [])
      }
    } catch (error) {
      console.error('Erro ao carregar saques:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFavorites = async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/profile/favorites')
      if (response.data.status && response.data.data) {
        setFavorites(response.data.data.games || [])
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadReferralStats = async () => {
    try {
      const response = await api.get('/profile/referral-stats')
      if (response.data.status) {
        setReferralStats(response.data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralStats?.referralLink || '')
    setCopied(true)
    toast.success('Link copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleUpdateProfile = async () => {
    try {
      const response = await api.put('/profile', editForm)
      if (response.data.status) {
        toast.success('Perfil atualizado com sucesso!')
        await refreshUser()
        setIsEditing(false)
      }
    } catch (error) {
      toast.error('Erro ao atualizar perfil')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Meu Perfil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Info do Usuário */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            {/* Avatar */}
            <div className="flex justify-center mb-4">
              <div className="relative w-24 h-24 rounded-full bg-gradient-casino flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                {user.avatar ? (
                  <OptimizedImage
                    src={`http://localhost:3000${user.avatar}`}
                    alt={user.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                    quality={90}
                  />
                ) : (
                  <span>{getInitials(user.name)}</span>
                )}
              </div>
            </div>

            <h2 className="text-xl font-bold text-white text-center mb-1">
              {user.name} {user.lastName}
            </h2>
            <p className="text-dark-400 text-center text-sm mb-6">
              {user.email}
            </p>

            {/* Stats */}
            <div className="space-y-3 mb-6">
              <div className="card p-3 bg-dark-200/50">
                <p className="text-xs text-dark-400">Saldo Total</p>
                <p className="text-lg font-bold text-gold-500">
                  {formatCurrency(getTotalBalance())}
                </p>
              </div>

              {/* Card de Saldo Normal */}
              <div className="card p-3 bg-dark-200/50">
                <p className="text-xs text-dark-400">Saldo Disponível</p>
                <p className="text-lg font-bold text-white">
                  {formatCurrency(wallet?.balance || 0)}
                </p>
              </div>

              {/* Card de Saldo Bonus (se houver) */}
              {wallet && wallet.balanceBonus > 0 && (
                <div className="card p-3 bg-gradient-to-br from-gold-500/20 to-gold-400/20 border border-gold-500/30">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gold-400">Saldo Bônus</p>
                    <Sparkles className="w-3 h-3 text-gold-500" />
                  </div>
                  <p className="text-lg font-bold text-gold-500">
                    {formatCurrency(wallet.balanceBonus)}
                  </p>
                  
                  {/* Mostrar rollover restante se houver */}
                  {wallet.balanceBonusRollover > 0 && (
                    <p className="text-xs text-gold-400/70 mt-1">
                      Rollover: {formatCurrency(wallet.balanceBonusRollover)}
                    </p>
                  )}
                </div>
              )}

              <div className="card p-3 bg-dark-200/50">
                <p className="text-xs text-dark-400">Disponível para Saque</p>
                <p className="text-lg font-bold text-green-500">
                  {formatCurrency(getWithdrawableBalance())}
                </p>
                
                {/* Mostrar rollover pendente se houver */}
                {wallet && (wallet.balanceBonusRollover > 0 || wallet.balanceDepositRollover > 0) && (
                  <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-xs text-yellow-400 mb-1">
                      ⚠️ Rollover Pendente
                    </p>
                    {wallet.balanceBonusRollover > 0 && (
                      <p className="text-xs text-yellow-300">
                        Bônus: {formatCurrency(wallet.balanceBonusRollover)}
                      </p>
                    )}
                    {wallet.balanceDepositRollover > 0 && (
                      <p className="text-xs text-yellow-300">
                        Depósito: {formatCurrency(wallet.balanceDepositRollover)}
                      </p>
                    )}
                    <p className="text-xs text-dark-400 mt-1">
                      Continue jogando para liberar o saque!
                    </p>
                  </div>
                )}
                
                {/* Botão de Saque - Mostrar apenas se tiver saldo disponível OU rollover pendente */}
                {(getWithdrawableBalance() > 0 || (wallet && (wallet.balanceBonusRollover > 0 || wallet.balanceDepositRollover > 0))) && (
                  <button
                    onClick={() => setIsWithdrawModalOpen(true)}
                    disabled={wallet ? (wallet.balanceBonusRollover > 0 || wallet.balanceDepositRollover > 0) : false}
                    className={`mt-2 w-full px-3 py-2 text-white text-sm font-bold rounded-lg transition-all shadow-lg ${
                      wallet && (wallet.balanceBonusRollover > 0 || wallet.balanceDepositRollover > 0)
                        ? 'bg-gray-500 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-500/30 hover:shadow-green-500/50'
                    }`}
                  >
                    {wallet && (wallet.balanceBonusRollover > 0 || wallet.balanceDepositRollover > 0)
                      ? 'Cumpra o Rollover'
                      : 'Solicitar Saque'
                    }
                  </button>
                )}
                
                {/* Mensagem quando não há saldo disponível */}
                {getWithdrawableBalance() === 0 && !wallet?.balanceBonusRollover && !wallet?.balanceDepositRollover && (
                  <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-xs text-blue-400 text-center">
                      💰 Faça um depósito para começar a jogar!
                    </p>
                  </div>
                )}
              </div>

              {wallet && (
                <>
                  <div className="card p-3 bg-dark-200/50">
                    <p className="text-xs text-dark-400">Total Apostado</p>
                    <p className="text-lg font-bold text-white">
                      {formatCurrency(wallet.totalBet)}
                    </p>
                  </div>

                  <div className="card p-3 bg-dark-200/50">
                    <p className="text-xs text-dark-400">Total Ganho</p>
                    <p className="text-lg font-bold text-green-500">
                      {formatCurrency(wallet.totalWon)}
                    </p>
                  </div>
                </>
              )}

              {/* Componente de Rollover Detalhado */}
              {wallet && (wallet.balanceBonusRollover > 0 || wallet.balanceDepositRollover > 0) && (
                <RolloverProgress
                  bonusRollover={wallet.balanceBonusRollover}
                  depositRollover={wallet.balanceDepositRollover}
                  compact={false}
                  showDetails={true}
                />
              )}
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-dark-200 pb-4">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-4 py-2 rounded-lg transition ${
                  activeTab === 'info'
                    ? 'bg-primary-500 text-white'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                <User className="inline mr-2" size={18} />
                Informações
              </button>
              <button
                onClick={() => setActiveTab('deposits')}
                className={`px-4 py-2 rounded-lg transition ${
                  activeTab === 'deposits'
                    ? 'bg-primary-500 text-white'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                <Wallet className="inline mr-2" size={18} />
                Depósitos
              </button>
              <button
                onClick={() => setActiveTab('withdrawals')}
                className={`px-4 py-2 rounded-lg transition ${
                  activeTab === 'withdrawals'
                    ? 'bg-primary-500 text-white'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                <History className="inline mr-2" size={18} />
                Saques
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-4 py-2 rounded-lg transition ${
                  activeTab === 'favorites'
                    ? 'bg-primary-500 text-white'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                <Heart className="inline mr-2" size={18} />
                Favoritos
              </button>
              <button
                onClick={() => setActiveTab('referrals')}
                className={`px-4 py-2 rounded-lg transition ${
                  activeTab === 'referrals'
                    ? 'bg-primary-500 text-white'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                <Users className="inline mr-2" size={18} />
                Indicações
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'info' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Dados Pessoais
                  </h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="btn-outline flex items-center gap-2"
                  >
                    <Edit size={16} />
                    {isEditing ? 'Cancelar' : 'Editar'}
                  </button>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-dark-400 mb-2">
                        Nome
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-dark-400 mb-2">
                        Telefone
                      </label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) =>
                          setEditForm({ ...editForm, phone: e.target.value })
                        }
                        className="input-field"
                      />
                    </div>
                    <button
                      onClick={handleUpdateProfile}
                      className="btn-primary w-full"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="card p-3 bg-dark-200/50">
                      <p className="text-xs text-dark-400">CPF</p>
                      <p className="text-white">{formatCPF(user.cpf)}</p>
                    </div>
                    <div className="card p-3 bg-dark-200/50">
                      <p className="text-xs text-dark-400">Telefone</p>
                      <p className="text-white">{formatPhone(user.phone)}</p>
                    </div>
                    <div className="card p-3 bg-dark-200/50">
                      <p className="text-xs text-dark-400">E-mail</p>
                      <p className="text-white">{user.email}</p>
                    </div>
                    {user.inviterCode && (
                      <div className="card p-3 bg-dark-200/50">
                        <p className="text-xs text-dark-400">Código de Indicação</p>
                        <p className="text-white font-mono">{user.inviterCode}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'deposits' && (
              <div>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
                  </div>
                ) : deposits.length === 0 ? (
                  <p className="text-center text-dark-400 py-8">
                    Nenhum depósito encontrado
                  </p>
                ) : (
                  <div className="space-y-3">
                    {deposits.map((deposit) => (
                      <div key={deposit.id} className="card p-4 bg-dark-200/50">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-white font-semibold">
                              {formatCurrency(deposit.amount)}
                            </p>
                            <p className="text-xs text-dark-400">
                              {formatDateTime(deposit.createdAt)}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              deposit.status === 1
                                ? 'bg-green-500/20 text-green-500'
                                : deposit.status === 0
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : 'bg-red-500/20 text-red-500'
                            }`}
                          >
                            {deposit.statusText}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'withdrawals' && (
              <div>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
                  </div>
                ) : withdrawals.length === 0 ? (
                  <p className="text-center text-dark-400 py-8">
                    Nenhum saque encontrado
                  </p>
                ) : (
                  <div className="space-y-3">
                    {withdrawals.map((withdrawal) => (
                      <div key={withdrawal.id} className="card p-4 bg-dark-200/50">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <p className="text-white font-semibold">
                              {formatCurrency(withdrawal.amount)}
                            </p>
                            <p className="text-xs text-dark-400">
                              {formatDateTime(withdrawal.createdAt)}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              withdrawal.status === 1
                                ? 'bg-green-500/20 text-green-500'
                                : withdrawal.status === 0
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : 'bg-red-500/20 text-red-500'
                            }`}
                          >
                            {withdrawal.statusText}
                          </span>
                        </div>
                        {withdrawal.pixKey && (
                          <p className="text-xs text-dark-400">
                            PIX: {withdrawal.pixKey}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
                  </div>
                ) : favorites.length === 0 ? (
                  <p className="text-center text-dark-400 py-8">
                    Nenhum jogo favoritado
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {favorites.map((game) => (
                      <div key={game.id} className="card p-3">
                        <div className="relative w-full aspect-square mb-2 rounded-lg overflow-hidden">
                          <OptimizedImage
                          src={`http://localhost:3000${game.cover}`}
                          alt={game.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            className="object-cover"
                            quality={80}
                        />
                        </div>
                        <p className="text-white text-sm font-semibold truncate">
                          {game.name}
                        </p>
                        <p className="text-xs text-dark-400 truncate">
                          {game.provider}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'referrals' && referralStats && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Indique Amigos e Ganhe!
                </h3>
                
                {/* Card do Link */}
                <div className="card p-4 bg-gradient-to-br from-gold-500/20 to-gold-400/20 border border-gold-500/30">
                  <p className="text-sm text-gold-400 mb-2">Seu Link de Indicação:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={referralStats.referralLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded text-white text-sm"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded font-semibold transition-colors"
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-dark-400 mt-2">
                    Compartilhe este link e ganhe R$ {referralStats.bonusPerReferral} para cada amigo que se cadastrar!
                  </p>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="card p-3 bg-dark-200/50">
                    <p className="text-xs text-dark-400">Amigos Indicados</p>
                    <p className="text-2xl font-bold text-white">{referralStats.totalReferred}</p>
                  </div>
                  <div className="card p-3 bg-dark-200/50">
                    <p className="text-xs text-dark-400">Bônus Total Ganho</p>
                    <p className="text-2xl font-bold text-gold-500">
                      {formatCurrency(referralStats.totalBonusEarned)}
                    </p>
                  </div>
                </div>

                {/* Como funciona */}
                <div className="card p-4 bg-dark-200/50">
                  <h4 className="text-white font-semibold mb-2">Como funciona?</h4>
                  <ul className="space-y-2 text-sm text-dark-400">
                    <li>✅ Compartilhe seu link com amigos</li>
                    <li>✅ Quando eles se cadastrarem, AMBOS ganham R$ {referralStats.bonusPerReferral}</li>
                    <li>✅ O bônus é creditado imediatamente</li>
                    <li>⚠️ É necessário cumprir o rollover para sacar</li>
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Modal de Saque */}
      <WithdrawModal 
        isOpen={isWithdrawModalOpen} 
        onClose={() => setIsWithdrawModalOpen(false)} 
      />
    </div>
  )
}

