import { getLabData, withPosters } from '@/components/lab/kit/data'
import { labImg } from '@/components/lab/kit/img'
import { excerpt } from '@/lib/content'
import LabTag from '@/components/lab/kit/LabTag'
import Shelf from '@/components/lab/fx/poster-to-page/Shelf'

export const metadata = { title: 'Poster to page' }
export const revalidate = 3600

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })

export default async function Page() {
  const data = await getLabData()
  const movies = withPosters(data.movies).slice(0, 12)
  const shelf = movies.map((m) => ({ id: m.id, title: m.title, rating: m.rating, watchDate: m.watchDate, excerpt: excerpt(m.review, 220), src: labImg(m.posterUrl, 640) ?? '', thumb: labImg(m.posterUrl, 256) ?? '' }))

  return (
    <main style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 0%, #6B1A2B 0%, #2B0B14 70%)', color: '#FFF3D6', minHeight: '100dvh' }}>
      <LabTag title="Poster to page" />
      <header className="mx-auto max-w-6xl px-4 pb-8 pt-16 md:px-10 md:pt-20">
        <h1 className="text-[clamp(2.8rem,8vw,6.5rem)] font-black leading-[0.9]" style={{ fontFamily: 'var(--font-display), Impact, sans-serif' }}>Pick a poster.</h1>
        <p className="mt-3 max-w-xl text-base opacity-85 md:text-lg">The one you choose lifts off the shelf, grows into its own page and floods the room with its colour.</p>
      </header>
      <Shelf movies={shelf} />
      <section className="mx-auto max-w-4xl px-4 pb-28 pt-8 md:px-10">
        <h2 className="text-4xl font-black md:text-5xl" style={{ fontFamily: 'var(--font-display), Impact, sans-serif' }}>The watch log</h2>
        <ul className="mt-6 divide-y divide-[#D8A84E]/30">
          {movies.map((m) => (
            <li key={m.id} className="flex items-baseline justify-between gap-4 py-3">
              <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-display), Impact, sans-serif' }}>{m.title}</span>
              <span className="shrink-0 text-sm opacity-85">{fmt(m.watchDate)} · <span style={{ color: '#D8A84E' }}>{m.rating} / 5</span></span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
