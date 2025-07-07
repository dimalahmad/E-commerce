'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
  Copy,
  Download,
  Upload,
  Eye,
  X
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useOrderStore } from '@/store/useOrderStore'
import { formatPrice } from '@/lib/utils'
import { generateInvoicePDF } from '@/lib/pdfGenerator'
import PaymentProofUpload from '@/components/PaymentProofUpload'
import toast from 'react-hot-toast'
import { apiClient } from '@/lib/api'

const statusConfig = {
  pesanan_dibuat: {
    label: 'Pesanan Dibuat',
    color: 'text-gray-400',
    bgColor: 'bg-gray-400/20',
    icon: Package
  },
  menunggu_pembayaran: {
    label: 'Menunggu Pembayaran',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/20',
    icon: Clock
  },
  pembayaran_diterima: {
    label: 'Pembayaran Diterima',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/20',
    icon: CheckCircle
  },
  sedang_diproses: {
    label: 'Sedang Diproses',
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/20',
    icon: Package
  },
  dalam_pengiriman: {
    label: 'Dalam Pengiriman',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/20',
    icon: Truck
  },
  terkirim: {
    label: 'Terkirim',
    color: 'text-green-400',
    bgColor: 'bg-green-400/20',
    icon: CheckCircle
  },
  cancelled: {
    label: 'Dibatalkan',
    color: 'text-red-400',
    bgColor: 'bg-red-400/20',
    icon: Clock
  },
  pending: {
    label: 'Menunggu Pembayaran',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/20',
    icon: Clock
  },
  paid: {
    label: 'Pembayaran Diterima',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/20',
    icon: CheckCircle
  },
  processing: {
    label: 'Sedang Diproses',
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/20',
    icon: Package
  },
  shipped: {
    label: 'Dalam Pengiriman',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/20',
    icon: Truck
  },
  delivered: {
    label: 'Terkirim',
    color: 'text-green-400',
    bgColor: 'bg-green-400/20',
    icon: CheckCircle
  },
  menunggu_konfirmasi_pembayaran: {
    label: 'Menunggu Konfirmasi Pembayaran',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/20',
    icon: Clock
  }
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getOrder, uploadPaymentProof } = useOrderStore()
  const [order, setOrder] = useState<any>(null)
  const [showPaymentUpload, setShowPaymentUpload] = useState(false)
  const [showPaymentProof, setShowPaymentProof] = useState(false)

  useEffect(() => {
    if (params.id) {
      (async () => {
        try {
          const foundOrder = await apiClient.getOrder(params.id as string)
          if (foundOrder) {
            setOrder(foundOrder)
          } else {
            toast.error('Pesanan tidak ditemukan')
            router.push('/orders')
          }
        } catch (err) {
          toast.error('Pesanan tidak ditemukan')
          router.push('/orders')
        }
      })()
    }
  }, [params.id, router])

  const copyOrderNumber = () => {
    if (order) {
      navigator.clipboard.writeText(order.orderNumber)
      toast.success('Nomor pesanan disalin!')
    }
  }

  const normalizeOrderForInvoice = (order: any) => {
    return {
      ...order,
      items: order.items.map((item: any) => ({
        ...item,
        product: item.product || { name: item.productName || '-', description: item.productDescription || '-' },
        subtotal: item.subtotal !== undefined ? item.subtotal : item.price * item.quantity,
      })),
      paymentMethod: order.paymentMethod || {
        name: order.payment?.method || '-',
        type: order.payment?.type || order.payment?.status || '-',
      },
      shippingMethod: order.shippingMethod || {
        courier: order.shipping?.courier || '-',
        service: order.shipping?.service || '-',
        etd: order.shipping?.etd || '-',
      },
      shippingAddress: order.shippingAddress || {
        name: order.shipping?.name || '-',
        phone: order.shipping?.phone || '-',
        address: order.shipping?.address || '-',
        city: order.shipping?.city || '-',
        province: order.shipping?.province || '',
        postal_code: order.shipping?.postalCode || '-',
      },
      subtotal: order.subtotal !== undefined ? order.subtotal : order.items.reduce((sum: number, i: any) => sum + (i.subtotal !== undefined ? i.subtotal : i.price * i.quantity), 0),
    };
  };

  const downloadInvoice = async () => {
    if (!order) return
    try {
      toast.loading('Membuat invoice...')
      const normalized = normalizeOrderForInvoice(order)
      await generateInvoicePDF(normalized)
      toast.dismiss()
      toast.success('Invoice berhasil diunduh!')
    } catch (error) {
      toast.dismiss()
      toast.error('Gagal membuat invoice')
      console.error('Error generating invoice:', error)
    }
  }

  const handlePaymentProofUpload = async (proofUrl: string) => {
    if (order) {
      const updated = await apiClient.getOrder(order.id);
      setOrder(updated);
      setShowPaymentUpload(false);
    }
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white/60">Memuat detail pesanan...</p>
          </div>
        </div>
      </div>
    )
  }

  const status = statusConfig[order.status] || {
    label: order.status,
    color: 'text-gray-400',
    bgColor: 'bg-gray-400/20',
    icon: Package
  }
  const StatusIcon = status.icon

  return (
    <div className="min-h-screen pt-16 bg-white dark:bg-dark-900 text-gray-900 dark:text-white transition-colors duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-gray-100 dark:from-dark-900 dark:to-dark-800 py-8">
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
                <h1 className="text-3xl font-bold text-gradient">Detail Pesanan</h1>
                <p className="text-gray-600 dark:text-white/70 mt-1">Order #{order.orderNumber || order.id}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-4">
              <button
                onClick={copyOrderNumber}
                className="glass-button text-sm bg-gray-200 dark:bg-dark-700 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20 flex items-center justify-center gap-2"
              >
                <span className="flex items-center justify-center"><Copy className="w-4 h-4" /></span>
                <span>Salin No. Order</span>
              </button>
              <button
                onClick={downloadInvoice}
                className="glass-button text-sm bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 text-white border border-blue-500 dark:border-blue-700 flex items-center justify-center gap-2"
              >
                <span className="flex items-center justify-center"><Download className="w-4 h-4" /></span>
                <span>Invoice</span>
              </button>
              {order.paymentProof ? (
                <button
                  onClick={() => setShowPaymentProof(true)}
                  className="glass-button text-sm bg-neon-blue hover:bg-neon-blue/80 text-white flex items-center justify-center gap-2"
                >
                  <span className="flex items-center justify-center"><Eye className="w-4 h-4" /></span>
                  <span>Lihat Bukti Pembayaran</span>
                </button>
              ) : ((order.status === 'menunggu_pembayaran' || order.status === 'pesanan_dibuat') && (
                <button
                  onClick={() => setShowPaymentUpload(true)}
                  className="glass-button text-sm bg-neon-blue hover:bg-neon-blue/80 text-white flex items-center justify-center gap-2"
                >
                  <span className="flex items-center justify-center"><Upload className="w-4 h-4" /></span>
                  <span>Upload Bukti</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="glass-card bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 shadow-md dark:shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Status Pesanan</h2>
              {/* Tombol Pesanan Diterima */}
              {order.status === 'dalam_pengiriman' && (
                <button
                  className="glass-button bg-neon-blue hover:bg-neon-blue/80 text-white font-semibold px-4 py-2 rounded mb-4"
                  onClick={async () => {
                    await apiClient.updateOrderStatus(order.id, 'terkirim');
                    const updated = await apiClient.getOrder(order.id);
                    setOrder(updated);
                  }}
                >
                  Pesanan Diterima
                </button>
              )}
              {/* Stepper Status Interaktif */}
              <div className="flex flex-col gap-4 mt-2">
                {[
                  { value: 'pesanan_dibuat', label: 'Pesanan Dibuat', icon: Package },
                  { value: 'menunggu_pembayaran', label: 'Menunggu Pembayaran', icon: Clock },
                  { value: 'menunggu_konfirmasi_pembayaran', label: 'Menunggu Konfirmasi Pembayaran', icon: Clock },
                  { value: 'pembayaran_diterima', label: 'Pembayaran Diterima', icon: CheckCircle },
                  { value: 'sedang_diproses', label: 'Sedang Diproses', icon: Package },
                  { value: 'dalam_pengiriman', label: 'Dalam Pengiriman', icon: Truck },
                  { value: 'terkirim', label: 'Terkirim', icon: CheckCircle },
                ].map((step, idx, arr) => {
                  const currentIdx = arr.findIndex(s => s.value === order.status);
                  const isActive = idx === currentIdx;
                  const isCompleted = idx < currentIdx;
                  const Icon = step.icon;
                  return (
                    <div key={step.value} className="flex items-center gap-3">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all
                        ${isCompleted ? 'bg-neon-blue border-neon-blue' : isActive ? 'bg-white dark:bg-dark-800 border-neon-blue animate-pulse' : 'bg-gray-200 dark:bg-dark-700 border-gray-300 dark:border-white/20'}
                      `}>
                        {isCompleted ? <CheckCircle className="w-5 h-5 text-white" /> : <Icon className={`w-5 h-5 ${isActive ? 'text-neon-blue' : 'text-gray-400 dark:text-gray-500'}`} />}
                      </div>
                      <div>
                        <span className={`font-semibold text-base ${isActive ? 'text-neon-blue' : isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>{step.label}</span>
                        {isActive && order.updatedAt && (
                          <div className="text-xs text-gray-500 dark:text-white/60">{new Date(order.updatedAt).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items */}
            <div className="glass-card bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 shadow-md dark:shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Produk yang Dibeli</h2>
              <div className="space-y-4">
                {order.items.map((item: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 glass rounded-lg bg-gray-100 dark:bg-dark-700"
                  >
                    <div className="w-20 h-20 bg-gray-200 dark:bg-dark-800 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🎭</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{item.product?.name || item.productName}</h3>
                      <p className="text-gray-500 dark:text-white/60 text-sm">Qty: {item.quantity}</p>
                      <p className="text-gray-500 dark:text-white/60 text-sm">{formatPrice(item.price)} per item</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neon-blue">{formatPrice((item.subtotal !== undefined ? item.subtotal : (item.price * item.quantity)) || 0)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="glass-card bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 shadow-md dark:shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Informasi Pengiriman</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-neon-blue" />
                    <h3 className="font-medium text-gray-900 dark:text-white">Alamat Pengiriman</h3>
                  </div>
                  <div className="space-y-1 text-gray-900 dark:text-white/80">
                    <p className="font-medium">{order.shipping?.name || '-'}</p>
                    <p>{order.shipping?.email || '-'}</p>
                    <p>{order.shipping?.phone || '-'}</p>
                    <p>{order.shipping?.address || '-'}</p>
                    <p>{order.shipping?.city || '-'}{order.shipping?.province ? `, ${order.shipping.province}` : ''}</p>
                    <p>Kode Pos: {order.shipping?.postalCode || '-'}</p>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="w-5 h-5 text-neon-purple" />
                    <h3 className="font-medium text-gray-900 dark:text-white">Metode Pengiriman</h3>
                  </div>
                  <div className="space-y-1 text-gray-900 dark:text-white/80">
                    <p className="font-medium">{order.shipping?.courier?.toUpperCase() || '-'}</p>
                    <p>Layanan: {order.shipping?.service || '-'}</p>
                    <p>Estimasi: {order.shipping?.etd || '-'} hari</p>
                    <p className="font-semibold text-neon-blue">{formatPrice(order.shipping?.cost || 0)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="glass-card bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 shadow-md dark:shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Informasi Pembayaran</h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-neon-green to-neon-blue rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{order.payment?.method || '-'}</p>
                  <p className="text-gray-500 dark:text-white/60 capitalize">{order.payment?.type?.replace('_', ' ') || order.payment?.status || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card sticky top-24 bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 shadow-md dark:shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Ringkasan Pesanan</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-white/60">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-white/60">Ongkos Kirim</span>
                  <span className="text-gray-900 dark:text-white">{formatPrice(order.shippingCost)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-white/10 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                    <span className="text-2xl font-bold text-neon-blue">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-white/60">Order ID</span>
                  <span className="text-gray-900 dark:text-white font-mono">{order.orderNumber || order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-white/60">Tanggal Order</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(order.createdAt).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-white/60">Status</span>
                  <span className={`font-medium ${status.color}`}>{status.label}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Proof Upload Modal */}
      <AnimatePresence>
        {showPaymentUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPaymentUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 shadow-md dark:shadow-lg text-gray-900 dark:text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upload Bukti Pembayaran</h2>
                <button
                  onClick={() => setShowPaymentUpload(false)}
                  className="glass-button p-2 rounded-full bg-gray-200 dark:bg-dark-700 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <PaymentProofUpload
                orderId={order?.id || ''}
                onUpload={handlePaymentProofUpload}
                currentProof={order?.paymentProof}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Proof View Modal */}
      <AnimatePresence>
        {showPaymentProof && order?.paymentProof && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPaymentProof(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card max-w-4xl w-full bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 shadow-md dark:shadow-lg text-gray-900 dark:text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Bukti Pembayaran</h2>
                <button
                  onClick={() => setShowPaymentProof(false)}
                  className="glass-button p-2 rounded-full bg-gray-200 dark:bg-dark-700 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-center">
                <img
                  src={order.paymentProof}
                  alt="Payment proof"
                  className="max-w-full max-h-[70vh] rounded-lg mx-auto"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 