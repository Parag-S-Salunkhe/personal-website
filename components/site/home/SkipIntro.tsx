'use client'
// "Skip the intro": a real link to #courses (works without JS). With JS it scrolls through Lenis and moves focus to #courses.
// Hidden once the story is passed, and under reduced motion (there is no story then).
import { useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from '@/components/site/SmoothScroll'

gsap.registerPlugin(ScrollTrigger)

export default function SkipIntro() {
  const lenis = useLenis()
  const [gone, setGone] = useState(false)
  useEffect(() => {
    const wrap = document.querySelector('[data-story]')
    if (!wrap) return
    const trig = ScrollTrigger.create({ trigger: wrap, start: 'top bottom', end: 'bottom center', onToggle: (self) => setGone(!self.isActive) })
    return () => trig.kill()
  }, [])
  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    const target = document.getElementById('courses')
    if (!target) return
    e.preventDefault()
    if (lenis) lenis.scrollTo(target, { duration: 1.2, onComplete: () => target.focus({ preventScroll: true }) })
    else { target.scrollIntoView({ behavior: 'auto' }); target.focus({ preventScroll: true }) }
  }
  return (
    <a
      href="#courses"
      onClick={onClick}
      className={`ev-btn ev-btn-line fixed bottom-4 right-4 z-30 bg-[var(--cloth-deep)] motion-reduce:hidden sm:bottom-6 sm:right-6 ${gone ? 'pointer-events-none hidden' : ''}`}
    >
      Skip the intro
    </a>
  )
}
