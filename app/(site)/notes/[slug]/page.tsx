import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getNoteBySlug, getNotes } from '@/lib/content'
import { fmtDate, fmtLongDate, paragraphs, readingMinutes, tilt } from '@/lib/format'
import PrintTitle from '@/components/zine/PrintTitle'
import NoteScrap from '@/components/zine/NoteScrap'
import Settle from '@/components/zine/Settle'
import { Tape } from '@/components/zine/Marks'
import { SectionHead } from '@/components/zine/SectionHead'
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

// A note reads like a page torn from the notebook on the fridge: a pink margin line, a strip of tape.
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
      <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6">
        <Link href="/notes" className="t-label ink-link inline-flex min-h-[44px] items-center gap-2 text-lg">
          <ArrowLeft className="h-5 w-5" aria-hidden="true" /> All the notes
        </Link>
        <div className="mt-6">
          <p className="t-label nums text-xl">
            {note.category ? `${note.category}, ` : ''}
            <time dateTime={note.createdAt}>{fmtLongDate(note.createdAt)}</time>
          </p>
          <PrintTitle id="note-title" lines={note.title} className="mt-2 text-[clamp(2.25rem,8vw,4rem)] [overflow-wrap:anywhere]" />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-12 pt-8 sm:px-6">
        <div className="relative">
          <Tape className="-top-3 left-1/2 -translate-x-1/2 -rotate-2" />
          <div className="relative border-2 border-riso-blue/20 bg-slip py-10 pl-10 pr-5 sm:pl-16 sm:pr-10">
            <span aria-hidden="true" className="absolute inset-y-0 left-5 w-[3px] bg-riso-pink/70 sm:left-10" />
            {body.length > 0 ? (
              <div className="prose-zine">
                {body.map((p, i) => <p key={i} className="whitespace-pre-line [overflow-wrap:anywhere]">{p}</p>)}
              </div>
            ) : (
              <p className="t-hand text-3xl">just the title for now</p>
            )}
            <p className="t-label nums mt-8 text-base">
              {readingMinutes(note.content)} min read{edited ? `, last touched ${fmtDate(note.updatedAt)}` : ''}
            </p>
          </div>
        </div>
      </div>

      {more.length > 0 && (
        <section aria-labelledby="more-notes" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <SectionHead id="more-notes" title="More scraps" href="/notes" linkLabel="All the notes" />
          <ul className="grid grid-cols-1 gap-8 min-[420px]:grid-cols-2 lg:grid-cols-4">
            {more.map((n, i) => (
              <li key={n.id}>
                <Settle rotate={tilt(i * 3 + 1)} className="h-full">
                  <NoteScrap note={n} />
                </Settle>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
