import Link from 'next/link'
import { Github, Linkedin } from 'lucide-react'
import s from './styles.module.css'

export default function Footer() {
  return (
    <footer className="mt-8 bg-[var(--riso-blue)] text-[var(--paper)]">
      <div className="relative mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6 px-4 py-12 sm:px-6">
        <div>
          <p className={`${s.display} text-[clamp(1.5rem,6vw,2.5rem)]`}>That&rsquo;s the zine.</p>
          <p className={`${s.hand} mt-2 text-3xl text-[var(--riso-yellow)]`}>take one for the road</p>
        </div>
        <ul className="flex flex-wrap gap-x-4 text-lg">
          <li><Link href="/projects" className={`${s.label} inline-flex min-h-[44px] items-center underline`}>Projects</Link></li>
          <li><a href="https://www.linkedin.com/in/parag-salunkhe" target="_blank" rel="noopener noreferrer" className={`${s.label} inline-flex min-h-[44px] items-center gap-2 underline`}><Linkedin className="h-5 w-5" aria-hidden="true" />LinkedIn</a></li>
          <li><a href="https://github.com/Parag-S-Salunkhe" target="_blank" rel="noopener noreferrer" className={`${s.label} inline-flex min-h-[44px] items-center gap-2 underline`}><Github className="h-5 w-5" aria-hidden="true" />GitHub</a></li>
        </ul>
      </div>
    </footer>
  )
}
