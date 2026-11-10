'use client'

import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import { ReactNode, useRef } from 'react'

interface MagneticProps {
  children: ReactNode
  /** How strongly the element is pulled toward the cursor (0–1) */
  strength?: number
  className?: string
}

/**
 * Wraps its child so it's gently "pulled" toward the cursor on hover
 * and springs back on leave. No-op on touch devices / reduced motion.
 */
export default function Magnetic({ children, strength = 0.35, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 220, damping: 16 })
  const springY = useSpring(y, { stiffness: 220, damping: 16 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (reduceMotion || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength)
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  )
}
