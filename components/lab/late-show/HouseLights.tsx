'use client'
import { useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useReducedMotion } from '@/components/lab/kit/hooks'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/** The house lights come up: the section floods with warm light as it scrolls in, then dims for the curtain call. */
export default function HouseLights({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null)
  const rm = useReducedMotion()
  useGSAP(() => {
    const el = root.current!
    if (rm) { el.style.setProperty('--lit', '1'); return }
    const st = ScrollTrigger.create({
      trigger: el, start: 'top 85%', end: 'bottom 40%',
      onUpdate: (s) => {
        const p = s.progress
        const lit = Math.min(1, p / 0.22) * (1 - Math.max(0, (p - 0.82) / 0.18) * 0.75)
        el.style.setProperty('--lit', lit.toFixed(3))
      },
    })
    // the flash as the lights snap up
    gsap.fromTo(el.querySelector('.ls-flash'), { opacity: 0 }, { opacity: 0.9, yoyo: true, repeat: 1, duration: 0.18, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 60%', once: true } })
    return () => st.kill()
  }, { scope: root, dependencies: [rm] })
  return (
    <section ref={root} id="ls-house" className="ls-house" style={{ ['--lit' as string]: rm ? 1 : 0 }}>
      <div className="ls-flash" aria-hidden />
      {children}
    </section>
  )
}
