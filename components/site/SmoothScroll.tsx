'use client'
// One Lenis instance for the site, driven by GSAP's ticker so Lenis and ScrollTrigger share one loop.
// It scrolls the WINDOW (document scroll). Reduced motion: no Lenis, native scroll.
// On every route change: back to the top (unless the URL has a hash) and a ScrollTrigger refresh.
import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import 'lenis/dist/lenis.css'

gsap.registerPlugin(ScrollTrigger)

const LenisContext = createContext<Lenis | null>(null)
/** The shared Lenis instance (null under reduced motion or before mount). */
export const useLenis = () => useContext(LenisContext)

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const l = new Lenis({ lerp: 0.11, wheelMultiplier: 1, anchors: true })
    l.on('scroll', ScrollTrigger.update)
    const tick = (t: number) => l.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    setLenis(l)
    ;(window as unknown as { __lenis?: Lenis }).__lenis = l // read by the screenshot tool
    return () => { gsap.ticker.remove(tick); l.destroy(); setLenis(null) }
  }, [])

  useEffect(() => {
    if (!window.location.hash) lenis?.scrollTo(0, { immediate: true, force: true })
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [pathname, lenis])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
