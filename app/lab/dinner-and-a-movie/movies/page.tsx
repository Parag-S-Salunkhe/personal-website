import Link from 'next/link'
import LabTag from '@/components/lab/kit/LabTag'
import { getLabData } from '@/components/lab/kit/data'
import { labImg } from '@/components/lab/kit/img'
import Pinned from '@/components/lab/dinner-and-a-movie/Pinned'
import { fmtTime } from '@/components/lab/dinner-and-a-movie/timeline'
import Entries from '@/components/lab/dinner-and-a-movie/Entries'

export const metadata = { title: 'The late programme · Dinner & a movie' }
export const revalidate = 3600

export default async function Page() {
  const d = await getLabData()
  const n = d.movies.length
  const t0 = 19.5, t1 = 24.5
  const bills = d.movies.map((m, i) => ({ movie: m, dish: d.dishes.length ? d.dishes[i % d.dishes.length] : null, t: n > 1 ? t0 + ((t1 - t0) * i) / (n - 1) : t0, poster: labImg(m.posterUrl, 384) }))
  return (
    <main className="min-h-screen text-[#FFF3D6]" style={{ background: 'var(--eve-page)' }}>
      <LabTag title="The late programme" />
      <Pinned mode="inner" />
      <header className="px-6 pb-10 pt-24 sm:px-16 sm:pt-28">
        <h1 className="dm-serif text-[3rem] leading-[1] sm:text-[6rem]">The late programme</h1>
        <p className="mt-4 max-w-xl text-lg text-[#FFF3D6]/85">Tonight&rsquo;s double bills: a dish from the table, then a film for the wall. {n} films, each with its supper, in the order the night goes. The clock in the corner follows your scroll.</p>
        <Link href="/lab/dinner-and-a-movie" className="mt-5 inline-block text-[#F6B94F] underline underline-offset-4">Back to the evening</Link>
      </header>
      <Entries bills={bills.map((b) => ({ id: b.movie.id, t: b.t, time: fmtTime(b.t), title: b.movie.title, slug: b.movie.slug, rating: b.movie.rating, date: b.movie.watchDate, review: b.movie.review, poster: b.poster, dish: b.dish ? { name: b.dish.dishName, slug: b.dish.slug, category: b.dish.category, rating: b.dish.rating } : null }))} />
      <footer className="px-6 py-24 text-center sm:px-16">
        <p className="dm-serif text-4xl sm:text-5xl"><i>1 am.</i> Mind the step.</p>
        <Link href="/#guest-note" className="mt-6 inline-block rounded-full bg-[#7C2236] px-6 py-3 text-lg hover:bg-[#9a2c44]">Leave a note by the door</Link>
      </footer>
    </main>
  )
}
