'use client'
import { useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export type Bill = { id: string; t: number; time: string; title: string; slug: string; rating: number; date: string; review: string; poster: string | null; dish: { name: string; slug: string; category: string; rating: number } | null }
const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })

/** The timeline: times down the left, each entry a dish (the supper) then a film (the feature). */
export default function Entries({ bills }: { bills: Bill[] }) {
  const root = useRef<HTMLOListElement>(null)
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const items = gsap.utils.toArray<HTMLElement>('[data-bill]')
    items.forEach((el) => {
      const dish = el.querySelector('[data-dish]'), film = el.querySelector('[data-film]'), time = el.querySelector('[data-stamp]'), tick = el.querySelector('[data-tick]')
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 78%', end: 'top 35%', scrub: 0.6 } })
      tl.from(time, { yPercent: 60, opacity: 0.1, duration: 1 }, 0)
        .from(dish, { x: -60, opacity: 0, duration: 1 }, 0.1)
        .from(film, { x: 80, rotate: 3, opacity: 0, duration: 1 }, 0.35)
        .from(tick, { scaleY: 0, transformOrigin: 'top', duration: 1 }, 0)
    })
    gsap.from('[data-rail]', { scaleY: 0, transformOrigin: 'top', ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 70%', end: 'bottom 60%', scrub: true } })
  }, { scope: root })
  return (
    <ol ref={root} data-timeline className="relative mx-auto max-w-6xl px-5 sm:px-12">
      <span data-rail aria-hidden className="absolute bottom-0 left-[3.7rem] top-0 hidden w-px bg-[#F6B94F]/50 sm:block md:left-[8.2rem]" />
      {bills.map((b) => (
        <li key={b.id} data-bill data-time={b.t} className="relative grid gap-4 py-8 sm:grid-cols-[7.5rem_1fr] md:grid-cols-[10rem_1fr] md:gap-8">
          <div className="relative">
            <p data-stamp className="dm-serif text-4xl italic text-[#F6B94F] sm:text-5xl">{b.time}</p>
            <span data-tick aria-hidden className="absolute -right-[0.15rem] top-4 hidden h-3 w-3 rounded-full bg-[#F6B94F] sm:block" />
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_1.35fr]">
            <div data-dish className="rounded-[3px] bg-[#17352A] px-5 py-5">
              <p className="text-sm text-[#A9C3AE]">At the table</p>
              {b.dish ? (<>
                <Link href={`/cooking/${b.dish.slug}`} className="dm-serif mt-1 block text-3xl hover:text-[#F6B94F]">{b.dish.name}</Link>
                <p className="mt-1 text-sm text-[#FFF3D6]/80">{b.dish.category} · {b.dish.rating}/5</p>
              </>) : <p className="dm-serif mt-1 text-2xl">Whatever is left in the pot</p>}
            </div>
            <div data-film className="flex gap-4 rounded-[3px] bg-[#0b1322] px-4 py-4" style={{ outline: '1px solid rgba(255,243,214,.22)', outlineOffset: '-5px' }}>
              {b.poster && /* eslint-disable-next-line @next/next/no-img-element */ <img src={b.poster} alt="" loading="lazy" className="h-36 w-24 shrink-0 rounded-[2px] object-cover sm:h-44 sm:w-28" />}
              <div className="min-w-0">
                <p className="text-sm text-[#F6B94F]">On the wall</p>
                <Link href={`/movies/${b.slug}`} className="dm-serif mt-1 block text-3xl leading-tight hover:text-[#F6B94F] sm:text-4xl">{b.title}</Link>
                <p className="mt-1 text-sm text-[#FFF3D6]/80">{b.rating}/5 · watched {fmt(b.date)}</p>
                <p className="mt-2 line-clamp-3 text-[#FFF3D6]/85">{b.review}</p>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
