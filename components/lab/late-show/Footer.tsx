import Link from 'next/link'
import s from './styles.module.css'

const links = [['/movies', 'Movies'], ['/cooking', 'Cooking'], ['/blog', 'Blog'], ['/notes', 'Notes'], ['/projects', 'Projects']]

export default function Footer() {
  return (
    <footer className="border-t border-[var(--brass)]/40 bg-[#1d0710] px-5 py-12 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <p className={`${s.display} text-3xl`}>Thanks for coming. Mind the step.</p>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-2">
            {links.map(([h, l]) => (
              <li key={h}><Link href={h} className="inline-flex min-h-[44px] items-center px-2 underline">{l}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
