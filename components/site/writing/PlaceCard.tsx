import Link from 'next/link'
import type { Note } from '@/lib/content'
import { fmtDate } from '@/lib/format'
import './writing.css'

/** A tent place card: a fold line near the top, the category in script (decorative), title link, date. */
export default function PlaceCard({ note, headingLevel = 'h2' }: { note: Note; headingLevel?: 'h2' | 'h3' }) {
  const H = headingLevel
  return (
    <article className="wr-place ev-card relative flex h-full flex-col px-5 pb-5 pt-0">
      <div className="wr-fold -mx-5 flex h-16 items-end overflow-hidden px-5 pb-1.5" aria-hidden="true">
        {note.category && <span className="ev-name truncate text-3xl text-[var(--claret)]">{note.category}</span>}
      </div>
      <H className="ev-title mt-5 text-xl [overflow-wrap:anywhere]">
        <Link href={`/notes/${note.slug}`} className="after:absolute after:inset-0 after:content-[''] hover:underline hover:decoration-2 hover:underline-offset-4">
          {note.title}
        </Link>
      </H>
      <p className="mt-2 line-clamp-3 text-[0.9375rem]">{note.excerpt}</p>
      <p className="ev-meta ev-soft mt-auto pt-4">
        {note.category ? `${note.category}, ` : ''}
        {fmtDate(note.createdAt)}
      </p>
    </article>
  )
}
