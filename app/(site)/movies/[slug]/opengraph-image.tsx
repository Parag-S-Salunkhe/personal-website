import { getMovieBySlug } from '@/lib/content'
import { fmtDate } from '@/lib/format'
import { ogContentType, ogPoster, ogSize, zineImage } from '@/lib/og'

export const alt = 'A movie from Parag\'s movie night, with his score'
export const size = ogSize
export const contentType = ogContentType

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const movie = await getMovieBySlug((await params).slug)
  if (!movie) return zineImage({ kicker: 'Movies', title: 'Movie night' })
  return zineImage({
    kicker: `${movie.type === 'SERIES' ? 'Series' : 'Film'}, watched ${fmtDate(movie.watchDate)}`,
    title: movie.title,
    rating: movie.rating,
    image: ogPoster(movie.posterUrl),
  })
}
