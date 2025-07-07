'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft,
  MapPin,
  Truck,
  CreditCard,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/useCartStore'
import { useOrderStore, ShippingAddress, PaymentMethod } from '@/store/useOrderStore'
import { rajaOngkirService, mockProvinces, mockCities, mockShippingCosts, Province, City, ShippingCost } from '@/lib/rajaongkir'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/useAuthStore'
import { apiClient } from '@/lib/api'

type CheckoutStep = 'address' | 'shipping' | 'payment' | 'review'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalItems, subtotal, total, totalDiskon, clearCart } = useCartStore()
  const { 
    shippingAddress, 
    selectedShipping, 
    selectedPayment,
    setShippingAddress, 
    setSelectedShipping, 
    setSelectedPayment,
    createOrder,
    availablePaymentMethods
  } = useOrderStore()
  const { user } = useAuthStore()

  // State untuk form checkout
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address')
  const [isLoading, setIsLoading] = useState(false)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [shippingCosts, setShippingCosts] = useState<ShippingCost[]>([])
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [addressForm, setAddressForm] = useState<ShippingAddress>({
    name: '',
    phone: '',
    email: '',
    address: '',
    province: '',
    city: '',
    postal_code: ''
  })

  // Jika belum login, redirect ke /login
  useEffect(() => {
    if (!user) {
      router.replace('/login')
    }
  }, [user, router])

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        // Use mock data for development
        setProvinces(mockProvinces)
      } catch (error) {
        console.error('Error loading provinces:', error)
        toast.error('Gagal memuat data provinsi')
      }
    }
    loadProvinces()
  }, [])

  // Load cities when province changes
  useEffect(() => {
    if (selectedProvince) {
      const loadCities = async () => {
        try {
          const filteredCities = mockCities.filter(city => city.province_id === selectedProvince)
          setCities(filteredCities)
        } catch (error) {
          console.error('Error loading cities:', error)
          toast.error('Gagal memuat data kota')
        }
      }
      loadCities()
    } else {
      setCities([])
    }
  }, [selectedProvince])

  // Calculate shipping costs when address is complete
  useEffect(() => {
    if (addressForm.city && items.length > 0) {
      calculateShippingCosts()
    }
  }, [addressForm.city, items])

  const calculateShippingCosts = async () => {
    setIsLoading(true)
    try {
      // Use mock data for development
      setShippingCosts(mockShippingCosts)
    } catch (error) {
      console.error('Error calculating shipping costs:', error)
      toast.error('Gagal menghitung ongkos kirim')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddressSubmit = () => {
    if (!addressForm.name || !addressForm.phone || !addressForm.email || 
        !addressForm.province || !addressForm.city || !addressForm.address) {
      toast.error('Mohon lengkapi semua data alamat pengiriman')
      return
    }
    
    setShippingAddress(addressForm)
    setCurrentStep('shipping')
  }

  const handleShippingSelect = (courier: string, service: string, cost: number, etd: string) => {
    setSelectedShipping({ courier, service, cost, etd })
    setCurrentStep('payment')
  }

  const handlePaymentSelect = (payment: PaymentMethod) => {
    setSelectedPayment(payment)
    setCurrentStep('review')
  }

  const handlePlaceOrder = async () => {
    if (!shippingAddress || !selectedShipping || !selectedPayment) {
      toast.error('Mohon lengkapi semua data checkout')
      return
    }

    setIsLoading(true)
    try {
      // Siapkan data order sesuai backend
      const orderPayload = {
        userId: String(user.id),
        items: items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        shipping: {
          name: shippingAddress.name,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
          address: shippingAddress.address,
          province: shippingAddress.province,
          city: shippingAddress.city,
          postalCode: shippingAddress.postal_code,
          courier: selectedShipping.courier,
          service: selectedShipping.service,
          etd: selectedShipping.etd,
          cost: selectedShipping.cost
        },
        payment: {
          method: selectedPayment.name,
          type: selectedPayment.type,
          status: 'pending'
        },
        status: 'pesanan_dibuat',
        subtotal: subtotal,
        total: subtotal + selectedShipping.cost,
        shippingCost: selectedShipping.cost
      }
      const response = await apiClient.createOrder(orderPayload)
      clearCart()
      toast.success('Pesanan berhasil dibuat!')
      router.push(`/orders/${response.id}`)
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Gagal membuat pesanan')
    } finally {
      setIsLoading(false)
    }
  }

  const getStepStatus = (step: CheckoutStep) => {
    if (currentStep === step) return 'current'
    if (currentStep === 'shipping' && step === 'address') return 'completed'
    if (currentStep === 'payment' && ['address', 'shipping'].includes(step)) return 'completed'
    if (currentStep === 'review' && ['address', 'shipping', 'payment'].includes(step)) return 'completed'
    return 'pending'
  }

  if (!user) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-16 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Keranjang Kosong</h2>
            <p className="text-gray-700 dark:text-white/60 mb-8">Tidak ada produk untuk checkout</p>
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
    <div className="min-h-screen pt-16 bg-white dark:bg-dark-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-dark-900 dark:to-dark-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.back()}
              className="glass-button p-2 rounded-full bg-white dark:bg-dark-800 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Checkout</h1>
              <p className="text-gray-700 dark:text-white/70 mt-1">{totalItems} produk • {formatPrice(subtotal)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Steps */}
            <div className="glass-card bg-white dark:bg-dark-900 border border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                {[
                  { step: 'address' as CheckoutStep, label: 'Alamat', icon: MapPin },
                  { step: 'shipping' as CheckoutStep, label: 'Pengiriman', icon: Truck },
                  { step: 'payment' as CheckoutStep, label: 'Pembayaran', icon: CreditCard },
                  { step: 'review' as CheckoutStep, label: 'Review', icon: CheckCircle }
                ].map(({ step, label, icon: Icon }, index) => {
                  const status = getStepStatus(step)
                  return (
                    <div key={step} className="flex items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        status === 'completed' ? 'bg-green-500' :
                        status === 'current' ? 'bg-neon-blue' : 'bg-gray-200 dark:bg-white/10'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          status === 'completed' || status === 'current' ? 'text-white' : 'text-gray-500 dark:text-white/50'
                        }`} />
                      </div>
                      <span className={`ml-2 text-sm font-medium ${
                        status === 'completed' ? 'text-green-400' :
                        status === 'current' ? 'text-neon-blue' : 'text-gray-500 dark:text-white/50'
                      }`}>
                        {label}
                      </span>
                      {index < 3 && (
                        <div className={`w-8 h-px mx-4 ${
                          status === 'completed' ? 'bg-green-500' : 'bg-gray-200 dark:bg-white/10'
                        }`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 'address' && (
                  <div className="glass-card bg-white dark:bg-dark-900 border border-gray-200 dark:border-white/10">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Alamat Pengiriman</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-2">Nama Lengkap</label>
                        <input
                          type="text"
                          value={addressForm.name}
                          onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                          className="w-full glass-input bg-white dark:bg-dark-800 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10"
                          placeholder="Masukkan nama lengkap"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-2">Nomor Telepon</label>
                        <input
                          type="tel"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          className="w-full glass-input bg-white dark:bg-dark-800 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10"
                          placeholder="08xxxxxxxxxx"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-2">Email</label>
                        <input
                          type="email"
                          value={addressForm.email}
                          onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                          className="w-full glass-input bg-white dark:bg-dark-800 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10"
                          placeholder="email@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-2">Kode Pos</label>
                        <input
                          type="text"
                          value={addressForm.postal_code}
                          onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                          className="w-full glass-input bg-white dark:bg-dark-800 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10"
                          placeholder="12345"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-2">Provinsi</label>
                        <select
                          value={selectedProvince}
                          onChange={(e) => {
                            setSelectedProvince(e.target.value)
                            setAddressForm({ ...addressForm, province: e.target.value, city: '' })
                          }}
                          className="w-full glass-input bg-white dark:bg-dark-800 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10"
                        >
                          <option value="">Pilih Provinsi</option>
                          {provinces.map((province) => (
                            <option key={province.province_id} value={province.province_id}>
                              {province.province}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-2">Kota/Kabupaten</label>
                        <select
                          value={selectedCity}
                          onChange={(e) => {
                            setSelectedCity(e.target.value)
                            setAddressForm({ ...addressForm, city: e.target.value })
                          }}
                          className="w-full glass-input bg-white dark:bg-dark-800 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10"
                          disabled={!selectedProvince}
                        >
                          <option value="">Pilih Kota</option>
                          {cities.map((city) => (
                            <option key={city.city_id} value={city.city_id}>
                              {city.city_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-2">Alamat Lengkap</label>
                        <textarea
                          value={addressForm.address}
                          onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                          className="w-full glass-input bg-white dark:bg-dark-800 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10"
                          rows={3}
                          placeholder="Masukkan alamat lengkap"
                        />
                      </div>
                    </div>
                    <div className="mt-6">
                      <button
                        onClick={handleAddressSubmit}
                        className="futuristic-button w-full"
                      >
                        Lanjut ke Pengiriman
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 'shipping' && (
                  <div className="glass-card bg-white dark:bg-dark-900">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Pilihan Pengiriman</h2>
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-neon-blue" />
                        <span className="ml-2 text-gray-900 dark:text-white">Menghitung ongkos kirim...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {shippingCosts.map((courier) => (
                          <div key={courier.code} className="border border-gray-200 dark:border-white/10 rounded-lg p-4 bg-gray-50 dark:bg-dark-800">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{courier.name}</h3>
                            <div className="space-y-2">
                              {courier.costs.map((service, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleShippingSelect(
                                    courier.code,
                                    service.service,
                                    service.cost[0].value,
                                    service.cost[0].etd
                                  )}
                                  className="w-full flex items-center justify-between p-3 glass rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200"
                                >
                                  <div className="text-left">
                                    <p className="font-medium text-gray-900 dark:text-white">{service.service}</p>
                                    <p className="text-sm text-gray-600 dark:text-white/60">{service.description}</p>
                                    <p className="text-xs text-gray-400 dark:text-white/50">Estimasi: {service.cost[0].etd} hari</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-neon-blue">{formatPrice(service.cost[0].value)}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 'payment' && (
                  <div className="glass-card bg-white dark:bg-dark-900">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Metode Pembayaran</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availablePaymentMethods.map((payment) => (
                        <button
                          key={payment.id}
                          onClick={() => handlePaymentSelect(payment)}
                          className="flex items-center p-4 bg-gray-50 dark:bg-dark-800 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200"
                        >
                          <div className="w-12 h-12 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg flex items-center justify-center mr-4">
                            <CreditCard className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-900 dark:text-white">{payment.name}</p>
                            <p className="text-sm text-gray-600 dark:text-white/60 capitalize">{payment.type.replace('_', ' ')}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 'review' && (
                  <div className="glass-card bg-white dark:bg-dark-900">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Review Pesanan</h2>
                    
                    {/* Order Summary */}
                    <div className="space-y-4 mb-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Produk yang Dibeli</h3>
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-dark-800 rounded-lg">
                          <div className="w-16 h-16 bg-gradient-to-br from-dark-200 to-dark-700 dark:from-dark-800 dark:to-dark-700 rounded-lg flex items-center justify-center">
                            <span className="text-xl">🎭</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{item.product.name}</p>
                            <p className="text-sm text-gray-600 dark:text-white/60">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-bold text-neon-blue">{formatPrice(item.product.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Info */}
                    <div className="space-y-4 mb-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Informasi Pengiriman</h3>
                      <div className="p-4 bg-gray-50 dark:bg-dark-800 rounded-lg">
                        <p className="font-medium text-gray-900 dark:text-white">{shippingAddress?.name}</p>
                        <p className="text-gray-600 dark:text-white/60">{shippingAddress?.phone}</p>
                        <p className="text-gray-600 dark:text-white/60">{shippingAddress?.address}</p>
                        <p className="text-gray-600 dark:text-white/60">{shippingAddress?.city}, {shippingAddress?.province} {shippingAddress?.postal_code}</p>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="space-y-4 mb-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Metode Pembayaran</h3>
                      <div className="p-4 bg-gray-50 dark:bg-dark-800 rounded-lg">
                        <p className="font-medium text-gray-900 dark:text-white">{selectedPayment?.name}</p>
                        <p className="text-gray-600 dark:text-white/60 capitalize">{selectedPayment?.type.replace('_', ' ')}</p>
                      </div>
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      className="w-full futuristic-button text-lg py-4"
                    >
                      Buat Pesanan
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card bg-white dark:bg-dark-900 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Ringkasan Pesanan</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-white/60">Subtotal ({totalItems} item)</span>
                  <span className="text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
                </div>
                {selectedShipping && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-white/60">Ongkos Kirim</span>
                    <span className="text-gray-900 dark:text-white">{formatPrice(selectedShipping.cost)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-white/10 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                    <span className="text-2xl font-bold text-neon-blue">
                      {formatPrice(subtotal + (selectedShipping?.cost || 0))}
                    </span>
                  </div>
                </div>
              </div>

              {selectedShipping && (
                <div className="p-4 bg-gray-100 dark:bg-dark-800 rounded-lg mb-4">
                  <p className="text-sm text-gray-600 dark:text-white/60 mb-2">Estimasi Pengiriman</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedShipping.etd} hari</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 