import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { LabData } from '../data'
import s from './styles.module.css'

export default function SectionTiles({ data }: { data: LabData }) {
  const tiles = [
    { label: 'Movies', href: '/movies', bg: 'var(--cobalt)', fg: 'var(--tile)', latest: data.movies[0]?.title, empty: 'Nothing watched yet' },
    { label: 'Cooking', href: '/cooking', bg: 'var(--tomato)', fg: 'var(--ink)', latest: data.dishes[0]?.dishName, empty: 'The stove is cold' },
    { label: 'Blog', href: '/blog', bg: 'var(--mustard)', fg: 'var(--ink)', latest: data.posts[0]?.title, empty: 'Nothing written yet' },
    { label: 'Notes', href: '/notes', bg: 'var(--pea)', fg: 'var(--tile)', latest: data.notes[0]?.title, empty: 'No scraps yet' },
  ]
  return (
    <nav aria-label="Jump into a section" className="px-2 pt-2 md:px-4 md:pt-3">
      <ul className="mx-auto grid max-w-[1360px] grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {tiles.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              className={`${s.sectionTile} relative block h-48 overflow-hidden rounded-2xl p-4 md:h-64 md:rounded-3xl md:p-6`}
              style={{ background: t.bg, color: t.fg }}
            >
              <ArrowUpRight aria-hidden="true" className={`${s.arrow} absolute right-4 top-4 md:right-6 md:top-6`} size={28} />
              <span className={`${s.slideWrap} absolute inset-x-4 bottom-4 md:inset-x-6 md:bottom-6`}>
                <span className={`${s.display} block`} style={{ fontSize: 'clamp(1.75rem, 3.6vw, 3.25rem)' }}>{t.label}</span>
                <span className={`${s.latest} ${s.body} mt-2 block text-sm md:text-base`}>
                  <span className="block font-semibold">Latest</span>
                  <span className="line-clamp-2 break-words">{t.latest ?? t.empty}</span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
