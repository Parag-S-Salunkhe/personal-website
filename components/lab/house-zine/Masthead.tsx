import Link from 'next/link'
import s from './styles.module.css'

const NAV = [['Movies', '/movies'], ['Cooking', '/cooking'], ['Blog', '/blog'], ['Notes', '/notes'], ['Projects', '/projects']]

export default function Masthead() {
  return (
    <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 border-b-2 border-[var(--riso-blue)] px-4 pt-2 sm:px-6">
      <a href="#hz-main" className="sr-only focus:not-sr-only focus:bg-[var(--riso-yellow)] focus:px-3 focus:py-2 focus:text-[var(--ink)]">Skip to content</a>
      <Link href="/lab/house-zine" className={`${s.display} inline-flex min-h-[44px] items-center text-xl`} style={{ fontVariationSettings: "'wdth' 120" }}>Parag&rsquo;s zine</Link>
      <nav aria-label="Sections">
        <ul className="flex flex-wrap gap-x-4">
          {NAV.map(([label, href]) => (
            <li key={href}><Link href={href} className={`${s.label} ${s.link} inline-flex min-h-[44px] items-center text-lg`}>{label}</Link></li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
