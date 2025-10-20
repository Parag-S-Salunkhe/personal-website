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
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-6 right-8 z-[100] scale-110"
    >
      {/* Glassmorphism backdrop card */}
      <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-white/30 dark:border-white/20 shadow-2xl shadow-purple-500/20">
        {/* Label */}
        <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 text-center mb-2">
          Theme
        </div>
        
        {/* Toggle button with purple glow */}
        <div className="relative">
          {/* Purple glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-md opacity-30" />
          
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="relative w-20 h-10 rounded-full bg-white/30 dark:bg-black/30 backdrop-blur-lg border-2 border-purple-400/50 dark:border-purple-500/50 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
            aria-label="Toggle theme"
          >
            {/* Background track */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20" />
            
            {/* Icons */}
            <div className="absolute inset-0 flex items-center justify-between px-2">
              <Moon className={`w-5 h-5 transition-all duration-300 ${isDark ? 'text-purple-400' : 'text-gray-400'}`} />
              <Sun className={`w-5 h-5 transition-all duration-300 ${!isDark ? 'text-yellow-500' : 'text-gray-400'}`} />
            </div>
            
            {/* Slider pill with prominent shadow */}
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`absolute top-1 ${isDark ? 'left-1' : 'left-[42px]'} w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-xl shadow-purple-500/30 flex items-center justify-center`}
            >
              {isDark ? (
                <Moon className="w-4 h-4 text-purple-600" />
              ) : (
                <Sun className="w-4 h-4 text-yellow-600" />
              )}
            </motion.div>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
