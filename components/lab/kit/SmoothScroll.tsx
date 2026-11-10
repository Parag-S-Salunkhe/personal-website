'use client'
// One Lenis instance for every /lab page, driven by GSAP's ticker so Lenis and ScrollTrigger share a
// single loop. It scrolls the WINDOW (document scroll). Reduced motion: no Lenis, native scroll.
import { createContext, useContext, useEffect, useState } from 'react'
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
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const l = new Lenis({ lerp: 0.11, wheelMultiplier: 1 })
    l.on('scroll', ScrollTrigger.update)
    const tick = (t: number) => l.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    setLenis(l)
    return () => { gsap.ticker.remove(tick); l.destroy(); setLenis(null) }
  }, [])
  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
