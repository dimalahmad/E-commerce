'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  User, 
  Heart, 
  Star,
  ArrowRight,
  ChevronRight,
  Package,
  Truck,
  Shield,
  Zap,
  History,
  Crown,
  Users
} from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import ProductCard from '@/components/ProductCard'
import CategoryCard from '@/components/CategoryCard'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store/useAuthStore'

// Interface untuk kategori dari backend
interface Category {
  id: string;
  name: string;
  productCount: number;
}

// Interface untuk produk dari backend
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images?: string[];
  rating?: number;
  reviews?: number;
  isNew?: boolean;
  isActive?: boolean;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Mock data untuk development (akan diganti dengan data dari backend)
const features = [
  {
    icon: Package,
    title: 'Premium Quality',
    description: 'Blangkon berkualitas tinggi dengan bahan terbaik'
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Pengiriman cepat ke seluruh Indonesia'
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: 'Pembayaran aman dan terpercaya'
  },
  {
    icon: Zap,
    title: '24/7 Support',
    description: 'Layanan pelanggan 24 jam'
  }
]

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)
  const { user, logout } = useAuthStore();

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getCategories()
        setCategories(response)
      } catch (error) {
        console.error('Error fetching categories:', error)
        // Fallback to empty array if API fails
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true)
        const response = await apiClient.getProducts()
        // Filter only active products and sort by sales/rating (highest first)
        const activeProducts = response.filter((product: Product) => product.isActive !== false)
        
        // Sort by rating (highest first) and take first 8 for featured
        const sortedProducts = activeProducts.sort((a: Product, b: Product) => {
          // Calculate a "popularity score" based on rating, reviews, and other factors
          const getPopularityScore = (product: Product) => {
            const rating = product.rating || 0
            const reviews = product.reviews || 0
            const isNew = product.isNew ? 0.5 : 0 // Bonus for new products
            const discount = product.discount || 0
            const discountBonus = discount > 0 ? 0.3 : 0 // Bonus for discounted products
            
            // Weighted score: rating (40%) + reviews (30%) + bonuses (30%)
            return (rating * 0.4) + (Math.min(reviews / 10, 5) * 0.3) + (isNew + discountBonus)
          }
          
          const scoreA = getPopularityScore(a)
          const scoreB = getPopularityScore(b)
          
          return scoreB - scoreA // Higher score first
        })
        
        setProducts(sortedProducts.slice(0, 8))
      } catch (error) {
        console.error('Error fetching products:', error)
        // Fallback to empty array if API fails
        setProducts([])
      } finally {
        setProductsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Function to get category icon and color based on name
  const getCategoryStyle = (categoryName: string) => {
    const styles = {
      'Premium': { icon: '👑', color: 'from-yellow-400 to-orange-500' },
      'Modern': { icon: '⚡', color: 'from-blue-400 to-purple-500' },
      'Tradisional': { icon: '🏛️', color: 'from-green-400 to-teal-500' },
      'Elegant': { icon: '💎', color: 'from-pink-400 to-rose-500' }
    }
    
    return styles[categoryName as keyof typeof styles] || { icon: '📦', color: 'from-gray-400 to-gray-600' }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-gray-200 dark:border-white/10 bg-white text-gray-900 dark:bg-dark-900/95 dark:text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-neon rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎭</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gradient">Blangkis</span>
              </div>
            </motion.div>

            {/* Search Bar */}
            {/* (Dihapus sesuai permintaan) */}

            {/* Navigation */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <Link href="/orders" className="glass-button">
                <Package className="w-5 h-5" />
              </Link>
              <Link href="/cart" className="glass-button">
                <ShoppingBag className="w-5 h-5" />
              </Link>
              <button 
                onClick={() => setSidebarOpen(true)}
                className="md:hidden glass-button"
              >
                <Menu className="w-5 h-5" />
              </button>
              {user ? (
                <div className="glass-button flex items-center gap-2 px-4 py-2 font-semibold ml-2">
                  <span className="truncate max-w-xs">{user.name || user.username || user.email}</span>
                  <button
                    onClick={logout}
                    className="ml-2 hover:text-neon-blue focus:outline-none"
                    title="Logout"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <Link href="/login" className="glass-button px-6 py-2 font-semibold">Login</Link>
              )}
            </motion.div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          {/* Background Image + Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/blangkon-bg.jpg"
              alt="Blangkon Background"
              className="w-full h-full object-cover object-center opacity-80 dark:opacity-60"
              draggable="false"
            />
            {/* Overlay gradasi: lebih terang di light mode, gelap di dark mode */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-transparent dark:from-dark-950/90 dark:via-dark-900/70 dark:to-transparent" />
          </div>
          {/* Background Effects (tetap, di atas gambar) */}
          <div className="absolute inset-0 bg-gradient-futuristic opacity-10 dark:opacity-20 z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,212,255,0.08),transparent_50%)] z-10 pointer-events-none" />
          {/* Main Hero Content */}
          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="text-gradient">Blangkis</span>
                <br />
                <span className="text-dark-900 dark:text-white">Modern E-Commerce</span>
              </h1>
              <p className="text-xl md:text-2xl text-dark-700 dark:text-white/80 mb-8 max-w-3xl mx-auto">
                Temukan koleksi blangkon terbaik dengan desain modern dan kualitas premium. 
                Platform e-commerce futuristik untuk produk tradisional Indonesia.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products" className="futuristic-button text-lg px-8 py-4 flex items-center">
                  Mulai Belanja
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link href="/products" className="glass-button text-lg px-8 py-4">
                  Lihat Katalog
                </Link>
              </div>
            </motion.div>
          </div>
          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute top-20 left-10 w-20 h-20 bg-neon-blue/10 dark:bg-neon-blue/20 rounded-full blur-xl z-20"
          />
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute bottom-20 right-10 w-32 h-32 bg-neon-purple/10 dark:bg-neon-purple/20 rounded-full blur-xl z-20"
          />
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white dark:bg-dark-950 transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4 text-gradient">Mengapa Memilih Blangkis?</h2>
              <p className="text-xl text-gray-700 dark:text-white/90">Platform e-commerce terdepan untuk produk blangkon</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card text-center group hover:shadow-neon hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-white/10 bg-white dark:bg-dark-900"
                >
                  <div className="w-16 h-16 bg-gradient-neon rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-gray-900 dark:text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-700 dark:text-white/90">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-white dark:bg-dark-950 transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4 text-gradient">Kategori Produk</h2>
              <p className="text-xl text-gray-700 dark:text-white/90">Jelajahi berbagai kategori blangkon kami</p>
            </motion.div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="glass-card p-6 text-center animate-pulse border border-gray-200 dark:border-white/10 bg-white dark:bg-dark-900"
                  >
                    <div className="w-16 h-16 bg-white/10 rounded-full mx-auto mb-4"></div>
                    <div className="h-6 bg-white/10 rounded mb-2"></div>
                    <div className="h-4 bg-white/10 rounded w-1/2 mx-auto"></div>
                  </motion.div>
                ))}
              </div>
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                  <Link key={category.id} href={`/products/category/${category.id}`} className="no-underline">
                    <CategoryCard 
                      category={{
                        id: category.id,
                        name: category.name,
                        icon: getCategoryStyle(category.name).icon,
                        count: category.productCount,
                        color: getCategoryStyle(category.name).color
                      }} 
                      className="glass-card border border-gray-200 dark:border-white/10 bg-white dark:bg-dark-900 hover:shadow-neon hover:scale-105 transition-all duration-300"
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center py-12"
              >
                <div className="text-dark-500 text-lg">Tidak ada kategori tersedia</div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-20 bg-white dark:bg-dark-950 transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-between mb-16"
            >
              <div>
                <h2 className="text-4xl font-bold mb-4 text-gradient">Produk Terlaris</h2>
                <p className="text-xl text-gray-700 dark:text-white/90">8 produk dengan rating dan penjualan tertinggi</p>
              </div>
              <Link href="/products" className="glass-button hidden md:flex items-center text-gray-900 dark:text-white bg-white dark:bg-dark-900 border border-gray-300 dark:border-white/20">
                Lihat Semua
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>

            {productsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="glass-card p-4 animate-pulse border border-gray-200 dark:border-white/10 bg-white dark:bg-dark-900"
                  >
                    <div className="w-full h-48 bg-white/10 rounded-lg mb-4"></div>
                    <div className="h-6 bg-white/10 rounded mb-2"></div>
                    <div className="h-4 bg-white/10 rounded mb-2"></div>
                    <div className="h-4 bg-white/10 rounded w-1/2"></div>
                  </motion.div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} className="glass-card border border-gray-200 dark:border-white/10 bg-white dark:bg-dark-900 hover:shadow-neon hover:scale-105 transition-all duration-300" />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center py-12"
              >
                <div className="text-dark-500 text-lg">Tidak ada produk tersedia</div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex justify-center mt-12"
            >
              <Link href="/products" className="futuristic-button text-lg px-8 py-4 inline-flex items-center justify-center">
                Lihat Semua Produk
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <footer className="w-full bg-white dark:bg-dark-950 border-t border-gray-200 dark:border-white/10 py-8 mt-8 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-600 dark:text-white/70 text-sm">&copy; {new Date().getFullYear()} Blangkis. All rights reserved.</div>
          <div className="flex gap-4">
            <a href="https://instagram.com" target="_blank" rel="noopener" className="hover:text-neon-blue transition-colors"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5zm4.75 2.75a5.75 5.75 0 1 1-5.75 5.75A5.75 5.75 0 0 1 12 6.25zm0 1.5a4.25 4.25 0 1 0 4.25 4.25A4.25 4.25 0 0 0 12 7.75zm5.5 1.25a1 1 0 1 1-1 1a1 1 0 0 1 1-1z"/></svg></a>
            <a href="https://facebook.com" target="_blank" rel="noopener" className="hover:text-neon-blue transition-colors"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M17.525 8.998h-2.02V7.498c0-.464.308-.572.525-.572h1.465V4.998h-2.02c-2.21 0-2.48 1.66-2.48 2.72v1.28H9.5v2.5h1.495V19h3.01v-7.502h2.02z"/></svg></a>
            <a href="https://twitter.com" target="_blank" rel="noopener" className="hover:text-neon-blue transition-colors"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 5.924c-.793.352-1.645.59-2.54.698a4.48 4.48 0 0 0 1.963-2.475a8.94 8.94 0 0 1-2.828 1.082a4.48 4.48 0 0 0-7.64 4.086A12.72 12.72 0 0 1 3.11 4.86a4.48 4.48 0 0 0 1.39 5.98a4.44 4.44 0 0 1-2.03-.56v.06a4.48 4.48 0 0 0 3.6 4.39a4.5 4.5 0 0 1-2.02.08a4.48 4.48 0 0 0 4.18 3.11A8.98 8.98 0 0 1 2 19.54a12.67 12.67 0 0 0 6.88 2.02c8.26 0 12.78-6.84 12.78-12.78c0-.19-.01-.38-.02-.57A9.22 9.22 0 0 0 24 4.59a8.94 8.94 0 0 1-2.54.7z"/></svg></a>
          </div>
        </div>
      </footer>
    </div>
  )
} 
 
 