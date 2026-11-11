'use client'
// Copied from components/lab/kit/hooks.ts (run 1 motion lab) for the site pages.
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
/** 'light' on phones (< 768px wide) and low-power devices: lower DPR, fewer particles, no depth of field. */
export function useTier(): Tier {
  const [tier, setTier] = useState<Tier>('full')
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number }
    const light = window.innerWidth < 768 || (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4
    setTier(light ? 'light' : 'full')
  }, [])
  return tier
}

/** DPR range for a canvas: about 1.5 on big screens, 1 on the light tier. */
export function dprFor(tier: Tier): [number, number] {
  return tier === 'light' ? [1, 1] : [1, 1.5]
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
