import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { excerpt, getMovieBySlug, getMovies } from '@/lib/content'
import { fmtLongDate, fmtRating, paragraphs } from '@/lib/format'
import BackLink from '@/components/site/BackLink'
import PosterFrame from '@/components/site/PosterFrame'
import Prose from '@/components/site/Prose'
import Rating from '@/components/site/Rating'
import { SectionHead } from '@/components/site/SectionHead'
import Beam from '@/components/site/movies/Beam'
import MovieTile from '@/components/site/movies/MovieTile'
import { JsonLd, abs, author, breadcrumbs } from '@/lib/jsonld'
import { ogBase } from '@/lib/site'

export const revalidate = 3600
export const generateStaticParams = async () => [] as { slug: string }[]

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const movie = await getMovieBySlug((await params).slug)
  if (!movie) return { title: 'Movie not found', robots: { index: false } }
  const kind = movie.type === 'SERIES' ? 'series' : 'film'
  const base = `Parag's take on the ${kind} ${movie.title}, rated ${fmtRating(movie.rating)} out of 5`
  const description = movie.review.length >= 70 ? excerpt(movie.review, 155) : movie.review ? excerpt(`${base}: "${movie.review.trim()}"`, 155) : `${base}.`
  return {
    title: `${movie.title}: ${kind} review`,
    description,
    alternates: { canonical: `/movies/${movie.slug}` },
    openGraph: { ...ogBase, type: 'article', url: `/movies/${movie.slug}`, title: `${movie.title}, rated ${fmtRating(movie.rating)}/5` },
  }
}

export default async function MoviePage({ params }: Props) {
  const { slug } = await params
  const movie = await getMovieBySlug(slug)
  if (!movie) notFound()
  if (slug !== movie.slug) permanentRedirect(`/movies/${movie.slug}`)

  const more = (await getMovies()).filter((m) => m.id !== movie.id).slice(0, 4)
  const body = paragraphs(movie.review)

  return (
    <article aria-labelledby="movie-title" className="overflow-x-clip bg-[var(--night)]">
      <JsonLd data={{ '@graph': [
        {
          '@type': 'Review',
          '@id': abs(`/movies/${movie.slug}#review`),
          url: abs(`/movies/${movie.slug}`),
          name: `${movie.title}: review`,
          author,
          datePublished: movie.watchDate.slice(0, 10),
          reviewBody: movie.review || undefined,
          reviewRating: { '@type': 'Rating', ratingValue: movie.rating, bestRating: 5, worstRating: 1 },
          itemReviewed: { '@type': movie.type === 'SERIES' ? 'TVSeries' : 'Movie', name: movie.title, image: movie.posterUrl || undefined },
        },
        breadcrumbs([['Home', '/'], ['Movies', '/movies'], [movie.title, `/movies/${movie.slug}`]]),
      ] }} />
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <BackLink href="/movies">All the movies</BackLink>
      </div>

      <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-16 pt-8 sm:px-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-16">
        <figure className="m-0 md:pt-4">
          <Beam>
            <PosterFrame src={movie.posterUrl} title={movie.title} priority sizes="(min-width: 768px) 420px, 16rem" />
          </Beam>
        </figure>

        <div className="min-w-0">
          <h1 id="movie-title" className="ev-h1 text-[var(--wax)] [overflow-wrap:anywhere]">{movie.title}</h1>
          <dl className="ev-card mt-8 grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-3 px-8 py-6 sm:grid-cols-[auto_auto_auto] sm:justify-start sm:gap-x-10">
            <div>
              <dt className="ev-label ev-soft">Kind</dt>
              <dd className="ev-meta text-base text-[var(--cloth)]">{movie.type === 'SERIES' ? 'Series' : 'Film'}</dd>
            </div>
            <div>
              <dt className="ev-label ev-soft">Watched</dt>
              <dd className="ev-meta text-base text-[var(--cloth)]"><time dateTime={movie.watchDate}>{fmtLongDate(movie.watchDate)}</time></dd>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <dt className="ev-label ev-soft">My score</dt>
              <dd className="flex items-center gap-3 text-[var(--cloth)]">
                <Rating n={movie.rating} size="lg" />
                <span className="ev-meta text-base">{fmtRating(movie.rating)} / 5</span>
              </dd>
            </div>
          </dl>
          <Prose className="mt-8" paragraphs={body} empty="No write-up for this one yet." />
        </div>
      </div>

      {more.length > 0 && (
        <section aria-labelledby="more-movies" className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6">
          <SectionHead id="more-movies" title="Also on the projector" href="/movies" linkLabel="All the movies" />
          <ul className="grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:grid-cols-4">
            {more.map((m) => (
              <li key={m.id}>
                <MovieTile movie={m} sizes="(min-width: 1024px) 270px, 45vw" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
