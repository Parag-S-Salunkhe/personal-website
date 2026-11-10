import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { revalidateSection } from '@/lib/revalidate'
import { optionalHttpUrl } from '@/lib/url'

// GET single dish
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const dish = await prisma.cooking.findUnique({
      where: { id: (await params).id },
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
  { params }: { params: Promise<{ id: string }> }
) {
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

    const dish = await prisma.cooking.update({
      where: { id: (await params).id },
      data: {
        dishName,
        category,
        rating: parseInt(rating),
        review,
        imageUrl: imageUrlUrl.value,
        videoUrl: videoUrlUrl.value,
        ingredients: ingredientsArray,
        cookDate: new Date(cookDate),
      },
    })
    revalidateSection('cooking')

    return NextResponse.json(dish)
  } catch (error) {
    console.error('Error updating dish:', error)
    return NextResponse.json(
      { error: 'Failed to update dish' }, 
      { status: 500 }
    )
  }
}

// DELETE dish
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    await prisma.cooking.delete({
      where: { id: (await params).id },
    })
    revalidateSection('cooking')

    return NextResponse.json({ message: 'Dish deleted successfully' })
  } catch (error) {
    console.error('Error deleting dish:', error)
    return NextResponse.json({ error: 'Failed to delete dish' }, { status: 500 })
  }
}
