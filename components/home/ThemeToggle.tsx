'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-[120px] h-10 rounded-full bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 transition-all duration-300 hover:border-purple-400 flex-shrink-0"
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
  )
}
