'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/movies', label: 'Movies' },
  { href: '/blog', label: 'Blog' },
  { href: '/projects', label: 'Projects' },
  { href: '/notes', label: 'Notes' },
  { href: '/cooking', label: 'Cooking' },
]

export default function Navigation() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = theme === 'dark'

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-purple-500/20 shadow-sm dark:shadow-purple-500/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          {/* LEFT - Logo + Name */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* PS Wordmark */}
            <div className="relative">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#A78BFA" />
                  </linearGradient>
                </defs>
                {/* P */}
                <path
                  d="M8 8 L8 32 M8 8 L18 8 C21 8 23 10 23 13 C23 16 21 18 18 18 L8 18"
                  stroke="url(#logoGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.6)] transition-all duration-300"
                />
                {/* S */}
                <path
                  d="M28 13 C28 10 26 8 23 8 C20 8 18 10 18 13 C18 16 20 17 23 18 C26 19 28 20 28 23 C28 26 26 28 23 28 C20 28 18 26 18 23"
                  stroke="url(#logoGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.6)] transition-all duration-300"
                />
              </svg>
            </div>
            
            {/* Name */}
            <span className="text-lg font-semibold tracking-wide bg-gradient-to-r from-purple-600 to-purple-400 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent">
              PARAG SALUNKHE
            </span>
          </Link>

          {/* CENTER - Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 group"
                >
                  {item.label}
                  
                  {/* Underline animation */}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-300 ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>
              )
            })}
          </div>

          {/* RIGHT - Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="relative w-[120px] h-10 rounded-full bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 transition-all duration-300 hover:border-purple-400"
              aria-label="Toggle theme"
            >
              {/* Icons */}
              <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
                <Moon className={`w-4 h-4 transition-colors ${theme === 'dark' ? 'text-purple-400' : 'text-gray-400'}`} />
                <Sun className={`w-4 h-4 transition-colors ${theme === 'light' ? 'text-yellow-500' : 'text-gray-400'}`} />
              </div>
              
              {/* Sliding pill */}
              <motion.div
                animate={{ x: theme === 'dark' ? 0 : 68 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 left-1 w-12 h-8 rounded-full bg-white dark:bg-gray-700 shadow-lg flex items-center justify-center"
              >
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-purple-600" />
                ) : (
                  <Sun className="w-4 h-4 text-yellow-600" />
                )}
              </motion.div>
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
