import type { Metadata } from 'next'
import { getMovies } from '@/lib/content'
import MoviesContent from './MoviesContent'
import Wall, { type WallItem } from '@/components/site/movies/Wall'
import { siteImg } from '@/components/site/img'
import { JsonLd, collection } from '@/lib/jsonld'
import { ogBase } from '@/lib/site'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Movies',
  description: 'Every film and series from movie night, with a score out of five and a few honest lines on each.',
  alternates: { canonical: '/movies' },
  openGraph: { ...ogBase, url: '/movies' },
}

export default async function MoviesPage() {
  const movies = await getMovies()
  const wall: WallItem[] = movies
    .filter((m) => m.posterUrl)
    .map((m) => ({ id: m.id, slug: m.slug, title: m.title, rating: m.rating, src: siteImg(m.posterUrl, 384)! }))
  const heading = (
    <>
      <h1 id="movies-title" className="ev-display text-[var(--wax)]" style={{ textShadow: '0 2px 24px rgb(5 9 18 / 0.9)' }}>Movies</h1>
      <p className="mt-3 max-w-[48ch] text-lg text-[var(--wax)]" style={{ textShadow: '0 1px 12px rgb(5 9 18 / 0.9)' }}>
        What was on the projector after supper, and what I made of it.
      </p>
    </>
  )
  return (
    <div className="bg-[var(--night)]">
      <JsonLd data={collection('Movies', '/movies', metadata.description as string, movies.map((m) => ({ name: m.title, path: `/movies/${m.slug}` })))} />
      <section aria-labelledby="movies-title">
        {wall.length > 0 ? (
          <Wall items={wall}>{heading}</Wall>
        ) : (
          <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:pt-14">{heading}</div>
        )}
      </section>
      <section aria-label="All the movies" className="mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6">
        <MoviesContent movies={movies} />
      </section>
    </div>
  )
}
