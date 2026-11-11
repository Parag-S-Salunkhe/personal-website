import type { Metadata } from 'next'
import { getDishes } from '@/lib/content'
import { fmtLongDate } from '@/lib/format'
import CookingContent from './CookingContent'
import PopupBook from '@/components/site/cooking/Lazy'
import BookPoster from '@/components/site/cooking/BookPoster'
import type { BookData } from '@/components/site/cooking/art'
import { JsonLd, collection } from '@/lib/jsonld'
import { ogBase } from '@/lib/site'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Cooking',
  description: 'What came out of the kitchen for supper club and Sunday lunch: the dish, what went into it, a score out of five and how it went.',
  alternates: { canonical: '/cooking' },
  openGraph: { ...ogBase, url: '/cooking' },
}

// Tall scroll runway for the pop-up book: more dishes, more pages to turn.
const RUNWAY = ['', 'h-[200vh] lg:h-[220vh]', 'h-[220vh] lg:h-[260vh]', 'h-[220vh] lg:h-[300vh]']

export default async function CookingPage() {
  const dishes = await getDishes()
  const latest = dishes.slice(0, 3)
  const book: BookData = {
    dishCount: dishes.length,
    dishes: latest.map((d) => ({ name: d.dishName, slug: d.slug, category: d.category, rating: d.rating, date: fmtLongDate(d.cookDate), ingredients: d.ingredients })),
  }
  const intro = (
    <>
      <h1 id="cooking-title" className="ev-display text-[var(--wax)]">Cooking</h1>
      <p className="mt-2 max-w-[56ch] text-lg text-[var(--sage)]">What came out of the kitchen for supper club and Sunday lunch.</p>
    </>
  )
  return (
    <>
      <JsonLd data={collection('Cooking', '/cooking', metadata.description as string, dishes.map((d) => ({ name: d.dishName, path: `/cooking/${d.slug}` })))} />
      <section aria-labelledby="cooking-title">
        {latest.length > 0 ? (
          <div data-story className={`relative ${RUNWAY[latest.length]} motion-reduce:!h-auto`}>
            <div className="sticky top-0 flex h-[100dvh] flex-col overflow-hidden bg-[var(--cloth-deep)] pt-[7.25rem] md:pt-[4.5rem] motion-reduce:relative motion-reduce:h-[min(48rem,90dvh)]">
              <div className="mx-auto w-full max-w-6xl shrink-0 px-4 pb-3 pt-4 sm:px-6">{intro}</div>
              <div className="relative min-h-0 flex-1">
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-16 bg-gradient-to-b from-[var(--cloth-deep)] to-transparent" />
                <BookPoster />
                <PopupBook data={book} />
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">{intro}</div>
        )}
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6">
          <CookingContent dishes={dishes} />
        </div>
      </section>
    </>
  )
}
