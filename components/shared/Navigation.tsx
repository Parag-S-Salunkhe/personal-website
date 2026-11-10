'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import ThemeToggle from '@/components/home/ThemeToggle'

const navItems = [
  { href: '/', label: 'Home', emoji: '🏠' },
  { href: '/movies', label: 'Movies', emoji: '🎬' },
  { href: '/cooking', label: 'Cooking', emoji: '👨‍🍳' },
  { href: '/blog', label: 'Blog', emoji: '📝' },
  { href: '/projects', label: 'Projects', emoji: '💼' },
  { href: '/notes', label: 'Notes', emoji: '📔' },
]

export default function Navigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Design-lab prototypes render their own chrome.
  if (pathname?.startsWith('/lab')) return null

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 bg-cream/85 dark:bg-night/85 backdrop-blur-xl border-b border-cream-line/80 dark:border-night-line/80 shadow-sm shadow-ember-900/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LEFT - Logo + Name */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            {/* PS Wordmark */}
            <div className="relative transition-transform duration-300 group-hover:-rotate-6">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-10 sm:h-10">
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E85A38" />
                    <stop offset="100%" stopColor="#F2AF3B" />
                  </linearGradient>
                </defs>
                {/* P */}
                <path
                  d="M8 8 L8 32 M8 8 L18 8 C21 8 23 10 23 13 C23 16 21 18 18 18 L8 18"
                  stroke="url(#logoGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:drop-shadow-[0_0_8px_rgba(232,90,56,0.6)] transition-all duration-300"
                />
                {/* S */}
                <path
                  d="M28 13 C28 10 26 8 23 8 C20 8 18 10 18 13 C18 16 20 17 23 18 C26 19 28 20 28 23 C28 26 26 28 23 28 C20 28 18 26 18 23"
                  stroke="url(#logoGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:drop-shadow-[0_0_8px_rgba(232,90,56,0.6)] transition-all duration-300"
                />
              </svg>
            </div>

            {/* Name - Hidden on very small screens */}
            <span className="hidden xs:inline font-display font-semibold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-ember-600 to-berry-500 dark:from-ember-400 dark:to-berry-400 bg-clip-text text-transparent">
              Parag Salunkhe
            </span>
          </Link>

          {/* CENTER - Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-ember-700 dark:text-ember-300'
                      : 'text-night/70 dark:text-cream/70 hover:text-ember-600 dark:hover:text-ember-400'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-ember-100 dark:bg-ember-500/15 border border-ember-200/80 dark:border-ember-500/25"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* RIGHT - Theme Toggle + Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-night/70 dark:text-cream/70 hover:bg-ember-100/70 dark:hover:bg-ember-500/10 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu - Slides down when open */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 space-y-1 border-t border-cream-line dark:border-night-line">
            {navItems.map((item) => {
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-ember-100/80 dark:bg-ember-500/15 text-ember-700 dark:text-ember-300'
                      : 'text-night/70 dark:text-cream/70 hover:bg-cream-soft dark:hover:bg-night-soft'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">{item.emoji}</span>
                    <span className="font-medium">{item.label}</span>
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
