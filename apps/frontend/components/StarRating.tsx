'use client'

import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
}

export default function StarRating({ rating, size = 'md' }: StarRatingProps) {
  const starSize = size === 'sm' ? 16 : size === 'lg' ? 32 : 24
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <Star key={i} className={i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'} size={starSize} />
      ))}
    </div>
  )
} 