'use client'
import { useEffect, useState, useSyncExternalStore, type RefObject } from 'react'

const RM = '(prefers-reduced-motion: reduce)'

/** true when the visitor asked for reduced motion (false during SSR). */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (cb) => { const m = window.matchMedia(RM); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb) },
    () => window.matchMedia(RM).matches,
    () => false,
  )
}

export type Tier = 'full' | 'light'
/** 'light' on phones (< 768px wide) and low-power devices: lower DPR, fewer particles, simpler post. */
export function useTier(): Tier {
  const [tier, setTier] = useState<Tier>('full')
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number }
    const light = window.innerWidth < 768 || (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4
    setTier(light ? 'light' : 'full')
  }, [])
  return tier
}

/** true while the element is near the viewport (pause offscreen scenes with this). */
export function useInView(ref: RefObject<Element | null>, rootMargin = '200px'): boolean {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin])
  return inView
}
