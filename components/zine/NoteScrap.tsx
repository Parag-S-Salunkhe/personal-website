import Link from 'next/link'
import type { Note } from '@/lib/content'
import { fmtDate } from '@/lib/format'
import { Tape } from './Marks'

// A yellow sticky note with a strip of pink tape.
export default function NoteScrap({ note, headingLevel = 'h3' }: { note: Note; headingLevel?: 'h2' | 'h3' }) {
  const H = headingLevel
  return (
    <article className="group relative flex h-full flex-col bg-riso-yellow p-4 pt-6 text-ink transition-transform duration-300 ease-zine hover:-translate-y-1">
      <Tape pink className="-top-3 left-1/2 -translate-x-1/2 -rotate-2" />
      <H className="t-title text-xl [overflow-wrap:anywhere]">
        <Link href={`/notes/${note.slug}`} className="after:absolute after:inset-0 after:content-[''] group-hover:underline group-hover:decoration-riso-pink group-hover:decoration-[3px] group-hover:underline-offset-4">
          {note.title}
        </Link>
      </H>
      <p className="mt-2 line-clamp-4 text-sm">{note.excerpt}</p>
      <p className="t-label nums mt-auto pt-3 text-base">
        {note.category ? `${note.category}, ` : ''}
        {fmtDate(note.createdAt)}
      </p>
    </article>
  )
}
