import Link from 'next/link'
import type { Movie } from '@/lib/content'
import PosterFrame from '@/components/site/PosterFrame'
import Rating from '@/components/site/Rating'

/** A small poster card for "Also on the projector" (server component, no motion). */
export default function MovieTile({ movie, sizes }: { movie: Movie; sizes: string }) {
  return (
    <article className="group relative">
      <div className="transition-transform duration-300 ease-[var(--ease-ev)] group-hover:-translate-y-1 group-focus-within:-translate-y-1">
        <PosterFrame src={movie.posterUrl} title={movie.title} sizes={sizes} className="shadow-[0_14px_30px_rgb(0_0_0/0.55)] ring-1 ring-[var(--brass)]/30 transition-shadow duration-300 group-hover:ring-[var(--candle)]" />
      </div>
      <h3 className="ev-title mt-4 text-[var(--wax)] [overflow-wrap:anywhere]">
        <Link href={`/movies/${movie.slug}`} className="rounded-[3px] after:absolute after:inset-0 after:content-[''] group-hover:underline group-hover:decoration-[var(--candle)] group-hover:underline-offset-4 focus-visible:underline">
          {movie.title}
        </Link>
      </h3>
      <div className="mt-2 text-[var(--wax)]"><Rating n={movie.rating} size="sm" /></div>
    </article>
  )
}
