import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { ArrowLeft, Play } from 'lucide-react'
import { excerpt, getDishBySlug, getDishes } from '@/lib/content'
import { fmtLongDate, fmtRating, paragraphs, tilt } from '@/lib/format'
import { safeHttpUrl, isOptimizable } from '@/lib/url'
import PrintTitle from '@/components/zine/PrintTitle'
import DishCard from '@/components/zine/DishCard'
import Settle from '@/components/zine/Settle'
import { Plate, Rated, Tape } from '@/components/zine/Marks'
import { SectionHead } from '@/components/zine/SectionHead'
import { JsonLd, abs, author, breadcrumbs } from '@/lib/jsonld'

export const revalidate = 3600
export const generateStaticParams = async () => [] as { slug: string }[]

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dish = await getDishBySlug((await params).slug)
  if (!dish) return { title: 'Dish not found', robots: { index: false } }
  const base = `${dish.dishName}, a ${dish.category.toLowerCase()} from Parag's kitchen, rated ${fmtRating(dish.rating)} out of 5`
  const description = dish.review.length >= 70 ? excerpt(dish.review, 155) : dish.review ? excerpt(`${base}: "${dish.review.trim()}"`, 155) : `${base}.`
  return {
    title: dish.dishName,
    description,
    alternates: { canonical: `/cooking/${dish.slug}` },
    openGraph: { type: 'article', url: `/cooking/${dish.slug}`, title: `${dish.dishName}, rated ${fmtRating(dish.rating)}/5` },
  }
}

export default async function DishPage({ params }: Props) {
  const { slug } = await params
  const dish = await getDishBySlug(slug)
  if (!dish) notFound()
  if (slug !== dish.slug) permanentRedirect(`/cooking/${dish.slug}`)

  const all = await getDishes()
  const more = all.filter((d) => d.id !== dish.id).slice(0, 3)
  const variant = Math.max(0, all.findIndex((d) => d.id === dish.id))
  const body = paragraphs(dish.review)
  const video = safeHttpUrl(dish.videoUrl)

  return (
    <article aria-labelledby="dish-title">
      <JsonLd data={{ '@graph': [
        dish.imageUrl && dish.ingredients.length > 0
          ? {
              '@type': 'Recipe',
              name: dish.dishName,
              url: abs(`/cooking/${dish.slug}`),
              image: [dish.imageUrl],
              recipeIngredient: dish.ingredients,
              recipeCategory: dish.category,
              author,
              datePublished: dish.cookDate.slice(0, 10),
              description: dish.review ? excerpt(dish.review, 300) : undefined,
              review: { '@type': 'Review', author, reviewRating: { '@type': 'Rating', ratingValue: dish.rating, bestRating: 5, worstRating: 1 } },
            }
          : {
              '@type': 'Article',
              headline: dish.dishName,
              url: abs(`/cooking/${dish.slug}`),
              mainEntityOfPage: abs(`/cooking/${dish.slug}`),
              articleSection: 'Cooking',
              author,
              datePublished: dish.cookDate.slice(0, 10),
              description: dish.review ? excerpt(dish.review, 300) : undefined,
            },
        breadcrumbs([['Home', '/'], ['Cooking', '/cooking'], [dish.dishName, `/cooking/${dish.slug}`]]),
      ] }} />
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <Link href="/cooking" className="t-label ink-link inline-flex min-h-[44px] items-center gap-2 text-lg">
          <ArrowLeft className="h-5 w-5" aria-hidden="true" /> All the dishes
        </Link>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-12 pt-6 sm:px-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-14">
        <div className="min-w-0">
          <p className="t-label text-xl">{dish.category}</p>
          <PrintTitle id="dish-title" lines={dish.dishName} className="mt-1 text-[clamp(2.5rem,9vw,4.5rem)] [overflow-wrap:anywhere]" />
          <dl className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 border-y-2 border-dashed border-riso-blue py-4">
            <div>
              <dt className="t-label text-base">Cooked</dt>
              <dd className="nums text-lg text-ink"><time dateTime={dish.cookDate}>{fmtLongDate(dish.cookDate)}</time></dd>
            </div>
            <div className="flex items-center gap-3">
              <dt className="t-label text-base">How it went</dt>
              <dd><Rated n={dish.rating} size="lg" /></dd>
            </div>
          </dl>

          <figure className="relative mt-8 md:hidden">
            {dish.imageUrl ? (
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image unoptimized={!isOptimizable(dish.imageUrl)} src={dish.imageUrl} alt={`Photo of ${dish.dishName}`} fill priority sizes="90vw" className="object-cover" />
              </div>
            ) : (
              <Plate variant={variant} className="mx-auto h-auto w-full max-w-xs" />
            )}
          </figure>

          {body.length > 0 ? (
            <div className="prose-zine mt-8">
              {body.map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}
            </div>
          ) : (
            <p className="t-hand mt-8 text-3xl">no notes on this one yet</p>
          )}

          {video && (
            <a href={video} target="_blank" rel="noopener noreferrer" className="btn mt-8">
              <Play className="h-5 w-5" aria-hidden="true" /> Watch it being made
            </a>
          )}
        </div>

        <aside aria-label="Recipe card" className="relative">
          <div className="relative rotate-1 md:sticky md:top-8">
            <Tape className="-top-3 left-8 -rotate-6" />
            <Tape pink className="-top-3 right-8 rotate-6" />
            <div className="cut bg-slip px-5 pb-6 pt-7">
              <figure className="hidden md:block">
                {dish.imageUrl ? (
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image unoptimized={!isOptimizable(dish.imageUrl)} src={dish.imageUrl} alt={`Photo of ${dish.dishName}`} fill sizes="400px" className="object-cover" />
                  </div>
                ) : (
                  <Plate variant={variant} className="h-auto w-full" />
                )}
              </figure>
              <h2 className="t-title mt-4 text-2xl">What went in</h2>
              {dish.ingredients.length > 0 ? (
                <ul className="mt-3 grid gap-1.5 text-ink">
                  {dish.ingredients.map((ing) => (
                    <li key={ing} className="flex items-baseline gap-3 border-b border-dashed border-riso-blue/50 pb-1.5">
                      <span aria-hidden="true" className="inline-block h-2.5 w-2.5 shrink-0 translate-y-[-1px] rounded-full bg-riso-pink" />
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="t-hand mt-2 text-2xl">ingredients still in my head</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {more.length > 0 && (
        <section aria-labelledby="more-dishes" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <SectionHead id="more-dishes" title="Also from the kitchen" href="/cooking" linkLabel="All the dishes" />
          <ul className="grid items-start gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((d, i) => (
              <li key={d.id}>
                <Settle rotate={tilt(i + 2, 0.5)}>
                  <DishCard dish={d} index={i + 1} />
                </Settle>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
