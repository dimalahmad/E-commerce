'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Share2, 
  Truck, 
  Shield, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Eye,
  MessageCircle,
  Package,
  CheckCircle,
  ArrowLeft,
  Star as StarIcon
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { formatPrice, getStatusColor, getStatusText } from '@/lib/utils'
import { useCartStore } from '@/store/useCartStore'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'
import { Product } from '@/types'

// Mock reviews data (since we don't have reviews API yet)
const mockReviews = [
  {
    id: 1,
    user: 'Ahmad Rizki',
    rating: 5,
    date: '2024-01-10',
    comment: 'Kualitas sangat bagus! Motif batiknya indah dan bahan terasa premium. Sangat puas dengan pembelian ini.',
    verified: true
  },
  {
    id: 2,
    user: 'Siti Nurhaliza',
    rating: 4,
    date: '2024-01-08',
    comment: 'Blangkon yang elegan dan nyaman dipakai. Ukurannya pas dan motifnya sesuai dengan yang diharapkan.',
    verified: true
  },
  {
    id: 3,
    user: 'Budi Santoso',
    rating: 5,
    date: '2024-01-05',
    comment: 'Pengiriman cepat dan produk sesuai deskripsi. Kualitas bahan sangat baik dan motif batiknya autentik.',
    verified: false
  }
]

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem } = useCartStore()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [showImageModal, setShowImageModal] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [category, setCategory] = useState<any>(null)

  // Fetch product data from backend
  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return
      
      try {
        setLoading(true)
        setError(null)
        
        // Fetch product by ID
        const foundProduct = await apiClient.getProduct(Number(params.id))
        // Parse specifications if string
        if (foundProduct && typeof foundProduct.specifications === 'string') {
          foundProduct.specifications = JSON.parse(foundProduct.specifications)
        }
        setProduct(foundProduct)
        
        // Set category from product data (backend already includes category object)
        if (foundProduct.category) {
          setCategory(foundProduct.category)
        }
        
        // Get related products (same category, excluding current product)
        const allProducts = await apiClient.getProducts()
        const related = allProducts
          .filter((p: Product) => 
            p.id !== foundProduct.id && 
            p.category && foundProduct.category && p.category.id === foundProduct.category.id &&
            p.isActive !== false
          )
          .slice(0, 3)
        
        setRelatedProducts(related)
        
      } catch (error) {
        console.error('Error fetching product:', error)
        setError('Gagal memuat data produk')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  const handleAddToCart = () => {
    if (!product) return
    addItem(product, quantity)
    toast.success(`${quantity} ${product.name} ditambahkan ke keranjang!`)
  }

  const handleBuyNow = () => {
    if (!product) return
    addItem(product, quantity)
    router.push('/cart')
  }

  const nextImage = () => {
    if (!product) return
    setSelectedImage((prev) => (prev + 1) % product.images.length)
  }

  const prevImage = () => {
    if (!product) return
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)
  }

  // Hitung harga setelah diskon
  const getDiscountedPrice = (product: Product) => {
    if (product.discount && product.discount > 0) {
      return Math.round(product.price * (1 - product.discount / 100));
    }
    return product.price;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="w-full h-96 bg-white/10 rounded-lg animate-pulse"></div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-full h-20 bg-white/10 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-8 bg-white/10 rounded animate-pulse"></div>
              <div className="h-6 bg-white/10 rounded w-3/4 animate-pulse"></div>
              <div className="h-12 bg-white/10 rounded w-1/2 animate-pulse"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 bg-white/10 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-white/50 text-lg mb-4">{error || 'Produk tidak ditemukan'}</div>
            <button 
              onClick={() => router.back()}
              className="glass-button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16 bg-white dark:bg-dark-900 text-gray-900 dark:text-white transition-colors duration-500">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <button 
              onClick={() => router.back()}
              className="text-gray-600 dark:text-white/60 hover:text-neon-blue transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              Kembali
            </button>
            <span className="text-gray-400 dark:text-white/40">/</span>
            <span className="text-gray-600 dark:text-white/60">Produk</span>
            <span className="text-gray-400 dark:text-white/40">/</span>
            <span className="font-semibold">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 min-h-[400px] lg:min-h-[500px] h-full">
          {/* Image Gallery */}
          <div className="space-y-4 h-full flex flex-col justify-center">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-100 dark:bg-dark-800 rounded-xl overflow-hidden h-full flex items-center justify-center">
              <div className="w-full h-full bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center">
                <span className="text-8xl">🎭</span>
              </div>
              
              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 glass-button p-2 rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 glass-button p-2 rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Zoom Button */}
              <button
                onClick={() => setShowImageModal(true)}
                className="absolute top-4 right-4 glass-button p-2 rounded-full"
              >
                <Eye className="w-5 h-5" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-4 glass px-2 py-1 rounded-full text-sm text-gray-900 dark:text-white bg-white/80 dark:bg-dark-900/80">
                {selectedImage + 1} / {product.images.length}
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden transition-all duration-200 ${
                    selectedImage === index
                      ? 'ring-2 ring-neon-blue shadow-neon'
                      : 'hover:ring-2 ring-gray-300 dark:ring-white/20'
                  }`}
                >
                  <div className="w-full h-full bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 flex items-center justify-center">
                    <span className="text-2xl">🎭</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6 h-full flex flex-col justify-center">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                {product.isNew && (
                  <span className="bg-neon-blue text-white text-xs px-2 py-1 rounded-full font-medium">
                    Baru
                  </span>
                )}
                {product.discount > 0 && (
                  <span className="bg-neon-pink text-white text-xs px-2 py-1 rounded-full font-medium">
                    -{product.discount}%
                  </span>
                )}
                <span className="bg-gray-200 dark:bg-dark-800 text-gray-700 dark:text-white/80 text-xs px-2 py-1 rounded-full">
                  {category ? category.name : `Kategori ${product.categoryId}`}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300 dark:text-white/30'
                      }`}
                    />
                  ))}
                  <span className="text-gray-700 dark:text-white/80 ml-2">({product.reviews} ulasan)</span>
                </div>
                <span className="text-gray-400 dark:text-white/60">•</span>
                <span className="text-gray-700 dark:text-white/80">Stok: {product.stock}</span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-neon-blue">
                  {formatPrice(getDiscountedPrice(product))}
                </span>
                {product.discount > 0 && (
                  <span className="text-xl text-gray-400 dark:text-white/50 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              {product.discount > 0 && (
                <p className="text-green-700 dark:text-green-400 text-sm">
                  Hemat -{formatPrice(product.price - getDiscountedPrice(product))} ({product.discount}%)
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Jumlah</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center glass rounded-lg bg-gray-100 dark:bg-dark-800">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors duration-200"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-3 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-gray-700 dark:text-white/80 text-sm">
                  {product.stock} tersedia
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 futuristic-button text-lg py-4 text-white bg-neon-blue hover:bg-neon-blue/90 dark:text-white dark:bg-neon-blue flex flex-col items-center justify-center gap-1"
              >
                <ShoppingCart className="w-7 h-7 mb-1" />
                <span className="font-semibold">Tambah ke Keranjang</span>
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 text-lg py-4 rounded-lg border border-gray-200 dark:border-white/10 font-semibold transition-all duration-300
                  bg-gray-100 hover:bg-gray-200 text-gray-900
                  dark:bg-dark-800 dark:hover:bg-dark-700 dark:text-white"
              >
                Beli Sekarang
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-3 rounded-full border border-gray-200 dark:border-white/10 transition-all duration-300
                  bg-gray-100 hover:bg-gray-200 text-gray-900
                  dark:bg-dark-800 dark:hover:bg-dark-700 dark:text-white
                  ${isLiked ? 'bg-neon-pink shadow-neon-pink text-white' : ''}`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button className="p-3 rounded-full border border-gray-200 dark:border-white/10 bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-dark-800 dark:hover:bg-dark-700 dark:text-white transition-all duration-300">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-full border border-gray-200 dark:border-white/10 bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-dark-800 dark:hover:bg-dark-700 dark:text-white transition-all duration-300">
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Shipping Info */}
            <div className="glass-card bg-white dark:bg-dark-900">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900 dark:text-white font-medium">Gratis Ongkir</h3>
                  <p className="text-gray-700 dark:text-white/80 text-sm">Untuk pembelian di atas Rp 500.000</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200 dark:border-white/10 mb-8">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Deskripsi' },
                { id: 'specifications', label: 'Spesifikasi' },
                { id: 'reviews', label: 'Ulasan' },
                { id: 'related', label: 'Produk Terkait' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-neon-blue text-neon-blue'
                      : 'border-transparent text-gray-500 dark:text-white/60 hover:text-neon-blue'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  <div className="glass-card bg-white dark:bg-dark-900">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Deskripsi Produk</h3>
                    <div className="text-gray-700 dark:text-white/80 space-y-4">
                      <p>{product.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="glass-card bg-white dark:bg-dark-900">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Spesifikasi Teknis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between py-3 border-b border-gray-200 dark:border-white/10">
                      <span className="text-gray-500 dark:text-white/60">Berat</span>
                      <span className="text-gray-900 dark:text-white font-medium">{product.weight ? `${product.weight} gram` : '-'}</span>
                      </div>
                    <div className="flex justify-between py-3 border-b border-gray-200 dark:border-white/10">
                      <span className="text-gray-500 dark:text-white/60">Stok</span>
                      <span className="text-gray-900 dark:text-white font-medium">{product.stock}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Ulasan Pelanggan</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {mockReviews.map((review) => (
                      <div key={review.id} className="glass-card bg-white dark:bg-dark-900">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 dark:text-white">{review.user}</span>
                              {review.verified && (
                                <span className="bg-green-400/20 text-green-400 text-xs px-2 py-1 rounded-full">
                                  Terverifikasi
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300 dark:text-white/30'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-gray-500 dark:text-white/60 text-sm">{review.date}</span>
                        </div>
                        <p className="text-gray-700 dark:text-white/80">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'related' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Produk Terkait</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {relatedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="glass-card bg-white dark:bg-dark-900 cursor-pointer group hover:shadow-neon transition-all duration-300"
                        onClick={() => router.push(`/products/${product.id}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') router.push(`/products/${product.id}`) }}
                      >
                        <div className="aspect-square bg-gray-100 dark:bg-dark-800 rounded-lg mb-4 flex items-center justify-center">
                          <div className="w-full h-full bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center">
                            <span className="text-4xl">🎭</span>
                          </div>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-neon-blue transition-colors duration-300">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(product.rating)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300 dark:text-white/30'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-gray-500 dark:text-white/60 text-sm">({product.reviews})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neon-blue">
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice > product.price && (
                            <span className="text-sm text-gray-400 dark:text-white/50 line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <div className="relative max-w-4xl w-full">
              <div className="aspect-square bg-gradient-to-br from-dark-800 to-dark-700 rounded-xl overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center">
                  <span className="text-8xl">🎭</span>
                </div>
              </div>
              
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 glass-button p-3 rounded-full"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 
 