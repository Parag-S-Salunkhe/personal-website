'use client'
// Section entrances for the courses, each move chosen for its object (transforms and clip-path only, once).
// Ported from components/lab/table-for-eight/Reveals.tsx. data-mv: "unroll" (menu card unrolls), "lines" (menu lines written in),
// "deal" (plates / cards dealt onto the cloth), "flip" (invitations turn over), "fan" (place cards fan out), "wipe" (heading draws in).
import { useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useReducedMotion } from '@/components/site/hooks'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function Reveals({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  useGSAP(() => {
    if (reduced || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const q = gsap.utils.selector(root)
    const at = (el: Element, start = 'top 85%') => ({ scrollTrigger: { trigger: el, start, once: true } })
    q('[data-mv="unroll"]').forEach((el) => gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0)', y: -12 }, { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 1.1, ease: 'power3.out', ...at(el) }))
    q('[data-mv="lines"]').forEach((el) => gsap.from(el.children, { opacity: 0, x: -22, duration: 0.7, stagger: 0.07, ease: 'power2.out', ...at(el, 'top 88%') }))
    q('[data-mv="deal"]').forEach((el) => gsap.from(el.children, { opacity: 0, y: 60, rotate: (i) => (i % 2 ? 7 : -7), scale: 0.92, duration: 0.9, stagger: 0.12, ease: 'back.out(1.4)', ...at(el) }))
    q('[data-mv="flip"]').forEach((el) => gsap.from(el.children, { opacity: 0, rotateX: -80, y: 24, transformOrigin: '50% 0%', transformPerspective: 900, duration: 0.9, stagger: 0.14, ease: 'power3.out', ...at(el) }))
    q('[data-mv="fan"]').forEach((el) => gsap.from(el.children, { rotate: 0, x: (i) => -i * 34, opacity: 0, duration: 1.0, stagger: 0.08, ease: 'power3.out', transformOrigin: '50% 120%', ...at(el) }))
    q('[data-mv="wipe"]').forEach((el) => gsap.fromTo(el, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1, ease: 'power2.inOut', ...at(el, 'top 90%') }))
  }, { scope: root, dependencies: [reduced] })
  return <div ref={root} className={className}>{children}</div>
}
