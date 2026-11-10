import Image from 'next/image'
import Link from 'next/link'
import type { Dish } from '@/lib/content'
import { fmtDate } from '@/lib/format'
import { Plate, Rated } from './Marks'
import { isOptimizable } from '@/lib/url'

// A recipe clipping: dashed cut edge, photo or a hand-drawn plate, ingredients as a real list.
export default function DishCard({ dish, index = 0, headingLevel = 'h3' }: { dish: Dish; index?: number; headingLevel?: 'h2' | 'h3' }) {
  const H = headingLevel
  const shown = dish.ingredients.slice(0, 5)
  return (
    <article className="cut group relative h-full bg-slip px-4 pb-5 pt-5 transition-transform duration-300 ease-zine hover:-translate-y-1">
      {dish.imageUrl ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image unoptimized={!isOptimizable(dish.imageUrl)} src={dish.imageUrl} alt={`Photo of ${dish.dishName}`} fill sizes="(min-width: 1024px) 270px, (min-width: 640px) 46vw, 78vw" className="object-cover" />
        </div>
      ) : (
        <Plate variant={index} className="aspect-[16/9] h-auto w-full" />
      )}
      <div className="mt-3 flex items-start justify-between gap-2">
        <H className="t-title text-2xl [overflow-wrap:anywhere]">
          <Link href={`/cooking/${dish.slug}`} className="after:absolute after:inset-0 after:content-[''] group-hover:underline group-hover:decoration-riso-pink group-hover:decoration-[3px] group-hover:underline-offset-4">
            {dish.dishName}
          </Link>
        </H>
        <Rated n={dish.rating} />
      </div>
      <p className="t-label nums text-lg">{dish.category}, cooked {fmtDate(dish.cookDate)}</p>
      {shown.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1 text-sm text-ink" aria-label="Ingredients">
          {shown.map((ing) => (
            <li key={ing} className="border border-riso-blue px-2 py-0.5">{ing}</li>
          ))}
          {dish.ingredients.length > shown.length && <li className="px-1 py-0.5">and {dish.ingredients.length - shown.length} more</li>}
        </ul>
      )}
      {dish.review && <p className="mt-3 line-clamp-3 text-base text-ink">{dish.review}</p>}
    </article>
  )
}
