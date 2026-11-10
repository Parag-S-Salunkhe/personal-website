import { getDishBySlug } from '@/lib/content'
import { fmtDate } from '@/lib/format'
import { ogContentType, ogSize, zineImage } from '@/lib/og'

export const alt = 'A dish from Parag\'s kitchen, with his score'
export const size = ogSize
export const contentType = ogContentType

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const dish = await getDishBySlug((await params).slug)
  if (!dish) return zineImage({ kicker: 'Cooking', title: 'From the kitchen' })
  return zineImage({ kicker: `${dish.category}, cooked ${fmtDate(dish.cookDate)}`, title: dish.dishName, rating: dish.rating })
}
