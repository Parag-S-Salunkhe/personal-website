import type { Metadata } from 'next'
import { getNotes } from '@/lib/content'
import NotesContent from './NotesContent'
import { JsonLd, collection } from '@/lib/jsonld'
import { ogBase } from '@/lib/site'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Notes',
  description: 'Short notes from Parag: ideas, lists, things learned and things to try at the next dinner.',
  alternates: { canonical: '/notes' },
  openGraph: { ...ogBase, url: '/notes' },
}

export default async function NotesPage() {
  const notes = await getNotes()
  return (
    <>
      <JsonLd data={collection('Notes', '/notes', metadata.description as string, notes.map((n) => ({ name: n.title, path: `/notes/${n.slug}` })))} />
      <section aria-labelledby="notes-title" className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:pt-14">
        <div className="mb-10">
          <h1 id="notes-title" className="ev-display text-[var(--wax)]">Notes</h1>
          <p className="mt-3 max-w-[56ch] text-lg text-[var(--sage)]">Short notes: ideas, lists, things learned and things to try at the next dinner.</p>
        </div>
        <NotesContent notes={notes} />
      </section>
    </>
  )
}
