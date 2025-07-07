'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'

const menu = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 group-hover:scale-110 transition-transform">
        <rect width="7" height="9" x="3" y="3" rx="1"></rect>
        <rect width="7" height="5" x="14" y="3" rx="1"></rect>
        <rect width="7" height="9" x="14" y="12" rx="1"></rect>
        <rect width="7" height="5" x="3" y="16" rx="1"></rect>
      </svg>
    ),
  },
  {
    label: 'Kategori Produk',
    href: '/admin/categories',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 group-hover:scale-110 transition-transform">
        <path d="M20.5 9.5 14 4l-6.5 5.5M4 20V10l8-7 8 7v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"></path>
        <path d="M9 22V12h6v10"></path>
      </svg>
    ),
  },
  {
    label: 'Produk',
    href: '/admin/products',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 group-hover:scale-110 transition-transform">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
        <path d="m3.3 7 8.7 5 8.7-5"></path>
        <path d="M12 22V12"></path>
      </svg>
    ),
  },
  {
    label: 'User/Konsumen',
    href: '/admin/users',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 group-hover:scale-110 transition-transform">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
  },
  {
    label: 'Kelola Order',
    href: '/admin/orders',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 group-hover:scale-110 transition-transform">
        <rect width="20" height="14" x="2" y="5" rx="2"></rect>
        <path d="M2 7V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2"></path>
        <path d="M6 10h.01"></path>
        <path d="M10 10h.01"></path>
      </svg>
    ),
  },
  {
    label: 'Laporan',
    href: '/admin/reports/sales',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 group-hover:scale-110 transition-transform">
        <path d="M3 3v18h18"></path>
        <path d="M18 17V9"></path>
        <path d="M13 17V5"></path>
        <path d="M8 17v-3"></path>
      </svg>
    ),
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-br from-white to-blue-50 dark:from-dark-900/80 dark:to-dark-800/80 border-r border-gray-200 dark:border-white/10 glass shadow-xl flex flex-col z-50">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-200 dark:border-white/10">
        <div className="w-10 h-10 bg-gradient-to-tr from-blue-400 to-purple-400 dark:from-neon-blue dark:to-neon-purple rounded-lg flex items-center justify-center">
          <span className="text-2xl">🎭</span>
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 dark:text-gradient text-transparent bg-clip-text">Blangkis Admin</span>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-2">
          {menu.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-4 px-6 py-3 rounded-lg transition-all font-medium group
                    ${isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-neon-blue/20 dark:text-neon-blue font-bold shadow-md border border-blue-300 dark:border-neon-blue/40'
                      : 'text-gray-800 hover:bg-blue-50 hover:text-blue-700 dark:text-white/90 dark:hover:bg-neon-blue/10 dark:hover:text-neon-blue/90'}
                  `}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 dark:border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-6 py-3 rounded-lg transition-all font-medium group w-full text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 group-hover:scale-110 transition-transform">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16,17 21,12 16,7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Logout
        </button>
      </div>
    </aside>
  )
} 