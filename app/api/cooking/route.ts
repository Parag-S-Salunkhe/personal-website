import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { revalidateSection } from '@/lib/revalidate'
import { optionalHttpUrl } from '@/lib/url'

// GET - Fetch all cooking entries
export async function GET() {
  try {
    const dishes = await prisma.cooking.findMany({
      orderBy: { cookDate: 'desc' },
    })
    return NextResponse.json({ dishes })
  } catch (error) {
    console.error('Error fetching cooking entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cooking entries' },
      { status: 500 }
    )
  }
}

// POST - Create new cooking entry
export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const body = await request.json()
    const { dishName, category, rating, review, imageUrl, videoUrl, ingredients, cookDate } = body
    const imageUrlUrl = optionalHttpUrl(body.imageUrl)
    const videoUrlUrl = optionalHttpUrl(body.videoUrl)
    if (!imageUrlUrl.ok || !videoUrlUrl.ok) {
      return NextResponse.json({ error: 'Links must start with http:// or https://' }, { status: 400 })
    }

    // Ensure ingredients is always an array (even if empty)
    const ingredientsArray = ingredients 
      ? (Array.isArray(ingredients) ? ingredients : ingredients.split(',').map((i: string) => i.trim()).filter(Boolean))
      : []

    const dish = await prisma.cooking.create({
      data: {
        dishName,
        category,
        rating: parseInt(rating),
        review,
        imageUrl: imageUrlUrl.value,
        videoUrl: videoUrlUrl.value,
        ingredients: ingredientsArray,
        cookDate: cookDate ? new Date(cookDate) : new Date(),
      },
    })
    revalidateSection('cooking')

    return NextResponse.json(dish, { status: 201 })
  } catch (error) {
    console.error('Error creating cooking entry:', error)
    return NextResponse.json(
      { error: 'Failed to create cooking entry' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a cooking entry
export async function DELETE(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    await prisma.cooking.delete({
      where: { id },
    })
    revalidateSection('cooking')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting cooking entry:', error)
    return NextResponse.json(
      { error: 'Failed to delete cooking entry' },
      { status: 500 }
    )
  }
}
