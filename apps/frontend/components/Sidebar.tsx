'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Home, 
  ShoppingBag, 
  Package, 
  Users, 
  Settings, 
  BarChart3, 
  FileText,
  User,
  Heart,
  CreditCard,
  Truck,
  LogOut,
  ChevronRight,
  Crown,
  Shield
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

// Navigation items untuk development (kedua role terbuka)
const navigationItems = {
  user: [
    { name: 'Dashboard', icon: Home, href: '/dashboard', color: 'text-neon-blue' },
    { name: 'Produk', icon: Package, href: '/products', color: 'text-neon-purple' },
    { name: 'Keranjang', icon: ShoppingBag, href: '/cart', color: 'text-neon-pink' },
    { name: 'Wishlist', icon: Heart, href: '/wishlist', color: 'text-neon-green' },
    { name: 'Pesanan', icon: Truck, href: '/orders', color: 'text-neon-yellow' },
    { name: 'Pembayaran', icon: CreditCard, href: '/payments', color: 'text-neon-blue' },
    { name: 'Profil', icon: User, href: '/profile', color: 'text-neon-purple' },
  ],
  admin: [
    { name: 'Dashboard', icon: Home, href: '/admin', color: 'text-neon-blue' },
    { name: 'Produk', icon: Package, href: '/admin/products', color: 'text-neon-purple' },
    { name: 'Kategori', icon: FileText, href: '/admin/categories', color: 'text-neon-pink' },
    { name: 'Pengguna', icon: Users, href: '/admin/users', color: 'text-neon-green' },
    { name: 'Pesanan', icon: ShoppingBag, href: '/admin/orders', color: 'text-neon-yellow' },
    { name: 'Laporan', icon: BarChart3, href: '/admin/reports', color: 'text-neon-blue' },
    { name: 'Pengaturan', icon: Settings, href: '/admin/settings', color: 'text-neon-purple' },
  ]
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [activeRole, setActiveRole] = useState<'user' | 'admin'>('user')

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-dark-900/95 backdrop-blur-xl border-r border-white/10 z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-neon rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎭</span>
                </div>
                <span className="text-xl font-bold text-gradient">Blangkis</span>
              </div>
              <button
                onClick={onClose}
                className="glass-button p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Role Selector (Development Mode) */}
            <div className="p-4 border-b border-white/10">
              <div className="flex bg-dark-800 rounded-lg p-1">
                <button
                  onClick={() => setActiveRole('user')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeRole === 'user'
                      ? 'bg-neon-blue text-white shadow-neon'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  User
                </button>
                <button
                  onClick={() => setActiveRole('admin')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeRole === 'admin'
                      ? 'bg-neon-purple text-white shadow-neon-purple'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <Crown className="w-4 h-4 inline mr-2" />
                  Admin
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
                  {activeRole === 'user' ? 'Menu Pengguna' : 'Menu Admin'}
                </h3>
              </div>

              {navigationItems[activeRole].map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="nav-link group"
                >
                  <div className={`p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-all duration-200 ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="flex-1">{item.name}</span>
                  <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors duration-200" />
                </motion.a>
              ))}
            </nav>

            {/* User Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
              <div className="glass-card">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-neon rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">
                      {activeRole === 'user' ? 'Pengguna' : 'Administrator'}
                    </p>
                    <p className="text-sm text-white/60">
                      {activeRole === 'user' ? 'user@example.com' : 'admin@blangkis.com'}
                    </p>
                  </div>
                </div>
                <button className="w-full glass-button text-sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  Keluar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Komponen UserSidebar: hanya menu user, tanpa role switcher
export function UserSidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-dark-900/95 backdrop-blur-xl border-r border-white/10 z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-neon rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎭</span>
                </div>
                <span className="text-xl font-bold text-gradient">Blangkis</span>
              </div>
              <button
                onClick={onClose}
                className="glass-button p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
                  Menu Pengguna
                </h3>
              </div>

              {navigationItems.user.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="nav-link group"
                >
                  <div className={`p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-all duration-200 ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="flex-1">{item.name}</span>
                  <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors duration-200" />
                </motion.a>
              ))}
            </nav>

            {/* User Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
              <div className="glass-card">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-neon rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">Pengguna</p>
                    <p className="text-sm text-white/60">user@example.com</p>
                  </div>
                </div>
                <button className="w-full glass-button text-sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  Keluar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
