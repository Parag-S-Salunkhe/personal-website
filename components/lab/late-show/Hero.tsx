'use client'
import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Linkedin, Github } from 'lucide-react'
import type { LabGuestNote } from '@/components/lab/data'
import s from './styles.module.css'
import GuestbookForm from './GuestbookForm'

const EASE = [0.22, 1, 0.36, 1] as const
const TOP = 16, SIDE = 5
const DUST = Array.from({ length: 24 }, (_, i) => ({ left: `${8 + ((i * 37) % 84)}%`, top: `${25 + ((i * 53) % 65)}%`, d: `${7 + (i % 5)}s`, delay: `${(i % 7) * 0.9}s`, dx: `${((i % 5) - 2) * 14}px` }))
const LINES: [string, string, string][] = [['Now showing', 'Movies', '/movies'], ['On the stove', 'Cooking', '/cooking'], ['After the credits', 'Writing', '/blog']]

function Bulbs({ n, offset = 0, col = false }: { n: number; offset?: number; col?: boolean }) {
  return (
    <div aria-hidden className={`flex justify-between ${col ? 'h-full flex-col py-3' : 'w-full px-3'}`}>
      {Array.from({ length: n }, (_, i) => <span key={i} className={s.bulb} style={{ ['--i' as string]: i + offset }} />)}
    </div>
  )
}

export default function Hero({ lastNote }: { lastNote: LabGuestNote | null }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref)
  const open = reduce ? { scaleX: 0.1 } : undefined
  const t = { duration: 1.3, ease: EASE, delay: 0.35 }
  return (
    <section ref={ref} aria-labelledby="hero-h" className={`relative isolate overflow-hidden ${reduce ? s.steady : ''} ${inView ? '' : s.paused}`}>
      {/* beam and dust */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className={`${s.beam} absolute inset-x-0 top-0 h-[85%]`} />
        {DUST.map((p, i) => <span key={i} className={s.dust} style={{ left: p.left, top: p.top, ['--d' as string]: p.d, ['--delay' as string]: p.delay, ['--dx' as string]: p.dx }} />)}
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-12 pt-10 sm:px-8 sm:pt-16 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-14 lg:py-20">
        {/* marquee */}
        <div className={`${s.letterbox} relative px-3 py-3 sm:px-4 sm:py-4`}>
          <Bulbs n={TOP} />
          <div className="flex items-stretch">
            <div className="hidden w-4 sm:block"><Bulbs n={SIDE} col offset={TOP} /></div>
            <div className="flex-1 px-3 py-4 sm:px-6 sm:py-10">
              <h1 id="hero-h" className={`${s.display} text-[clamp(3.25rem,11vw,7rem)] text-[#f4ecd8]`} style={{ lineHeight: 0.88 }}>
                <span className="block">Tonight at</span>
                <span className="block text-[var(--tungsten)]">Parag&apos;s</span>
              </h1>
              <p className="mt-4 max-w-md text-base sm:text-lg text-[var(--beam)]/90">A house with a screen, a stove and a guestbook. Come in, sit anywhere.</p>
              <ul className="mt-6 divide-y divide-[var(--brass)]/30 border-y border-[var(--brass)]/30">
                {LINES.map(([a, b, h]) => (
                  <li key={h}>
                    <Link href={h} className="flex min-h-[48px] items-center justify-between gap-4 px-1 hover:bg-[var(--curtain)]/60">
                      <span className="text-sm text-[var(--beam)]/80">{a}</span>
                      <span className={`${s.display} text-2xl text-[var(--brass)]`}>{b}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="hidden w-4 sm:block"><Bulbs n={SIDE} col offset={TOP + SIDE} /></div>
          </div>
          <Bulbs n={TOP} offset={TOP + 2 * SIDE} />
        </div>

        {/* box office */}
        <div>
          <GuestbookForm />
          {lastNote && (
            <figure className="mt-5 border-l-0 bg-[var(--curtain)]/60 p-4">
              <figcaption className="text-sm text-[var(--beam)]/80">Last note in the box</figcaption>
              <blockquote className="mt-1 break-words text-base">{lastNote.emoji ? `${lastNote.emoji} ` : ''}{lastNote.message}</blockquote>
            </figure>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="https://www.linkedin.com/in/parag-salunkhe" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-2 border border-[var(--brass)] px-4 text-[var(--brass)] hover:bg-[var(--brass)] hover:text-[var(--velvet)]"><Linkedin size={18} aria-hidden /> LinkedIn</a>
            <a href="https://github.com/Parag-S-Salunkhe" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-2 border border-[var(--brass)] px-4 text-[var(--brass)] hover:bg-[var(--brass)] hover:text-[var(--velvet)]"><Github size={18} aria-hidden /> GitHub</a>
          </div>
        </div>
      </div>

      {/* curtains: the signature moment */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        <motion.div className={`${s.folds} absolute inset-y-0 left-0 w-1/2`} style={{ transformOrigin: 'left center' }} initial={reduce ? false : { scaleX: 1 }} animate={{ scaleX: 0.1 }} transition={reduce ? { duration: 0 } : t} />
        <motion.div className={`${s.folds} absolute inset-y-0 right-0 w-1/2`} style={{ transformOrigin: 'right center' }} initial={reduce ? false : { scaleX: 1 }} animate={{ scaleX: 0.1 }} transition={reduce ? { duration: 0 } : t} />
        <motion.div className={`${s.valance} absolute inset-x-0 top-0 h-7`} initial={reduce ? false : { opacity: 1 }} animate={{ opacity: 1 }} />
      </div>
    </section>
  )
}
