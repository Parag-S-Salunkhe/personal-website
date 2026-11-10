'use client'
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { useReducedMotion } from '@/components/lab/kit/hooks'
import s from './kinetic.module.css'

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, ScrambleTextPlugin)

export default function Hero({ line2 }: { line2: string }) {
  const root = useRef<HTMLElement>(null)
  const rm = useReducedMotion()

  useGSAP(() => {
    if (rm) return
    const subEl = root.current!.querySelector<HTMLElement>('[data-sub]')!
    let tl: gsap.core.Timeline | undefined
    let split: SplitText | undefined
    let cancelled = false
    subEl.textContent = ''
    document.fonts.ready.then(() => {
      if (cancelled) return
      split = SplitText.create('[data-h1]', { type: 'chars', mask: 'chars', charsClass: 'kt-char' })
      tl = gsap.timeline({ delay: 0.25 })
      tl.from(split.chars, { yPercent: 118, rotate: 9, duration: 0.95, ease: 'back.out(2.6)', stagger: { each: 0.055, from: 'start' } })
        .to(subEl, { duration: 1.9, scrambleText: { text: line2, chars: 'upperCase', speed: 0.6, revealDelay: 0.25, tweenLength: false }, ease: 'none' }, '-=0.15')
      // scroll exit: the whole headline drifts up and dims as the hero leaves
      gsap.to('[data-h1]', { yPercent: -22, opacity: 0.25, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
    })
    return () => { cancelled = true; tl?.kill(); split?.revert() }
  }, { scope: root, dependencies: [rm] })

  return (
    <section ref={root} className={s.hero}>
      <div className={s.heroDrape} aria-hidden />
      <h1 data-h1 className={`${s.h1} ${s.display}`}>Late<br /><span className={s.h1Brass}>Show</span></h1>
      <p data-sub className={s.sub} aria-label={line2}>{rm ? line2 : ''}</p>
      <div className={s.scrollHint} aria-hidden>scroll</div>
    </section>
  )
}
