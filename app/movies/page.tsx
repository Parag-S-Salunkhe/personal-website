import { prisma } from '@/lib/prisma'
import MoviesContent from './MoviesContent'

export default async function MoviesPage() {
  const movies = await prisma.movie.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      type: true,
      rating: true,
      review: true,
      watchDate: true,
      posterUrl: true,
    },
  })

  const serialized = movies.map(movie => ({
    ...movie,
    type: movie.type as string,
    watchDate: movie.watchDate.toISOString(),
  }))

  return <MoviesContent movies={serialized} />
}
