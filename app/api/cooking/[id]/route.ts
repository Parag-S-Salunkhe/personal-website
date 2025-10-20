import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single dish
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dish = await prisma.cooking.findUnique({
      where: { id: params.id },
    })

    if (!dish) {
      return NextResponse.json({ error: 'Dish not found' }, { status: 404 })
    }

    return NextResponse.json(dish)
  } catch (error) {
    console.error('Error fetching dish:', error)
    return NextResponse.json({ error: 'Failed to fetch dish' }, { status: 500 })
  }
}

// UPDATE dish
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { dishName, category, rating, review, imageUrl, videoUrl, ingredients, cookDate } = body

    // Ensure ingredients is always an array (even if empty)
    const ingredientsArray = ingredients 
      ? (Array.isArray(ingredients) ? ingredients : ingredients.split(',').map((i: string) => i.trim()).filter(Boolean))
      : []

    const dish = await prisma.cooking.update({
      where: { id: params.id },
      data: {
        dishName,
        category,
        rating: parseInt(rating),
        review,
        imageUrl: imageUrl?.trim() || null,
        videoUrl: videoUrl?.trim() || null,
        ingredients: ingredientsArray,
        cookDate: new Date(cookDate),
      },
    })

    return NextResponse.json(dish)
  } catch (error) {
    console.error('Error updating dish:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update dish' }, 
      { status: 500 }
    )
  }
}

// DELETE dish
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.cooking.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Dish deleted successfully' })
  } catch (error) {
    console.error('Error deleting dish:', error)
    return NextResponse.json({ error: 'Failed to delete dish' }, { status: 500 })
  }
}
