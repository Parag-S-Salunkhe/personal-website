'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  delay?: number
  /** Slight starting rotation (degrees) for a playful entrance */
  rotate?: number
  y?: number
  className?: string
}

/**
 * Scroll-triggered reveal with a springy, slightly rotated entrance.
 * Falls back to a plain fade when the user prefers reduced motion.
 */
export default function Reveal({ children, delay = 0, rotate = 0, y = 44, className }: RevealProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y, rotate, scale: 0.95 }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, rotate: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ type: 'spring', stiffness: 110, damping: 14, delay }}
    >
      {children}
    </motion.div>
  )
}
