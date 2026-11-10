'use client'
import { motion, useReducedMotion } from 'framer-motion'

// Taped things settle onto the page with a small rotation as they enter view.
// Opacity stays 1, so nothing is ever blank (and LCP is never held back).
export default function Settle({
  rotate = 0,
  delay = 0,
  className,
  children,
}: {
  rotate?: number
  delay?: number
  className?: string
  children: React.ReactNode
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { rotate: rotate + 4, y: 10 }}
      whileInView={{ rotate, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      style={reduce ? { rotate } : undefined}
    >
      {children}
    </motion.div>
  )
}
