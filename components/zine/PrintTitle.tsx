'use client'
import { motion, useReducedMotion } from 'framer-motion'

const ease = [0.22, 1, 0.36, 1] as const

type Props = {
  /** One string per printed line (each stays on one line), or a single string that wraps naturally. */
  lines: string | string[]
  as?: 'h1' | 'h2'
  id?: string
  className?: string
  /** 'hero' is the full print run on the home page; 'page' is the smaller one every page h1 uses. */
  size?: 'hero' | 'page'
}

// The print run: the pink layer wipes in, then the blue layer slides into near-registration
// and a small offset stays. The blue layer is the real, always-visible text (it is the LCP
// element), so only transform and clip-path animate.
export default function PrintTitle({ lines, as = 'h1', id, className = '', size = 'page' }: Props) {
  const reduce = useReducedMotion()
  const Tag = as
  const list = Array.isArray(lines) ? lines : [lines]
  const text = list.map((l, i) => (
    <span key={i} className={Array.isArray(lines) ? 'block whitespace-nowrap' : 'block'}>{l}</span>
  ))
  const offset = size === 'hero' ? { x: 4, y: 3 } : { x: 3, y: 2 }
  const slide = size === 'hero' ? -36 : -18

  return (
    <Tag id={id} className={`t-display relative ${className}`}>
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 block select-none text-riso-pink"
        style={{ translate: `${offset.x}px ${offset.y}px` }}
        initial={reduce ? false : { clipPath: 'inset(-10% 100% -10% -5%)' }}
        animate={{ clipPath: 'inset(-10% -10% -10% -5%)' }}
        transition={{ duration: size === 'hero' ? 0.7 : 0.5, ease }}
      >
        {text}
      </motion.span>
      <motion.span
        className="relative block text-riso-blue"
        initial={reduce ? false : { x: slide }}
        animate={{ x: 0 }}
        transition={{ duration: size === 'hero' ? 0.9 : 0.6, delay: size === 'hero' ? 0.45 : 0.25, ease }}
      >
        {text}
      </motion.span>
    </Tag>
  )
}
