'use client'
// Page transition: on a client navigation the room lights come back up (a cloth-deep overlay fades out).
// The content never moves (no transform on the wrapper: it would break position: fixed and ScrollTrigger).
// Skipped on the very first load (so the first paint is the page) and under reduced motion.
import { useEffect, useRef } from 'react'
import { useReducedMotion } from './hooks'

let firstLoad = true

export default function Dim() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    const el = ref.current
    if (firstLoad) { firstLoad = false; return }
    if (!el || reduced) return
    const a = el.animate([{ opacity: 0.92 }, { opacity: 0 }], { duration: 450, easing: 'cubic-bezier(0.22,1,0.36,1)', fill: 'forwards' })
    return () => a.cancel()
  }, [reduced])
  return <div ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] bg-[var(--cloth-deep)] opacity-0" />
}
