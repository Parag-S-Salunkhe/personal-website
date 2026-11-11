'use client'
import { useEffect, useState, type RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Cards enter once as they scroll into view: 'deal' (rotate + translate from the stack) or 'stand'
 * (hinged at the bottom, rotateX 70 to 0 with a small overshoot). Returns `pre`: true until hydrated,
 * so the server HTML can hold the start state (no flash). Reduced motion: nothing animates.
 */
export function useEntrance(ref: RefObject<HTMLElement | null>, kind: 'deal' | 'stand') {
  const [pre, setPre] = useState(true)
  useEffect(() => {
    const root = ref.current
    const items = root ? Array.from(root.querySelectorAll<HTMLElement>('[data-enter]')) : []
    if (!root || items.length === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPre(false)
      return
    }
    const ctx = gsap.context(() => {
      if (kind === 'deal') {
        items.forEach((el, i) => gsap.set(el, { opacity: 0, y: 48, rotate: i % 2 ? 3 : -3, transformOrigin: '0% 0%' }))
      } else {
        gsap.set(items, { opacity: 0, rotateX: 70, transformPerspective: 900, transformOrigin: '50% 100%' })
      }
      ScrollTrigger.batch(items, {
        start: 'top 94%',
        once: true,
        interval: 0.12,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1, y: 0, rotate: 0, rotateX: 0,
            duration: kind === 'deal' ? 0.8 : 0.9,
            ease: kind === 'deal' ? 'power3.out' : 'back.out(1.7)',
            stagger: 0.09,
            overwrite: true,
            onComplete: function () { gsap.set(this.targets(), { clearProps: 'all' }) },
          }),
      })
    }, root)
    setPre(false)
    return () => ctx.revert()
  }, [ref, kind])
  return pre
}
