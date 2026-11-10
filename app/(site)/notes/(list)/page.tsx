import type { Metadata } from 'next'
import { getNotes } from '@/lib/content'
import PrintTitle from '@/components/zine/PrintTitle'
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
    <section aria-labelledby="notes-title" className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 lg:pt-14">
      <div className="mb-8">
        <PrintTitle id="notes-title" lines="Notes" className="text-[clamp(3rem,13vw,6rem)]" />
        <p className="t-hand mt-2 -rotate-1 text-3xl sm:text-4xl">scraps from my pockets and the fridge door</p>
      </div>
      <NotesContent notes={notes} />
    </section>
    </>
  )
}
