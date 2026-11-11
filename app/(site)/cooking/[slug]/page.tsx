import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound, permanentRedirect } from 'next/navigation'
import { Play } from 'lucide-react'
import { excerpt, getDishBySlug, getDishes } from '@/lib/content'
import { fmtLongDate, fmtRating, paragraphs } from '@/lib/format'
import { safeHttpUrl, isOptimizable } from '@/lib/url'
import Plate from '@/components/site/Plate'
import Rating from '@/components/site/Rating'
import Prose from '@/components/site/Prose'
import BackLink from '@/components/site/BackLink'
import { SectionHead } from '@/components/site/SectionHead'
import DishCard from '@/components/site/cooking/DishCard'
import TurnIn from '@/components/site/cooking/TurnIn'
import { JsonLd, abs, author, breadcrumbs } from '@/lib/jsonld'
import { ogBase } from '@/lib/site'

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
    openGraph: { ...ogBase, type: 'article', url: `/cooking/${dish.slug}`, title: `${dish.dishName}, rated ${fmtRating(dish.rating)}/5` },
  }
}

export default async function DishPage({ params }: Props) {
  const { slug } = await params
  const dish = await getDishBySlug(slug)
  if (!dish) notFound()
  if (slug !== dish.slug) permanentRedirect(`/cooking/${dish.slug}`)

  const all = await getDishes()
  const more = all.filter((d) => d.id !== dish.id).slice(0, 3)
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
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <BackLink href="/cooking">All the dishes</BackLink>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-4 sm:px-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-14">
        <div className="min-w-0">
          <figure className="mb-8 md:hidden">
            <TurnIn kind={dish.imageUrl ? 'photo' : 'plate'}>
              {dish.imageUrl ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-[3px]">
                  <Image unoptimized={!isOptimizable(dish.imageUrl)} src={dish.imageUrl} alt={`Photo of ${dish.dishName}`} fill sizes="90vw" priority className="object-cover" />
                </div>
              ) : (
                <Plate name={dish.dishName} className="mx-auto h-auto w-full max-w-[18rem]" />
              )}
            </TurnIn>
          </figure>

          <p className="ev-label text-[var(--candle)]">{dish.category}</p>
          <h1 id="dish-title" className="ev-h1 mt-1 text-[var(--wax)] [overflow-wrap:anywhere]">{dish.dishName}</h1>
          <dl className="mt-6 flex flex-wrap items-center gap-x-10 gap-y-4 border-y border-[rgb(184_138_68/0.4)] py-4">
            <div>
              <dt className="ev-label text-[var(--sage)]">Cooked</dt>
              <dd className="ev-meta mt-0.5 text-base text-[var(--wax)]"><time dateTime={dish.cookDate}>{fmtLongDate(dish.cookDate)}</time></dd>
            </div>
            <div>
              <dt className="ev-label text-[var(--sage)]">How it went</dt>
              <dd className="mt-0.5 text-[var(--wax)]"><Rating n={dish.rating} size="lg" /></dd>
            </div>
          </dl>

          <Prose paragraphs={body} empty="No notes on this one yet." className="mt-8" />

          {video && (
            <a href={video} target="_blank" rel="noopener noreferrer" className="ev-btn mt-8 inline-flex items-center gap-2">
              <Play className="h-5 w-5" aria-hidden="true" /> Watch it being made
            </a>
          )}
        </div>

        <aside aria-label="Recipe card" className="relative">
          <div className="ev-card ev-on-linen px-6 pb-8 pt-6 md:sticky md:top-24">
            <figure className="hidden md:block">
              <TurnIn kind={dish.imageUrl ? 'photo' : 'plate'}>
                {dish.imageUrl ? (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[3px]">
                    <Image unoptimized={!isOptimizable(dish.imageUrl)} src={dish.imageUrl} alt={`Photo of ${dish.dishName}`} fill sizes="400px" className="object-cover" />
                  </div>
                ) : (
                  <Plate name={dish.dishName} className="mx-auto h-auto w-full max-w-[16rem]" />
                )}
              </TurnIn>
            </figure>
            <h2 className="ev-title mt-4">What went in</h2>
            {dish.ingredients.length > 0 ? (
              <ul className="mt-3 grid gap-2">
                {dish.ingredients.map((ing) => (
                  <li key={ing} className="flex items-baseline gap-3 border-b border-[rgb(184_138_68/0.45)] pb-2">
                    <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 translate-y-[-2px] rounded-full bg-[var(--brass)]" />
                    <span className="min-w-0 [overflow-wrap:anywhere]">{ing}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="ev-soft mt-2 italic">Ingredients still in my head.</p>
            )}
          </div>
        </aside>
      </div>

      {more.length > 0 && (
        <section aria-labelledby="more-dishes" className="bg-[var(--cloth-deep)]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <SectionHead id="more-dishes" title="Also from the kitchen" href="/cooking" linkLabel="All the dishes" />
            <ul className="grid items-stretch gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((d) => (
                <li key={d.id}><DishCard dish={d} headingLevel="h3" /></li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  )
}
