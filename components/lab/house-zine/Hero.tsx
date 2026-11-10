'use client'
import { motion, useReducedMotion } from 'framer-motion'
import { Github, Linkedin } from '@/components/icons/Brand'
import GuestForm from './GuestForm'
import { Arrow, Staple, Tape } from './Marks'
import s from './styles.module.css'
import type { LabGuestNote } from '@/components/lab/data'

const ease = [0.22, 1, 0.36, 1] as const
const LINES = ['Pull up', 'a chair.']

export default function Hero({ guest }: { guest: LabGuestNote | null }) {
  const reduce = useReducedMotion()
  const heading = (cls: string) =>
    LINES.map((l) => <span key={l} className="block whitespace-nowrap">{l}</span>)

  return (
    <section aria-labelledby="hz-h1" className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-12 lg:pb-24 lg:pt-12">
      <div className="relative">
        <div className={`${s.halftone} absolute -left-4 -top-4 -z-0 h-40 w-64 sm:h-48 sm:w-96`} aria-hidden="true" />
        <h1 id="hz-h1" className={`${s.display} relative text-[clamp(2.5rem,11.5vw,5.5rem)]`}>
          <span className="sr-only">Pull up a chair.</span>
          <motion.span
            aria-hidden="true" className={`${s.pinkLayer} absolute inset-0 block`}
            initial={reduce ? false : { clipPath: 'inset(-10% 100% -10% -5%)' }}
            animate={{ clipPath: 'inset(-10% -10% -10% -5%)' }}
            transition={{ duration: 0.7, ease }}
          >{heading('')}</motion.span>
          <motion.span
            aria-hidden="true" className={`${s.blueLayer} relative block`}
            initial={reduce ? false : { x: -36, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.55, ease }}
          >{heading('')}</motion.span>
        </h1>
        <p className="relative mt-6 max-w-[34ch] text-xl sm:text-2xl">
          I&rsquo;m Parag. I host supper clubs and movie nights in Dublin. This is the zine I hand people at the door: what I watched, what I cooked, what I wrote down.
        </p>
        <div className="relative mt-6 flex flex-wrap gap-3">
          <a href="https://www.linkedin.com/in/parag-salunkhe" target="_blank" rel="noopener noreferrer"
            className={`${s.btn} ${s.label} inline-flex min-h-[48px] items-center gap-2 border-2 border-[var(--riso-blue)] px-4 text-lg hover:bg-[var(--riso-yellow)] hover:text-[var(--ink)]`}>
            <Linkedin className="h-5 w-5" aria-hidden="true" /> LinkedIn
          </a>
          <a href="https://github.com/Parag-S-Salunkhe" target="_blank" rel="noopener noreferrer"
            className={`${s.btn} ${s.label} inline-flex min-h-[48px] items-center gap-2 border-2 border-[var(--riso-blue)] px-4 text-lg hover:bg-[var(--riso-yellow)] hover:text-[var(--ink)]`}>
            <Github className="h-5 w-5" aria-hidden="true" /> GitHub
          </a>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-md lg:max-w-none">
        <div className="absolute inset-0 translate-x-2 translate-y-2 rotate-2 bg-[var(--riso-pink)]" aria-hidden="true" />
        <motion.div
          className="relative"
          initial={reduce ? false : { rotate: 3, y: 16 }}
          animate={{ rotate: -1.2, y: 0 }}
          transition={{ duration: 0.9, delay: 1, ease }}
          style={reduce ? { rotate: -1.2 } : undefined}
        >
          <Tape className="-top-3 left-1/2 -translate-x-1/2 -rotate-3" />
          <div className={`${s.torn} bg-[var(--slip)] px-5 pb-10 pt-8 sm:px-6`}>
            <h2 className={`${s.title} text-3xl`}>Leave a note</h2>
            <p className="mb-4 mt-1 text-base">One line is plenty. No links, please, the site will send them back.</p>
            <GuestForm />
            {guest && (
              <div className="mt-6 border-t-2 border-dashed border-[var(--riso-blue)] pt-4">
                <p className="text-sm">From the guestbook</p>
                <p className={`${s.hand} mt-1 text-3xl`}>&ldquo;{guest.message}&rdquo; <span aria-hidden="true">{guest.emoji}</span></p>
              </div>
            )}
          </div>
        </motion.div>
        <Arrow className="absolute -left-20 top-20 hidden h-16 w-24 rotate-3 text-[var(--riso-blue)] lg:block" />
        <Staple className="-right-2 top-10 rotate-90" />
      </div>
    </section>
  )
}
