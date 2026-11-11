// A recipe card on linen: photo or a drawn plate, the dish as the heading link, course, flames, date, first ingredients.
import Image from 'next/image'
import Link from 'next/link'
import type { Dish } from '@/lib/content'
import { fmtDate } from '@/lib/format'
import { isOptimizable } from '@/lib/url'
import Plate from '@/components/site/Plate'
import Rating from '@/components/site/Rating'

export default function DishCard({ dish, headingLevel = 'h2', sizes = '(min-width:1024px) 360px, (min-width:640px) 45vw, 90vw' }: { dish: Dish; headingLevel?: 'h2' | 'h3'; sizes?: string }) {
  const H = headingLevel
  return (
    <article className="ev-card ev-on-linen group relative flex h-full flex-col px-4 pb-8 pt-4 transition-[transform,box-shadow] duration-300 ease-[var(--ease-ev)] hover:-translate-y-1 active:translate-y-0 has-[:focus-visible]:shadow-[0_0_0_3px_var(--candle),0_18px_40px_rgb(0_0_0/0.45)]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[3px] bg-[rgb(23_53_42/0.06)]">
        {dish.imageUrl ? (
          <Image unoptimized={!isOptimizable(dish.imageUrl)} src={dish.imageUrl} alt={`Photo of ${dish.dishName}`} fill sizes={sizes} className="object-cover transition-transform duration-500 ease-[var(--ease-ev)] group-hover:scale-[1.03]" />
        ) : (
          <Plate name={dish.dishName} className="mx-auto h-full w-auto p-2" />
        )}
      </div>
      <div className="mt-4 flex flex-1 flex-col px-2">
        <p className="ev-label text-[var(--claret)]">{dish.category}</p>
        <H className="ev-title mt-1 [overflow-wrap:anywhere]">
          <Link href={`/cooking/${dish.slug}`} className="rounded-[3px] after:absolute after:inset-0 after:content-[''] hover:underline hover:decoration-[var(--claret)] hover:underline-offset-4 focus-visible:outline-offset-2">{dish.dishName}</Link>
        </H>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <Rating n={dish.rating} size="sm" className="text-[var(--cloth)]" />
          <time dateTime={dish.cookDate} className="ev-meta ev-soft">{fmtDate(dish.cookDate)}</time>
        </div>
        {dish.ingredients.length > 0 && (
          <ul className="ev-meta ev-soft mt-3 grid gap-1" aria-label="First ingredients">
            {dish.ingredients.slice(0, 5).map((ing) => (
              <li key={ing} className="flex items-baseline gap-2">
                <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 translate-y-[-1px] rounded-full bg-[var(--brass)]" />
                <span className="min-w-0 truncate">{ing}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}
