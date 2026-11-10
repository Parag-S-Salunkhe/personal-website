'use client'

import { motion, useMotionValue, useSpring, useMotionTemplate, useReducedMotion } from 'framer-motion'
import { ReactNode, useRef } from 'react'

interface TiltCardProps {
  children: ReactNode
  /** Max tilt in degrees */
  maxTilt?: number
  className?: string
}

/**
 * Cursor-tracking 3D tilt with a warm glare that follows the mouse.
 * Tilt is disabled on touch devices (hover: none) and reduced motion.
 */
export default function TiltCard({ children, maxTilt = 7, className }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const glareX = useMotionValue(50)
  const glareY = useMotionValue(50)

  const springRotateX = useSpring(rotateX, { stiffness: 260, damping: 20 })
  const springRotateY = useSpring(rotateY, { stiffness: 260, damping: 20 })

  const glare = useMotionTemplate`radial-gradient(360px circle at ${glareX}% ${glareY}%, rgba(255, 182, 92, 0.16), transparent 70%)`

  const handleMouseMove = (e: React.MouseEvent) => {
    if (reduceMotion || !ref.current) return
    if (window.matchMedia('(hover: none)').matches) return
    const rect = ref.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    rotateY.set((px - 0.5) * 2 * maxTilt)
    rotateX.set((0.5 - py) * 2 * maxTilt)
    glareX.set(px * 100)
    glareY.set(py * 100)
  }

  const handleMouseLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: 'preserve-3d',
        perspective: 900,
      }}
      whileHover={reduceMotion ? undefined : { y: -8, scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {/* Warm glare following the cursor */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ background: glare }}
      />
    </motion.div>
  )
}
