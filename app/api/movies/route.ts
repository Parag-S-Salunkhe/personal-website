import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { revalidateSection } from '@/lib/revalidate'
import { optionalHttpUrl } from '@/lib/url'

export async function GET() {
  try {
    const movies = await prisma.movie.findMany({
      orderBy: { watchDate: 'desc' },
    })
    return NextResponse.json({ movies })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const body = await request.json()
    const { title, type, rating, review, watchDate, posterUrl } = body
    const posterUrlUrl = optionalHttpUrl(body.posterUrl)
    if (!posterUrlUrl.ok) {
      return NextResponse.json({ error: 'Links must start with http:// or https://' }, { status: 400 })
    }

    const movie = await prisma.movie.create({
      data: {
        title,
        type,
        rating: parseInt(rating),
        review,
        watchDate: new Date(watchDate),
        posterUrl: posterUrlUrl.value,
      },
    })
    revalidateSection('movies')

    return NextResponse.json(movie, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create movie' }, { status: 500 })
  }
}
