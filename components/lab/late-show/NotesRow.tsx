import Link from 'next/link'
import type { LabNote } from '@/components/lab/data'
import s from './styles.module.css'
import SectionHead from './SectionHead'
import { fmtDate } from './fmt'

export default function NotesRow({ notes }: { notes: LabNote[] }) {
  if (notes.length === 0) return null
  return (
    <section aria-labelledby="notes-h" className="mx-auto max-w-7xl px-5 pb-24 pt-4 sm:px-8">
      <SectionHead id="notes-h" title="Ticket scraps" line="Small thoughts I keep in my pocket." href="/notes" cta="Empty my pockets" />
      <div>
        <ul className={`${s.row} -mx-5 flex gap-5 overflow-x-auto px-5 pb-4 sm:mx-0 sm:px-0`}>
          {notes.slice(0, 5).map((n, i) => (
            <li key={n.id} className="w-[220px] shrink-0">
              <Link href="/notes" className={`${s.lift} ${s.torn} block bg-[var(--beam)] px-5 pb-5 pt-6 text-[var(--velvet)]`}>
                <p className={`${s.display} break-words text-2xl`}>{n.title}</p>
                <p className="mt-2 line-clamp-3 text-sm">{n.excerpt}</p>
                <p className="num mt-3 text-sm font-semibold">{n.category ? `${n.category}, ` : ''}{fmtDate(n.createdAt)}</p>
                <span className="sr-only">Note {i + 1}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
