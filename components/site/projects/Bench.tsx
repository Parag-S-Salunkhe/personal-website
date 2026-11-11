'use client'
// The workbench: build sheets slide out of the stack and settle as they enter view (a spring with a
// little overshoot), and the desk lamp's pool of light follows the pointer across the bench.
import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '../hooks'

const ROT = [-1.4, 0.9, -0.6, 1.3, -1.1, 0.5]

export function Lamp({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== 'mouse') return
        const r = ref.current!.getBoundingClientRect()
        ref.current!.style.setProperty('--lx', `${e.clientX - r.left}px`)
        ref.current!.style.setProperty('--ly', `${e.clientY - r.top}px`)
      }}
      className="relative [--lx:30%] [--ly:120px]"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -inset-10 bg-[radial-gradient(520px_circle_at_var(--lx)_var(--ly),rgb(246_185_79/0.16),transparent_70%)] transition-[background] duration-300" />
      <div className="relative">{children}</div>
    </div>
  )
}

export function Settle({ i, children }: { i: number; children: React.ReactNode }) {
  const reduced = useReducedMotion()
  const rot = ROT[i % ROT.length]
  if (reduced) return <div className="h-full" style={{ transform: `rotate(${rot * 0.5}deg)` }}>{children}</div>
  return (
    <motion.div
      className="h-full"
      initial={{ x: -40, y: 30, rotate: rot - 6 }}
      whileInView={{ x: 0, y: 0, rotate: rot * 0.5 }}
      whileHover={{ y: -6, rotate: 0, transition: { type: 'spring', stiffness: 260, damping: 18 } }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ type: 'spring', stiffness: 120, damping: 14, mass: 0.9, delay: (i % 3) * 0.08 }}
    >
      {children}
    </motion.div>
  )
}
