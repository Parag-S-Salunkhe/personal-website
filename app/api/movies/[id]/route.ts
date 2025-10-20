import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single movie
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const movie = await prisma.movie.findUnique({
      where: { id: params.id },
    })

    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 })
    }

    return NextResponse.json(movie)
  } catch (error) {
    console.error('Error fetching movie:', error)
    return NextResponse.json({ error: 'Failed to fetch movie' }, { status: 500 })
  }
}

// UPDATE movie
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, type, rating, review, watchDate, posterUrl } = body

    const movie = await prisma.movie.update({
      where: { id: params.id },
      data: {
        title,
        type,
        rating: parseInt(rating),
        review,
        watchDate: new Date(watchDate),
        posterUrl: posterUrl || null,
      },
    })

    return NextResponse.json(movie)
  } catch (error) {
    console.error('Error updating movie:', error)
    return NextResponse.json({ error: 'Failed to update movie' }, { status: 500 })
  }
}

// DELETE movie
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.movie.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Movie deleted successfully' })
  } catch (error) {
    console.error('Error deleting movie:', error)
    return NextResponse.json({ error: 'Failed to delete movie' }, { status: 500 })
  }
}
