'use client'

import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

interface Category {
  id: string
  name: string
  icon: string
  count: number
  color: string
}

interface CategoryCardProps {
  category: Category
  index: number
}

export default function CategoryCard({ category, index }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="glass-card cursor-pointer group bg-white/80 dark:bg-white/10"
    >
      <div className="flex items-center space-x-4">
        {/* Icon */}
        <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
          {category.icon}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-dark-900 dark:text-white group-hover:text-neon-blue transition-colors duration-300">
            {category.name}
          </h3>
          <p className="text-dark-600 dark:text-white/60 text-sm">
            {category.count} produk
          </p>
        </div>

        {/* Arrow */}
        <div className="text-dark-400 dark:text-white/30 group-hover:text-neon-blue transition-colors duration-300">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  )
} 
 
 
