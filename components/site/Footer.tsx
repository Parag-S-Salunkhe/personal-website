'use client'
// The end of the evening: a row of candles that light one by one as the footer comes into view.
import Link from 'next/link'
import { useRef } from 'react'
import { Github, Linkedin } from '@/components/icons/Brand'
import { NAV, socials } from '@/lib/site'
import { useInView } from './hooks'

function Candle({ lit, i }: { lit: boolean; i: number }) {
  return (
    <svg viewBox="0 0 20 60" className="w-4" style={{ height: `${48 - (i % 3) * 6}px` }} preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      <path
        d="M10 4 C13 10 14 14 10 19 C6 14 7 10 10 4 Z"
        fill="var(--candle)"
        className="ev-glow origin-bottom transition-[opacity,transform] duration-700 ease-[var(--ease-ev)]"
        style={{ opacity: lit ? 1 : 0, transform: lit ? 'scale(1)' : 'scale(0.3)', transitionDelay: `${i * 140}ms` }}
      />
      <rect x="9.3" y="18" width="1.4" height="5" fill="#2a1d12" />
      <rect x="6" y="22" width="8" height="36" rx="1" fill="var(--linen)" />
    </svg>
  )
}

export default function Footer() {
  const ref = useRef<HTMLElement>(null)
  const lit = useInView(ref, '-80px')
  return (
    <footer ref={ref} className="border-t border-[rgb(184_138_68/0.35)] bg-[var(--cloth-deep)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <div className="flex items-end gap-3">
            {[0, 1, 2, 3, 4].map((i) => <Candle key={i} i={i} lit={lit} />)}
          </div>
          <p className="ev-h2 mt-6 text-[var(--wax)]">Thanks for coming.</p>
          <p className="mt-2 max-w-[44ch] text-[var(--sage)]">Supper clubs, movie nights and home cooking in Dublin. The door&rsquo;s open next time too.</p>
        </div>
        <div className="grid gap-3">
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-5">
              <li><Link href="/" className="ev-link inline-flex min-h-[44px] items-center">Home</Link></li>
              {NAV.map(({ label, href }) => (
                <li key={href}><Link href={href} className="ev-link inline-flex min-h-[44px] items-center">{label}</Link></li>
              ))}
            </ul>
          </nav>
          <ul className="flex flex-wrap gap-x-5">
            <li>
              <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-2 text-[var(--sage)] hover:text-[var(--wax)]">
                <Linkedin className="h-5 w-5" /> LinkedIn
              </a>
            </li>
            <li>
              <a href={socials.github} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-2 text-[var(--sage)] hover:text-[var(--wax)]">
                <Github className="h-5 w-5" /> GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
