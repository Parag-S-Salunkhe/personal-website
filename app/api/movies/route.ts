import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
  try {
    const body = await request.json()
    const { title, type, rating, review, watchDate, posterUrl } = body

    const movie = await prisma.movie.create({
      data: {
        title,
        type,
        rating: parseInt(rating),
        review,
        watchDate: new Date(watchDate),
        posterUrl,
      },
    })

    return NextResponse.json(movie, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create movie' }, { status: 500 })
  }
}
