'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useWallet } from '@/contexts/WalletContext'
import {
  Menu,
  X,
  User,
  LogOut,
  LogIn,
  Eye,
  EyeOff,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Sparkles,
} from 'lucide-react'
import { formatCurrency, getInitials } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import RolloverProgress from '@/components/wallet/RolloverProgress'

interface HeaderProps {
  onOpenDeposit?: () => void
  onOpenWithdraw?: () => void
  onOpenLogin?: () => void
  onOpenRegister?: () => void
}

export default function Header({ onOpenDeposit, onOpenWithdraw, onOpenLogin, onOpenRegister }: HeaderProps) {
  const { user, logout, isAuthenticated } = useAuth()
  const { wallet, getTotalBalance, getWithdrawableBalance, toggleHideBalance } =
    useWallet()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const pathname = usePathname()

  const totalBalance = getTotalBalance()
  const withdrawableBalance = getWithdrawableBalance()
  
  // Verificar se está na rota de games
  const isInGameRoute = pathname?.startsWith('/games/')

  return (
    <header 
      className={`sticky top-0 z-50 border-b-2 border-gold-500/30 shadow-2xl backdrop-blur-md ${
        isInGameRoute ? 'hidden md:block' : ''
      }`}
      style={{ backgroundColor: '#0a0a0a' }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/home"
            className="flex items-center gap-2 group"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              className="text-3xl"
            >
              🎰
            </motion.div>
            <div>
              <h1 
                className="text-xl font-black tracking-tight"
                style={{ 
                  background: 'linear-gradient(to right, #f59e0b, #d97706, #f59e0b)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundSize: '200% auto',
                }}
              >
                BET
              </h1>
              <p className="text-[10px] text-gold-400 font-semibold">347</p>
            </div>
          </Link>

          {/* Desktop - Saldo e Menu do Usuário ou Login */}
          {isAuthenticated && user ? (
            <div className="hidden md:flex items-center gap-3">
              {/* Saldo Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative px-3 py-2 rounded-lg border-2 border-gold-500/40 shadow-lg overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.15), rgba(245, 158, 11, 0.1))',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                <div className="relative flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Wallet className="text-gold-400" size={18} />
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] text-gold-300 font-bold uppercase tracking-wide">Saldo</span>
                      <button
                        onClick={isInGameRoute ? undefined : toggleHideBalance}
                        className={`transition ${
                          isInGameRoute
                            ? 'opacity-30 cursor-not-allowed'
                            : 'hover:scale-110 cursor-pointer'
                        }`}
                        disabled={isInGameRoute}
                        title={isInGameRoute ? 'Saldo oculto durante o jogo' : ''}
                      >
                        <EyeOff size={12} className="text-gold-400" />
                      </button>
                    </div>
                    
                    {/* Saldo Normal */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-dark-400">Saldo:</span>
                      <p className="text-sm font-bold text-white">
                        {isInGameRoute ? '••••' : wallet?.hideBalance ? '••••' : formatCurrency(wallet?.balance || 0)}
                      </p>
                    </div>
                    
                    {/* Saldo Bonus (se houver) */}
                    {wallet && wallet.balanceBonus > 0 && (
                      <div className="flex items-center gap-1.5 -mt-0.5">
                        <span className="text-[9px] text-gold-400">Bônus:</span>
                        <p className="text-xs font-bold text-gold-500">
                          {isInGameRoute ? '••••' : wallet?.hideBalance ? '••••' : formatCurrency(wallet.balanceBonus)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Rollover Progress (compacto) */}
              {wallet && (wallet.balanceBonusRollover > 0 || wallet.balanceDepositRollover > 0) && !isInGameRoute && (
                <RolloverProgress
                  bonusRollover={wallet.balanceBonusRollover}
                  depositRollover={wallet.balanceDepositRollover}
                  compact={true}
                />
              )}

              {/* Botão Depositar */}
              <motion.button
                onClick={onOpenDeposit}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative px-4 py-2 rounded-lg font-black text-sm overflow-hidden shadow-2xl shadow-gold-500/60"
                style={{ 
                  background: 'linear-gradient(to right, #f59e0b, #d97706)',
                  color: '#111827',
                }}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                
                <div className="relative flex items-center gap-1.5">
                  <ArrowDownToLine size={16} />
                  Depositar
                </div>
              </motion.button>

              {/* Botão Sacar */}
              <motion.button
                onClick={onOpenWithdraw}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg font-bold text-sm border-2 border-gold-500/50 hover:border-gold-500 transition-all shadow-lg text-white"
                style={{ backgroundColor: '#1a1a1a' }}
              >
                <div className="flex items-center gap-1.5">
                  <ArrowUpFromLine size={16} />
                  Sacar
                </div>
              </motion.button>

              {/* Avatar e Menu */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 p-2 rounded-xl border-2 border-gold-500/30 hover:border-gold-500 transition-all"
                  style={{ backgroundColor: '#1a1a1a' }}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-base shadow-lg"
                    style={{ 
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    }}
                  >
                    {user.avatar ? (
                      <img
                        src={`http://localhost:3000${user.avatar}`}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ type: 'spring', damping: 20 }}
                      className="absolute right-0 mt-3 w-56 rounded-xl shadow-2xl border-2 border-gold-500/40 overflow-hidden"
                      style={{ backgroundColor: '#0a0a0a' }}
                    >
                      <div className="p-4 border-b border-gold-500/20">
                        <p className="text-white font-bold text-base">{user.name}</p>
                        <p className="text-xs text-gold-400">{user.email}</p>
                      </div>
                      
                      <div className="py-2">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-3 text-white hover:bg-gold-500/10 transition-colors font-semibold"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User size={20} className="text-gold-400" />
                          Meu Perfil
                        </Link>
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            logout()
                          }}
                          className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors w-full text-left font-semibold"
                        >
                          <LogOut size={20} />
                          Sair
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              {/* Botão Login */}
              <motion.button
                onClick={onOpenLogin}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 rounded-lg font-bold text-sm border-2 border-gold-500/50 hover:border-gold-500 transition-all shadow-lg text-white"
                style={{ backgroundColor: '#1a1a1a' }}
              >
                <div className="flex items-center gap-1.5">
                  <LogIn size={18} />
                  Entrar
                </div>
              </motion.button>

              {/* Botão Cadastrar */}
              <motion.button
                onClick={onOpenRegister}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative px-6 py-2.5 rounded-lg font-black text-sm overflow-hidden shadow-2xl shadow-gold-500/60"
                style={{ 
                  background: 'linear-gradient(to right, #f59e0b, #d97706)',
                  color: '#111827',
                }}
              >
                <div className="relative flex items-center gap-1.5">
                  <Sparkles size={18} />
                  Cadastrar
                </div>
              </motion.button>
            </div>
          )}

          {/* Mobile - Hamburger Menu */}
          <motion.button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="md:hidden p-2 rounded-lg border-2 border-gold-500/40"
            style={{ backgroundColor: '#1a1a1a' }}
          >
            {showMobileMenu ? <X size={24} className="text-gold-400" /> : <Menu size={24} className="text-gold-400" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && user && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t-2 border-gold-500/30"
            style={{ backgroundColor: '#0a0a0a' }}
          >
            <div className="container mx-auto px-4 py-6 space-y-4">
              {/* Saldo Mobile */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative p-5 rounded-xl border-2 border-gold-500/40 shadow-lg overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.15), rgba(245, 158, 11, 0.1))',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gold-300 font-bold uppercase tracking-wide">Saldo Total</span>
                  <button
                    onClick={isInGameRoute ? undefined : toggleHideBalance}
                    className={`transition ${
                      isInGameRoute
                        ? 'opacity-30 cursor-not-allowed'
                        : 'hover:scale-110 cursor-pointer'
                    }`}
                    disabled={isInGameRoute}
                    title={isInGameRoute ? 'Saldo oculto durante o jogo' : ''}
                  >
                    <EyeOff size={18} className="text-gold-400" />
                  </button>
                </div>
                <p className="text-3xl font-black text-white">
                  {isInGameRoute ? '••••••' : wallet?.hideBalance ? '••••••' : formatCurrency(totalBalance)}
                </p>
              </motion.div>

              {/* Botões Mobile */}
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  onClick={() => {
                    setShowMobileMenu(false)
                    onOpenDeposit?.()
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="relative py-4 rounded-xl font-black text-base overflow-hidden shadow-xl"
                  style={{ 
                    background: 'linear-gradient(to right, #f59e0b, #d97706)',
                    color: '#111827',
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <ArrowDownToLine size={20} />
                    Depositar
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => {
                    setShowMobileMenu(false)
                    onOpenWithdraw?.()
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="py-4 rounded-xl font-bold text-base border-2 border-gold-500/50 transition-all shadow-lg text-white"
                  style={{ backgroundColor: '#1a1a1a' }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <ArrowUpFromLine size={20} />
                    Sacar
                  </div>
                </motion.button>
              </div>

              {/* Links Mobile */}
              <div className="space-y-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-4 rounded-xl text-white font-semibold border-2 border-gold-500/20 hover:border-gold-500/50 transition-all"
                  style={{ backgroundColor: '#1a1a1a' }}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <User size={22} className="text-gold-400" />
                  Meu Perfil
                </Link>
                <button
                  onClick={() => {
                    setShowMobileMenu(false)
                    logout()
                  }}
                  className="flex items-center gap-3 px-4 py-4 rounded-xl text-red-400 font-semibold border-2 border-red-500/20 hover:border-red-500/50 transition-all w-full text-left"
                  style={{ backgroundColor: '#1a1a1a' }}
                >
                  <LogOut size={22} />
                  Sair
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
