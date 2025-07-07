'use client'

import { motion } from 'framer-motion'
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import StarRating from './StarRating'
import ProductBadge from './ProductBadge'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  images?: string[]
  rating?: number
  reviews?: number
  category?: {
    id: string
    name: string
  }
  isNew?: boolean
  discount?: number
}

interface ProductCardProps {
  product: Product
  index: number
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Hitung harga setelah diskon
  const getDiscountedPrice = (product: Product) => {
    if (product.discount && product.discount > 0) {
      return Math.round(product.price * (1 - product.discount / 100));
    }
    return product.price;
  };

  return (
    <Link href={`/products/${product.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="product-card group bg-white/80 dark:bg-dark-800 h-full flex flex-col"
      >
      {/* Image Container */}
      <div className="relative overflow-hidden rounded-t-xl">
        <div className="aspect-square bg-gradient-to-br from-dark-100 to-dark-200 dark:from-dark-800 dark:to-dark-700 flex items-center justify-center">
          {/* Product image or placeholder */}
          {product.images && product.images.length > 0 ? (
            <img 
              src={product.images[0]} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center">
              <span className="text-6xl">🎭</span>
            </div>
          )}
        </div>

        {/* Overlay Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-black/50 flex items-center justify-center space-x-4"
        >
          <button className="glass-button p-3 rounded-full">
            <Eye className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className={`glass-button p-3 rounded-full transition-all duration-300 ${
              isLiked ? 'bg-neon-pink shadow-neon-pink' : ''
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button className="glass-button p-3 rounded-full">
            <ShoppingCart className="w-6 h-6" />
          </button>
        </motion.div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {product.isNew && (
            <ProductBadge type="new" />
          )}
          {product.discount && product.discount > 0 && (
            <ProductBadge type="discount" value={product.discount} />
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-dark-900/80 text-white/80 text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            {product.category?.name || 'Uncategorized'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-dark-900 dark:text-white group-hover:text-neon-blue transition-colors duration-300 line-clamp-2">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center space-x-2">
            <StarRating rating={product.rating} size="sm" />
            <span className="text-sm text-dark-600 dark:text-white/60">
              ({product.reviews || 0})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-neon-blue">
            {formatPrice(getDiscountedPrice(product))}
          </span>
          {product.discount && product.discount > 0 && (
            <span className="text-sm text-dark-400 dark:text-white/50 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full futuristic-button flex items-center justify-center"
        >
          <ShoppingCart className="w-6 h-6 mr-2" />
          Tambah ke Keranjang
        </motion.button>
      </div>
      </motion.div>
    </Link>
  )
} 
 