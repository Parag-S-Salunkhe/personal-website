'use client'
import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useReducedMotion } from '@/components/lab/kit/hooks'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export type CurtainFilm = { title: string; src: string | null }

/** The velvet curtain: two pleated drapes gather to the wings with overshoot and settle, scrubbed by scroll. */
export default function Curtain({ film }: { film: CurtainFilm }) {
  const root = useRef<HTMLElement>(null)
  const rm = useReducedMotion()

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    const mobile = window.innerWidth < 768
    const rest = mobile ? 0.1 : 0.17
    if (rm) { gsap.set(q('.ls-drape'), { scaleX: rest }); gsap.set(q('.ls-screen'), { scale: 1, filter: 'none' }); return }
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.6 } })
    tl.fromTo(q('.ls-screen'), { scale: 0.86, filter: 'brightness(0.35)' }, { scale: 1, filter: 'brightness(1)', ease: 'power1.inOut', duration: 1 }, 0)
    tl.to(q('.ls-drape'), { scaleX: rest, ease: 'back.out(2.6)', duration: 0.62 }, 0.12)
    tl.fromTo(q('.ls-drape-l'), { skewX: 0 }, { skewX: -4, ease: 'sine.inOut', duration: 0.3, yoyo: true, repeat: 1 }, 0.12)
    tl.fromTo(q('.ls-drape-r'), { skewX: 0 }, { skewX: 4, ease: 'sine.inOut', duration: 0.3, yoyo: true, repeat: 1 }, 0.12)
    tl.fromTo(q('.ls-valance'), { yPercent: 0 }, { yPercent: -12, ease: 'power2.out', duration: 0.4 }, 0.1)
    tl.fromTo(q('.ls-door-text'), { opacity: 1, y: 0 }, { opacity: 0, y: -30, ease: 'power1.in', duration: 0.18 }, 0.05)
    tl.fromTo(q('.ls-screen-text'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.25 }, 0.62)
    tl.fromTo(q('.ls-foot'), { opacity: 0.2 }, { opacity: 1, ease: 'none', duration: 0.4 }, 0.15)
    return () => { tl.scrollTrigger?.kill(); tl.kill() }
  }, { scope: root, dependencies: [rm] })

  return (
    <section ref={root} id="ls-curtain" className="ls-curtain" aria-label="The curtain parts">
      <div className="ls-curtain-stage">
        <div className="ls-screen">
          {film.src && /* eslint-disable-next-line @next/next/no-img-element */ <img src={film.src} alt="" className="ls-screen-img" />}
          <div className="ls-screen-veil" />
          <div className="ls-screen-text">
            <p className="ls-screen-kicker">The feature tonight</p>
            <p className="ls-screen-title">{film.title}</p>
          </div>
        </div>
        <div className="ls-foot" aria-hidden>{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ animationDelay: `${(i % 6) * 0.17}s` }} />)}</div>
        <div className="ls-drape ls-drape-l" aria-hidden />
        <div className="ls-drape ls-drape-r" aria-hidden />
        <div className="ls-valance" aria-hidden />
        <div className="ls-door-text">
          <h2>Doors open</h2>
          <p>Keep scrolling. The house is dim and the seats are warm.</p>
        </div>
      </div>
    </section>
  )
}
