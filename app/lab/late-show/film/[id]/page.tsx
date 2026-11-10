import { notFound } from 'next/navigation'
import { getLabData } from '@/components/lab/kit/data'
import { labImg } from '@/components/lab/kit/img'
import LabTag from '@/components/lab/kit/LabTag'
import FilmStage from '@/components/lab/late-show/FilmStage'

export const revalidate = 3600

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const { movies } = await getLabData()
  return { title: movies.find((m) => m.id === id)?.title ?? 'Film' }
}

export default async function FilmPage({ params }: Props) {
  const { id } = await params
  const { movies } = await getLabData()
  const m = movies.find((x) => x.id === id)
  if (!m) notFound()
  const date = new Date(m.watchDate).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  const paras = m.review.split(/\n{2,}|\r\n{2,}/).map((p) => p.trim()).filter(Boolean)
  return (
    <main className="ls-film">
      <LabTag title="Late Show" />
      <FilmStage film={{ id: m.id, title: m.title, rating: m.rating, src: labImg(m.posterUrl, 640), dateLabel: date, type: m.type }} />
      <article className="ls-notes" aria-label="Programme notes">
        <div className="ls-notes-col">
          <h2>Programme notes</h2>
          {paras.length ? paras.map((p, i) => <p key={i}>{p}</p>) : <p>No notes were written for this one.</p>}
          <div className="ls-notes-foot">
            <a href="/lab/late-show#wall">Back to the wall</a>
            <a href={`/movies/${m.slug}`}>This film on the main site</a>
          </div>
        </div>
      </article>
    </main>
  )
}
