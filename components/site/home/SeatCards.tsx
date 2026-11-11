'use client'
// The place cards that follow the camera seat to seat. Adapted from the overlay in components/lab/table-for-eight/TableOrbit.tsx:
// each card is real HTML with a real link; only the card for the current seat is visible (and so focusable).
import Link from 'next/link'
import { useEffect, useRef, type MutableRefObject } from 'react'
import type { SeatCard } from './seats'

const sstep = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

function CardLink({ c, className, children, ...rest }: { c: SeatCard; className?: string; children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (!c.href) return <span className={className}>{children}</span>
  return c.href.startsWith('#')
    ? <a href={c.href} className={className} {...rest}>{children}</a>
    : <Link href={c.href} className={className} {...rest}>{children}</Link>
}

export default function SeatCards({ cards, shared, active }: { cards: SeatCard[]; shared: MutableRefObject<{ s: number }>; active: boolean }) {
  const els = useRef<(HTMLElement | null)[]>([])
  const finale = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    if (!active) return
    let raf = 0
    const tick = () => {
      const s = shared.current.s
      els.current.forEach((el, i) => {
        if (!el) return
        const d = s - (i + 1)
        const a = 1 - sstep(0.1, 0.34, Math.abs(d))
        el.style.opacity = String(a)
        el.style.visibility = a < 0.05 ? 'hidden' : 'visible'
        el.style.transform = `translate3d(0, ${(d * 46).toFixed(1)}px, 0) rotate(${-1.4 + d * 1.5}deg)`
      })
      const f = finale.current
      if (f) { const a = sstep(8.35, 8.95, s); f.style.opacity = String(a); f.style.visibility = a < 0.02 ? 'hidden' : 'visible' }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, shared])

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-4 pb-20 sm:justify-start sm:px-12 sm:pb-14" style={{ display: active ? undefined : 'none' }}>
      <div className="relative h-[200px] w-full max-w-[26rem]">
        {cards.map((c, i) => (
          <article
            key={c.key}
            ref={(el) => { els.current[i] = el }}
            className="ev-card pointer-events-auto absolute inset-x-0 bottom-0 px-6 py-5"
            style={{ opacity: 0, visibility: 'hidden' }}
          >
            <p className="flex items-baseline justify-between gap-3">
              <span className="ev-name text-[2.6rem] text-[var(--claret)]">{c.name}</span>
              <span className="ev-meta ev-soft">seat {i + 1} of 8</span>
            </p>
            <p className="ev-serif mt-2 text-[1.35rem] leading-snug">{c.headline}</p>
            {c.meta && <p className="ev-meta ev-soft mt-1">{c.meta}</p>}
            {c.href && c.cta && <CardLink c={c} className="ev-link ev-label mt-2 inline-flex min-h-[44px] items-center after:absolute after:inset-0 after:content-['']">{c.cta}</CardLink>}
          </article>
        ))}
        <p ref={finale} className="ev-serif absolute inset-x-0 bottom-2 px-2 text-center text-3xl text-[var(--wax)] sm:text-left sm:text-4xl" style={{ opacity: 0, visibility: 'hidden', textShadow: '0 2px 22px rgba(0,0,0,.9)' }}>
          Pull up a chair.
        </p>
      </div>
    </div>
  )
}
