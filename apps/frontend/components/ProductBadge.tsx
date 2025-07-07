'use client'

interface ProductBadgeProps {
  type: 'new' | 'discount' | 'out-of-stock' | 'best-seller'
  value?: number | string
  className?: string
}

export default function ProductBadge({ type, value, className = '' }: ProductBadgeProps) {
  const badgeConfig = {
    new: {
      label: 'Baru',
      bgColor: 'bg-neon-blue',
      textColor: 'text-white'
    },
    discount: {
      label: value ? `-${value}%` : 'Diskon',
      bgColor: 'bg-neon-pink',
      textColor: 'text-white'
    },
    'out-of-stock': {
      label: 'Habis',
      bgColor: 'bg-red-500',
      textColor: 'text-white'
    },
    'best-seller': {
      label: 'Terlaris',
      bgColor: 'bg-yellow-500',
      textColor: 'text-white'
    }
  }

  const config = badgeConfig[type]

  return (
    <span className={`${config.bgColor} ${config.textColor} text-xs px-2 py-1 rounded-full font-medium ${className}`}>
      {config.label}
    </span>
  )
} 
 
 
 
 
 
 
 