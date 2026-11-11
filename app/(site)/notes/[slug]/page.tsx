import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getNoteBySlug, getNotes } from '@/lib/content'
import { fmtDate, fmtLongDate, paragraphs, readingMinutes } from '@/lib/format'
import BackLink from '@/components/site/BackLink'
import Prose from '@/components/site/Prose'
import { SectionHead } from '@/components/site/SectionHead'
import RiseTitle from '@/components/site/writing/RiseTitle'
import NoteGrid from '@/components/site/writing/NoteGrid'
import { JsonLd, abs, author, breadcrumbs } from '@/lib/jsonld'
import { ogBase } from '@/lib/site'

export const revalidate = 3600
export const generateStaticParams = async () => [] as { slug: string }[]

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const note = await getNoteBySlug((await params).slug)
  if (!note) return { title: 'Note not found', robots: { index: false } }
  return {
    title: note.title,
    description: note.excerpt.slice(0, 160),
    alternates: { canonical: `/notes/${note.slug}` },
    openGraph: { ...ogBase, type: 'article', url: `/notes/${note.slug}`, publishedTime: note.createdAt, modifiedTime: note.updatedAt },
  }
}

// One place card, read: the note on a large linen card under a single candle glow.
export default async function NotePage({ params }: Props) {
  const { slug } = await params
  const note = await getNoteBySlug(slug)
  if (!note) notFound()
  if (slug !== note.slug) permanentRedirect(`/notes/${note.slug}`)

  const more = (await getNotes()).filter((n) => n.id !== note.id).slice(0, 4)
  const body = paragraphs(note.content)
  const edited = note.updatedAt.slice(0, 10) !== note.createdAt.slice(0, 10)

  return (
    <article aria-labelledby="note-title">
      <JsonLd data={{ '@graph': [
        {
          '@type': 'Article',
          headline: note.title,
          description: note.excerpt,
          url: abs(`/notes/${note.slug}`),
          mainEntityOfPage: abs(`/notes/${note.slug}`),
          datePublished: note.createdAt,
          dateModified: note.updatedAt,
          articleSection: note.category || 'Notes',
          author,
          inLanguage: 'en-IE',
        },
        breadcrumbs([['Home', '/'], ['Notes', '/notes'], [note.title, `/notes/${note.slug}`]]),
      ] }} />
      <div className="relative">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,rgb(246_185_79/0.2),transparent_70%)]" />
        <div className="relative mx-auto max-w-4xl px-4 pt-8 sm:px-6">
          <BackLink href="/notes">All the notes</BackLink>
          <div className="mt-6">
            <p className="ev-meta text-base text-[var(--sage)]">
              {note.category ? `${note.category}, ` : ''}
              <time dateTime={note.createdAt}>{fmtLongDate(note.createdAt)}</time>
            </p>
            <h1 id="note-title" className="ev-h1 mt-3 text-[var(--wax)] [overflow-wrap:anywhere]">
              <RiseTitle text={note.title} />
            </h1>
          </div>
        </div>

        <div className="relative mx-auto max-w-4xl px-4 pb-12 pt-8 sm:px-6">
          <Prose paragraphs={body} empty="Just the title for now." />
          <p className="ev-meta mx-auto mt-6 max-w-[68ch] text-base text-[var(--sage)]">
            {readingMinutes(note.content)} min read{edited ? `, last touched ${fmtDate(note.updatedAt)}` : ''}
          </p>
        </div>
      </div>

      {more.length > 0 && (
        <section aria-labelledby="more-notes" className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
          <SectionHead id="more-notes" title="More notes" href="/notes" linkLabel="All the notes" />
          <NoteGrid notes={more} headingLevel="h3" />
        </section>
      )}
    </article>
  )
}
