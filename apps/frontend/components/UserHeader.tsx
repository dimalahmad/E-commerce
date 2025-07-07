'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/useAuthStore'
import { useRouter } from 'next/navigation'

export default function UserHeader() {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const [userName, setUserName] = useState('User')
  useEffect(() => {
    if (user && user.username) setUserName(user.username)
    else if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('userName')
      if (stored) setUserName(stored)
    }
  }, [user])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-gray-200 dark:border-white/10 bg-white text-gray-900 dark:bg-dark-900/95 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-neon rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎭</span>
            </div>
            <div className="flex flex-col">
              <Link href="/" className="text-xl font-bold text-gradient">
                Blangkis
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link className="glass-button border border-gray-300 text-gray-900 dark:border-white/20 dark:text-white" href="/orders">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>
            </Link>
            <Link className="glass-button border border-gray-300 text-gray-900 dark:border-white/20 dark:text-white" href="/cart">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            </Link>
            {user ? (
              <div className="glass-button flex items-center gap-2 px-4 py-2 font-semibold ml-2 border border-gray-300 text-gray-900 dark:border-white/20 dark:text-white">
                <span className="truncate max-w-xs">{userName}</span>
                <button onClick={handleLogout} className="ml-2 hover:text-neon-blue focus:outline-none" title="Logout">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"></path></svg>
                </button>
              </div>
            ) : (
              <Link href="/login" className="glass-button border border-gray-300 text-gray-900 dark:border-white/20 dark:text-white px-6 py-2 font-semibold ml-2">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}