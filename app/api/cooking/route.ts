import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
  try {
    const body = await request.json()
    const { dishName, category, rating, review, imageUrl, videoUrl, ingredients, cookDate } = body

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
        imageUrl: imageUrl?.trim() || null,
        videoUrl: videoUrl?.trim() || null,
        ingredients: ingredientsArray,
        cookDate: cookDate ? new Date(cookDate) : new Date(),
      },
    })

    return NextResponse.json(dish, { status: 201 })
  } catch (error) {
    console.error('Error creating cooking entry:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create cooking entry' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a cooking entry
export async function DELETE(request: Request) {
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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting cooking entry:', error)
    return NextResponse.json(
      { error: 'Failed to delete cooking entry' },
      { status: 500 }
    )
  }
}
