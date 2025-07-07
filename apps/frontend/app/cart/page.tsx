'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Trash2, 
  Minus, 
  Plus, 
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Truck,
  Shield,
  RotateCcw
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/useCartStore'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function CartPage() {
  const router = useRouter()
  const { items, totalItems, subtotal, shippingCost, total, totalDiskon, removeItem, updateQuantity, clearCart } = useCartStore()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId)
      toast.success('Produk dihapus dari keranjang')
    } else {
      updateQuantity(productId, newQuantity)
      toast.success('Jumlah produk diperbarui')
    }
  }

  const handleRemoveItem = (productId: number) => {
    removeItem(productId)
    toast.success('Produk dihapus dari keranjang')
  }

  const handleClearCart = () => {
    clearCart()
    toast.success('Keranjang belanja dikosongkan')
  }

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Keranjang belanja kosong')
      return
    }
    router.push('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-16 bg-white dark:bg-dark-900 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Keranjang Belanja Kosong</h2>
            <p className="text-gray-700 dark:text-white/80 mb-8">Belum ada produk di keranjang belanja Anda</p>
            <button
              onClick={() => router.push('/products')}
              className="futuristic-button"
            >
              Mulai Belanja
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16 bg-white dark:bg-dark-900 transition-colors duration-500">
      {/* Header */}
      <div className="bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.back()}
                className="glass-button p-2 rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Keranjang Belanja</h1>
                <p className="text-gray-700 dark:text-white/80 mt-1">{totalItems} produk di keranjang</p>
              </div>
            </div>
            <button
              onClick={handleClearCart}
              className="flex flex-col items-center justify-center gap-1 px-6 py-3 rounded-lg border border-gray-200 dark:border-white/10 font-semibold transition-all duration-300
                bg-gray-100 hover:bg-gray-200 text-red-500
                dark:bg-dark-800 dark:hover:bg-dark-700 dark:text-red-400"
            >
              <Trash2 className="w-7 h-7 mb-1" />
              <span className="font-semibold">Kosongkan</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card bg-white dark:bg-dark-900 border border-gray-200 dark:border-white/10"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-100 dark:bg-dark-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="w-full h-full bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center">
                      <span className="text-2xl">🎭</span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {item.product.name}
                      </h3>
                      <button
                        onClick={() => handleRemoveItem(item.product.id)}
                        className="text-red-500 hover:text-red-400 transition-colors duration-200"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <p className="text-gray-700 dark:text-white/80 text-sm mb-3">
                      {item.product.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center rounded-lg border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-dark-800">
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-dark-800 dark:hover:bg-dark-700 dark:text-white transition-colors duration-200 rounded-l-lg"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 text-gray-900 dark:text-white font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-dark-800 dark:hover:bg-dark-700 dark:text-white transition-colors duration-200 rounded-r-lg"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-lg font-bold text-neon-blue">
                            {formatPrice(
                              (item.product.discount && item.product.discount > 0
                                ? Math.round(item.product.price * (1 - item.product.discount / 100))
                                : item.product.price
                              ) * item.quantity
                            )}
                          </p>
                          {item.product.discount && item.product.discount > 0 ? (
                            <p className="text-sm text-gray-400 dark:text-white/50 line-through">
                              {formatPrice(item.product.price)} per item
                            </p>
                          ) : (
                            <p className="text-sm text-gray-700 dark:text-white/80">
                              {formatPrice(item.product.price)} per item
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card sticky top-24 bg-white dark:bg-dark-900 border border-gray-200 dark:border-white/10">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Ringkasan Pesanan</h2>
              
              {/* Order Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-white/80">Subtotal ({totalItems} item)</span>
                  <span className="text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-white/80">Ongkos Kirim</span>
                  <span className="text-gray-900 dark:text-white">{formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-white/80">Diskon</span>
                  <span className="text-green-600 dark:text-green-400">-{formatPrice(totalDiskon)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-white/10 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                    <span className="text-2xl font-bold text-neon-blue">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full futuristic-button text-lg py-4 mb-4 flex flex-col items-center justify-center gap-1"
              >
                <CreditCard className="w-7 h-7 mb-1" />
                <span className="font-semibold">Checkout</span>
              </button>

              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
                    <Truck className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700 dark:text-white/80">Pengiriman cepat</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700 dark:text-white/80">Pembayaran aman & terpercaya</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
                    <RotateCcw className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700 dark:text-white/80">Garansi 30 hari pengembalian</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 