'use client'
import { motion, useReducedMotion } from 'framer-motion'
import { Github, Linkedin } from '@/components/icons/Brand'
import type { GuestNote } from '@/lib/content'
import { socials } from '@/lib/site'
import GuestForm from './GuestForm'
import { Arrow, Staple, Tape } from './Marks'
import PrintTitle from './PrintTitle'

const ease = [0.22, 1, 0.36, 1] as const

export default function HomeHero({ guest }: { guest: GuestNote | null }) {
  const reduce = useReducedMotion()
  return (
    <section aria-labelledby="home-title" className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-12 lg:pb-24 lg:pt-12">
      <div className="relative">
        <div className="halftone absolute -left-4 -top-4 h-40 w-64 sm:h-48 sm:w-96" aria-hidden="true" />
        <PrintTitle id="home-title" size="hero" lines={['Pull up', 'a chair.']} className="text-[clamp(2.75rem,13.5vw,6rem)]" />
        <p className="relative mt-6 max-w-[34ch] text-xl sm:text-2xl">
          I&rsquo;m Parag. I host supper clubs and movie nights in Dublin. This is the zine I hand people at the door: what I watched, what I cooked, what I wrote down.
        </p>
        <div className="relative mt-6 flex flex-wrap gap-3">
          <a href="#guest-note" className="btn lg:hidden">Leave a note</a>
          <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-line">
            <Linkedin className="h-5 w-5" /> LinkedIn
          </a>
          <a href={socials.github} target="_blank" rel="noopener noreferrer" className="btn btn-line">
            <Github className="h-5 w-5" /> GitHub
          </a>
        </div>
        <p className="t-hand relative mt-8 hidden -rotate-2 text-3xl lg:block">the guestbook is over there</p>
      </div>

      <div id="guest-note" className="relative mx-auto w-full max-w-md scroll-mt-6 lg:max-w-none">
        <div className="absolute inset-0 translate-x-2 translate-y-2 rotate-2 bg-riso-pink" aria-hidden="true" />
        <motion.div
          className="relative"
          initial={reduce ? false : { rotate: 3, y: 16 }}
          animate={{ rotate: -1.2, y: 0 }}
          transition={{ duration: 0.9, delay: 0.9, ease }}
          style={reduce ? { rotate: -1.2 } : undefined}
        >
          <Tape className="-top-3 left-1/2 -translate-x-1/2 -rotate-3" />
          <div className="torn bg-slip px-5 pb-10 pt-8 sm:px-6">
            <h2 className="t-title text-3xl">Leave a note</h2>
            <p className="mb-4 mt-1 text-base text-ink">One line is plenty. Links get sent back, so keep it to words.</p>
            <GuestForm idPrefix="home-note" />
            {guest && (
              <figure className="mt-6 border-t-2 border-dashed border-riso-blue pt-4">
                <figcaption className="text-sm">Last note in the guestbook</figcaption>
                <blockquote className="t-hand mt-1 text-3xl [overflow-wrap:anywhere]">
                  &ldquo;{guest.message}&rdquo; {guest.emoji && <span aria-hidden="true">{guest.emoji}</span>}
                </blockquote>
              </figure>
            )}
          </div>
        </motion.div>
        <Arrow className="absolute -left-20 top-20 hidden h-16 w-24 rotate-3 text-riso-blue lg:block" />
        <Staple className="-right-2 top-10 rotate-90" />
      </div>
    </section>
  )
}
