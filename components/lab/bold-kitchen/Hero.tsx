'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Github, Linkedin } from 'lucide-react'
import GuestForm from './GuestForm'
import { HalfDisc, Mug, Quarter, Stripes } from './Shapes'
import s from './styles.module.css'

const EASE = [0.22, 1, 0.36, 1] as const

type T = { l?: string; bg: string; fg: string; r: number; c: number }
// PARAG + mug / SALUNK / HE: the name sets itself across a 6-column tile grid.
const TILES: T[] = [
  { l: 'P', bg: 'var(--tomato)', fg: 'var(--ink)', r: 0, c: 0 },
  { l: 'A', bg: 'var(--cobalt)', fg: 'var(--tile)', r: 0, c: 1 },
  { l: 'R', bg: 'var(--mustard)', fg: 'var(--ink)', r: 0, c: 2 },
  { l: 'A', bg: 'var(--pea)', fg: 'var(--tile)', r: 0, c: 3 },
  { l: 'G', bg: 'var(--ink)', fg: 'var(--tile)', r: 0, c: 4 },
  { bg: 'var(--grout)', fg: '', r: 0, c: 5 },
  { l: 'S', bg: 'var(--mustard)', fg: 'var(--ink)', r: 1, c: 0 },
  { l: 'A', bg: 'var(--ink)', fg: 'var(--tile)', r: 1, c: 1 },
  { l: 'L', bg: 'var(--tomato)', fg: 'var(--ink)', r: 1, c: 2 },
  { l: 'U', bg: 'var(--cobalt)', fg: 'var(--tile)', r: 1, c: 3 },
  { l: 'N', bg: 'var(--pea)', fg: 'var(--tile)', r: 1, c: 4 },
  { l: 'K', bg: 'var(--mustard)', fg: 'var(--ink)', r: 1, c: 5 },
  { l: 'H', bg: 'var(--cobalt)', fg: 'var(--tile)', r: 2, c: 0 },
  { l: 'E', bg: 'var(--tomato)', fg: 'var(--ink)', r: 2, c: 1 },
]

export default function Hero() {
  const reduce = useReducedMotion()
  const wipe = (r: number, c: number, extra = 0) => ({
    initial: reduce ? false : ({ clipPath: 'inset(100% 0% 0% 0%)' } as const),
    animate: { clipPath: 'inset(0% 0% 0% 0%)' },
    transition: { duration: reduce ? 0 : 0.7, ease: EASE, delay: reduce ? 0 : 0.1 + (r + c) * 0.08 + extra },
  })

  const tileBase = `${s.tile} relative aspect-square overflow-hidden rounded-2xl md:aspect-[5/4] md:rounded-3xl`

  return (
    <section aria-labelledby="bk-name" className="px-2 pt-2 md:px-4">
      <div className="mx-auto grid max-w-[1360px] grid-flow-dense grid-cols-6 gap-2 md:gap-3">
        <h1 id="bk-name" className="sr-only">Parag Salunkhe</h1>

        {TILES.map((t, i) => (
          <motion.div key={i} aria-hidden="true" {...wipe(t.r, t.c)} className={tileBase} style={{ background: t.bg, color: t.fg }}>
            {t.l ? (
              <motion.span
                initial={reduce ? false : { y: '40%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: reduce ? 0 : 0.6, ease: EASE, delay: reduce ? 0 : 0.35 + (t.r + t.c) * 0.08 }}
                className={`${s.display} ${s.letter} absolute inset-0 flex items-center justify-center`}
                style={{ fontSize: '58cqw', display: 'flex' }}
              >
                {t.l}
              </motion.span>
            ) : (
              <Mug className="absolute inset-0 h-full w-full p-[12%]" />
            )}
          </motion.div>
        ))}

        <motion.div
          {...wipe(2, 2, 0.1)}
          className={`${s.onDark} relative col-span-6 row-span-2 overflow-hidden rounded-2xl bg-[var(--ink)] p-5 text-[var(--tile)] md:col-span-4 md:rounded-3xl md:p-8 lg:p-10`}
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-10">
            <div className="flex flex-col gap-4">
              <p className={`${s.display} text-4xl md:text-5xl`} style={{ fontSize: 'clamp(2rem, 3.4vw, 3.75rem)' }}>
                Pull up a chair.
              </p>
              <p className={`${s.body} max-w-[34ch] text-base text-[var(--tile)]/90 md:text-lg`}>
                I cook for friends, watch more films than is sensible and write it all down here. Leave a note on your way out.
              </p>
              <div className="mt-auto flex flex-wrap gap-2">
                <a
                  href="https://www.linkedin.com/in/parag-salunkhe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${s.press} inline-flex h-11 items-center gap-2 rounded-full border-2 border-[var(--tile)]/50 px-4 text-base hover:bg-[var(--tile)] hover:text-[var(--ink)]`}
                >
                  <Linkedin size={18} aria-hidden="true" /> LinkedIn
                </a>
                <a
                  href="https://github.com/Parag-S-Salunkhe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${s.press} inline-flex h-11 items-center gap-2 rounded-full border-2 border-[var(--tile)]/50 px-4 text-base hover:bg-[var(--tile)] hover:text-[var(--ink)]`}
                >
                  <Github size={18} aria-hidden="true" /> GitHub
                </a>
              </div>
            </div>
            <GuestForm />
          </div>
        </motion.div>

        <motion.div aria-hidden="true" {...wipe(3, 0)} className={tileBase} style={{ background: 'var(--mustard)' }}>
          <HalfDisc fill="var(--pea)" className="absolute inset-0 h-full w-full" />
        </motion.div>
        <motion.div aria-hidden="true" {...wipe(3, 1)} className={tileBase} style={{ background: 'var(--grout)' }}>
          <Quarter className="absolute inset-0 h-full w-full" />
        </motion.div>
        <motion.div aria-hidden="true" {...wipe(2, 2)} className={`${tileBase} md:hidden`} style={{ background: 'var(--pea)' }}>
          <Mug body="var(--mustard)" rim="var(--ink)" className="absolute inset-0 h-full w-full p-[12%]" />
        </motion.div>
        <motion.div aria-hidden="true" {...wipe(2, 3)} className={`${tileBase} md:hidden`} style={{ background: 'var(--tomato)' }}>
          <Stripes a="var(--ink)" className="absolute inset-0 h-full w-full p-[14%]" />
        </motion.div>
      </div>
    </section>
  )
}
