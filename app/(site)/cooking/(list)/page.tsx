import type { Metadata } from 'next'
import { getDishes } from '@/lib/content'
import PrintTitle from '@/components/zine/PrintTitle'
import CookingContent from './CookingContent'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Cooking',
  description: 'What came out of the kitchen for supper club and Sunday lunch: the dish, what went into it, a score out of five and how it went.',
  alternates: { canonical: '/cooking' },
  openGraph: { url: '/cooking' },
}

export default async function CookingPage() {
  const dishes = await getDishes()
  return (
    <section aria-labelledby="cooking-title" className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 lg:pt-14">
      <div className="mb-8">
        <PrintTitle id="cooking-title" lines="Cooking" className="text-[clamp(3rem,13vw,6rem)]" />
        <p className="t-hand mt-2 -rotate-1 text-3xl sm:text-4xl">clippings from the kitchen, grease spots and all</p>
      </div>
      <CookingContent dishes={dishes} />
    </section>
  )
}
