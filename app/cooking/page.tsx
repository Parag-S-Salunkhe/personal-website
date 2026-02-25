import { prisma } from '@/lib/prisma'
import CookingContent from './CookingContent'

export default async function CookingPage() {
  const dishes = await prisma.cooking.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      dishName: true,
      category: true,
      rating: true,
      review: true,
      imageUrl: true,
      ingredients: true,
      cookDate: true,
    },
  })

  const serialized = dishes.map(dish => ({
    ...dish,
    cookDate: dish.cookDate.toISOString(),
  }))

  return <CookingContent dishes={serialized} />
}
