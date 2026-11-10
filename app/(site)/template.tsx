'use client'
import { motion, useReducedMotion } from 'framer-motion'

// Page transition: the new page slides up a few pixels like a fresh sheet laid on the pile.
// Transform only (no opacity), so content is visible from the first paint.
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { y: 14, rotate: -0.25 }}
      animate={{ y: 0, rotate: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
