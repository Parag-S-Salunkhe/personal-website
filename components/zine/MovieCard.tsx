import Image from 'next/image'
import Link from 'next/link'
import type { Movie } from '@/lib/content'
import { fmtDate } from '@/lib/format'
import { NoPoster, Rated, Tape } from './Marks'
import { isOptimizable } from '@/lib/url'

// A taped duotone poster with the score stamped in a pink circle. The whole card is the link.
export default function MovieCard({ movie, sizes = '(min-width: 1024px) 270px, (min-width: 640px) 40vw, 64vw', priority = false, headingLevel = 'h3' }: {
  movie: Movie
  sizes?: string
  priority?: boolean
  headingLevel?: 'h2' | 'h3'
}) {
  const H = headingLevel
  return (
    <article className="group relative">
      <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-2" />
      <div className="relative transition-transform duration-300 ease-zine group-hover:-translate-y-1">
        <div className="duo relative aspect-[2/3] shadow-[0_1px_0_rgba(27,35,80,.15)]">
          {movie.posterUrl ? (
            <Image unoptimized={!isOptimizable(movie.posterUrl)} src={movie.posterUrl} alt={`Poster for ${movie.title}`} fill sizes={sizes} priority={priority} />
          ) : (
            <NoPoster label={`No poster for ${movie.title} yet: a clapperboard`} />
          )}
        </div>
        <div className="absolute -bottom-5 right-2 z-[3] rounded-full bg-paper">
          <Rated n={movie.rating} />
        </div>
      </div>
      <H className="t-title mt-3 pr-14 text-2xl [overflow-wrap:anywhere]">
        <Link href={`/movies/${movie.slug}`} className="after:absolute after:inset-0 after:content-[''] group-hover:underline group-hover:decoration-riso-pink group-hover:decoration-[3px] group-hover:underline-offset-4">
          {movie.title}
        </Link>
      </H>
      <p className="t-label nums mt-1 text-lg">
        {movie.type === 'SERIES' ? 'Series' : 'Film'}, watched {fmtDate(movie.watchDate)}
      </p>
      {movie.review && <p className="mt-2 line-clamp-2 text-base text-ink">{movie.review}</p>}
    </article>
  )
}
