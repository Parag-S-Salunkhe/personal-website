import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { excerpt, getMovieBySlug, getMovies } from '@/lib/content'
import { fmtLongDate, fmtRating, paragraphs, tilt } from '@/lib/format'
import PrintTitle from '@/components/zine/PrintTitle'
import MovieCard from '@/components/zine/MovieCard'
import Settle from '@/components/zine/Settle'
import { NoPoster, Rated, Tape } from '@/components/zine/Marks'
import { SectionHead } from '@/components/zine/SectionHead'

export const revalidate = 3600
export const generateStaticParams = async () => [] as { slug: string }[]

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const movie = await getMovieBySlug((await params).slug)
  if (!movie) return { title: 'Movie not found', robots: { index: false } }
  const kind = movie.type === 'SERIES' ? 'series' : 'film'
  const description = movie.review
    ? excerpt(movie.review, 155)
    : `Parag's notes on the ${kind} ${movie.title}, rated ${fmtRating(movie.rating)} out of 5.`
  return {
    title: `${movie.title}: ${kind} review`,
    description,
    alternates: { canonical: `/movies/${movie.slug}` },
    openGraph: { type: 'article', url: `/movies/${movie.slug}`, title: `${movie.title}, rated ${fmtRating(movie.rating)}/5` },
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
    <article aria-labelledby="movie-title">
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <Link href="/movies" className="t-label ink-link inline-flex min-h-[44px] items-center gap-2 text-lg">
          <ArrowLeft className="h-5 w-5" aria-hidden="true" /> All the movies
        </Link>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-12 pt-6 sm:px-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-14">
        <figure className="relative mx-auto w-full max-w-[14rem] sm:max-w-xs md:max-w-none">
          <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-2 bg-riso-pink" aria-hidden="true" />
          <div className="relative -rotate-1">
            <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-3" />
            <div className="relative aspect-[2/3] overflow-hidden bg-riso-blue">
              {movie.posterUrl ? (
                <Image src={movie.posterUrl} alt={`Poster for ${movie.title}`} fill priority sizes="(min-width: 768px) 420px, 80vw" className="object-cover" />
              ) : (
                <NoPoster label={`No poster for ${movie.title} yet: a clapperboard`} />
              )}
            </div>
          </div>
        </figure>

        <div className="min-w-0">
          <p className="t-label text-xl">{movie.type === 'SERIES' ? 'Series' : 'Film'}</p>
          <PrintTitle id="movie-title" lines={movie.title} className="mt-1 text-[clamp(2.5rem,9vw,4.5rem)] [overflow-wrap:anywhere]" />
          <dl className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 border-y-2 border-dashed border-riso-blue py-4">
            <div>
              <dt className="t-label text-base">Watched</dt>
              <dd className="nums text-lg text-ink"><time dateTime={movie.watchDate}>{fmtLongDate(movie.watchDate)}</time></dd>
            </div>
            <div className="flex items-center gap-3">
              <dt className="t-label text-base">My score</dt>
              <dd><Rated n={movie.rating} size="lg" /></dd>
            </div>
          </dl>
          {body.length > 0 ? (
            <div className="prose-zine mt-8">
              {body.map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}
            </div>
          ) : (
            <p className="t-hand mt-8 text-3xl">no write-up for this one yet</p>
          )}
        </div>
      </div>

      {more.length > 0 && (
        <section aria-labelledby="more-movies" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <SectionHead id="more-movies" title="Also on the projector" href="/movies" linkLabel="All the movies" />
          <ul className="grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:grid-cols-4">
            {more.map((m, i) => (
              <li key={m.id}>
                <Settle rotate={tilt(i + 1)} className="relative">
                  <MovieCard movie={m} sizes="(min-width: 1024px) 270px, 45vw" />
                </Settle>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
