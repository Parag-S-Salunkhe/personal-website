'use client'
// The one move on a recipe card: the plate turns in a quarter turn and settles on load (photos just settle). Static under reduced motion.
import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export default function TurnIn({ kind, children, className = '' }: { kind: 'plate' | 'photo'; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.from(ref.current, kind === 'plate'
      ? { rotate: -90, scale: 0.9, duration: 1.3, ease: 'back.out(1.2)', clearProps: 'transform' }
      : { scale: 0.96, duration: 1, ease: 'power3.out', clearProps: 'transform' })
  }, { scope: ref })
  return <div ref={ref} className={className}>{children}</div>
}
