'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface RotatingWordProps {
  words: string[]
  /** ms each word stays on screen */
  interval?: number
  className?: string
}

/**
 * Cycles through words with a springy flip-up transition.
 * Sized to the longest word so surrounding text doesn't jump.
 */
export default function RotatingWord({ words, interval = 2200, className }: RotatingWordProps) {
  const [index, setIndex] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), interval)
    return () => clearInterval(id)
  }, [words.length, interval])

  return (
    <span className={`relative inline-grid overflow-hidden align-bottom ${className ?? ''}`}>
      {/* Invisible longest word reserves width/height */}
      <span className="invisible col-start-1 row-start-1 whitespace-nowrap" aria-hidden>
        {words.reduce((a, b) => (a.length >= b.length ? a : b))}
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={words[index]}
          className="col-start-1 row-start-1 whitespace-nowrap"
          initial={reduceMotion ? { opacity: 0 } : { y: '105%', opacity: 0, rotate: 3 }}
          animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1, rotate: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { y: '-105%', opacity: 0, rotate: -3 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
