import type { Metadata } from 'next'
import { getMovies } from '@/lib/content'
import PrintTitle from '@/components/zine/PrintTitle'
import MoviesContent from './MoviesContent'
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
  return (
    <>
      <JsonLd data={collection('Movies', '/movies', metadata.description as string, movies.map((m) => ({ name: m.title, path: `/movies/${m.slug}` })))} />
    <section aria-labelledby="movies-title" className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 lg:pt-14">
      <div className="mb-8">
        <PrintTitle id="movies-title" lines="Movies" className="text-[clamp(3rem,13vw,6rem)]" />
        <p className="t-hand mt-2 -rotate-1 text-3xl sm:text-4xl">what was on the projector, and what I made of it</p>
      </div>
      <MoviesContent movies={movies} />
    </section>
    </>
  )
}
