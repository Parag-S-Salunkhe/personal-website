import Link from 'next/link'
import { Github, Linkedin } from 'lucide-react'
import type { LabGuestNote } from '../data'
import { fmtDate } from './util'
import s from './styles.module.css'

const LINKS = [
  ['Movies', '/movies'],
  ['Cooking', '/cooking'],
  ['Blog', '/blog'],
  ['Notes', '/notes'],
  ['Projects', '/projects'],
] as const

export function TopBar() {
  return (
    <header className="px-2 pt-2 md:px-4">
      <a
        href="#bk-main"
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded-full focus-visible:bg-[var(--ink)] focus-visible:px-4 focus-visible:py-3 focus-visible:text-[var(--tile)]"
      >
        Skip to content
      </a>
      <nav aria-label="Sections" className="mx-auto flex max-w-[1360px] items-center justify-between gap-2 py-1">
        <Link href="/lab" className={`${s.title} inline-flex h-11 items-center text-base`} aria-label="Back to the design lab">
          Lab
        </Link>
        <ul className="flex flex-wrap justify-end">
          {LINKS.map(([label, href]) => (
            <li key={href}>
              <Link href={href} className={`${s.press} inline-flex h-11 items-center rounded-full px-2.5 text-sm font-semibold hover:bg-[var(--ink)] hover:text-[var(--tile)] md:px-4 md:text-base`}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

export function Footer({ guestbook }: { guestbook: LabGuestNote[] }) {
  return (
    <footer className={`${s.onDark} mx-2 mb-2 mt-2 rounded-[2rem] bg-[var(--ink)] px-5 py-12 text-[var(--tile)] md:mx-4 md:rounded-[3rem] md:px-12 md:py-20`}>
      <div className="mx-auto grid max-w-[1360px] gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
        <div>
          <p className={`${s.display}`} style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}>
            Thanks for stopping by.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            <a href="#bk-name" className={`${s.press} inline-flex h-11 items-center rounded-full bg-[var(--mustard)] px-6 text-base font-bold text-[var(--ink)] hover:bg-[var(--tile)]`}>
              Back to the note
            </a>
            <a href="https://www.linkedin.com/in/parag-salunkhe" target="_blank" rel="noopener noreferrer" className={`${s.press} inline-flex h-11 items-center gap-2 rounded-full border-2 border-[var(--tile)]/50 px-4 hover:bg-[var(--tile)] hover:text-[var(--ink)]`}>
              <Linkedin size={18} aria-hidden="true" /> LinkedIn
            </a>
            <a href="https://github.com/Parag-S-Salunkhe" target="_blank" rel="noopener noreferrer" className={`${s.press} inline-flex h-11 items-center gap-2 rounded-full border-2 border-[var(--tile)]/50 px-4 hover:bg-[var(--tile)] hover:text-[var(--ink)]`}>
              <Github size={18} aria-hidden="true" /> GitHub
            </a>
          </div>
        </div>
        <section aria-labelledby="bk-fridge">
          <h2 id="bk-fridge" className={`${s.title} text-2xl`}>On the fridge</h2>
          {guestbook.length === 0 ? (
            <p className={`${s.body} mt-4 max-w-[36ch] text-[var(--tile)]/85`}>The fridge door is bare. Leave the first note and I will stick it up.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {guestbook.slice(0, 3).map((g) => (
                <li key={g.id} className="rounded-2xl bg-[var(--tile)] p-4 text-[var(--ink)]">
                  <p className={s.body}>
                    {g.emoji ? <span aria-hidden="true" className="mr-2">{g.emoji}</span> : null}
                    {g.message}
                  </p>
                  <p className={`${s.nums} mt-2 text-sm text-[#4a4a52]`}>{fmtDate(g.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </footer>
  )
}
