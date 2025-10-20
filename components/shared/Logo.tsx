'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Logo() {
  return (
    <Link href="/" className="block">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group cursor-pointer"
      >
        <div className="relative">
          {/* Purple glow on hover */}
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
          
          {/* Logo container */}
          <div className="relative flex items-center gap-3 p-3 rounded-2xl bg-white/50 dark:bg-black/50 backdrop-blur-lg border border-white/30 dark:border-white/20 shadow-lg group-hover:shadow-xl transition-all duration-300">
            {/* Monogram badge */}
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg overflow-hidden">
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* PS Monogram */}
              <div className="relative z-10">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* P */}
                  <path
                    d="M8 6 L8 26 M8 6 L16 6 C18.5 6 20 7.5 20 10 C20 12.5 18.5 14 16 14 L8 14"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="group-hover:stroke-[3] transition-all"
                  />
                  {/* S */}
                  <path
                    d="M24 10 C24 8 22.5 6 20 6 C17.5 6 16 8 16 10 C16 12 17.5 13 20 14 C22.5 15 24 16 24 18 C24 20 22.5 22 20 22 C17.5 22 16 20 16 18"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="group-hover:stroke-[3] transition-all"
                  />
                </svg>
              </div>
            </div>
            
            {/* Text */}
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                Parag Salunkhe
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                Portfolio
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
