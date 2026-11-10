import LabTag from '@/components/lab/kit/LabTag'
import { getLabData, withPosters } from '@/components/lab/kit/data'
import { labImg } from '@/components/lab/kit/img'
import type { BookData } from '@/components/lab/fx/popup-book/art'
import Lazy from '@/components/lab/fx/popup-book/Lazy'

export const metadata = { title: 'Pop-up book' }
export const revalidate = 3600

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })

export default async function Page() {
  const d = await getLabData()
  const movies = withPosters(d.movies)
  const lead = movies[0] ?? d.movies[0]
  const data: BookData = {
    poster: lead ? labImg(lead.posterUrl, 640) : null,
    movies: d.movies.slice(0, 6).map((m) => ({ title: m.title, rating: m.rating, date: m.watchDate })),
    dishes: d.dishes.slice(0, 3).map((x) => ({ name: x.dishName, category: x.category, rating: x.rating, ingredients: x.ingredients })),
    dishCount: d.dishes.length,
  }
  return (
    <main className="bg-[#0a1410] text-[#F1EEE6]">
      <LabTag title="Pop-up book" />
      <style>{`@media (prefers-reduced-motion: reduce){[data-story]{height:auto!important}}`}</style>
      <div data-story className="relative" style={{ height: '460vh' }}>
        <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
          {/* static poster frame, replaced by the scene once it paints */}
          <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(60% 40% at 50% 58%, rgba(246,185,79,.25), rgba(246,185,79,0) 70%), radial-gradient(90% 70% at 50% 60%, #1d4538 0%, #17352A 45%, #0a1410 100%)' }}>
            <div className="absolute left-1/2 top-[58%] h-[34vmin] w-[44vmin] -translate-x-1/2 -translate-y-1/2 rounded-[6px] bg-[#7C2236]" style={{ boxShadow: '0 30px 50px rgba(0,0,0,.5), inset 0 0 0 6px #6b1b2e, inset 0 0 0 9px #F6B94F' }} />
          </div>
          <Lazy data={data} />
          <header data-hero className="pointer-events-none absolute inset-x-0 top-0 z-10 px-6 pt-16 sm:px-12 sm:pt-20" style={{ opacity: 'var(--hero, 1)' }}>
            <h1 className="max-w-[16ch] text-5xl leading-[1.02] text-[#FFF8EA] sm:text-7xl" style={{ fontFamily: 'var(--font-gilda), serif', textShadow: '0 2px 24px rgba(0,0,0,.7)' }}>The dinner party, in paper</h1>
          </header>
        </div>
      </div>

      <section className="relative mx-auto max-w-5xl px-6 py-24 sm:px-12" aria-labelledby="pb-h">
        <h2 id="pb-h" className="text-4xl text-[#FFF8EA] sm:text-5xl" style={{ fontFamily: 'var(--font-gilda), serif' }}>What is in the book</h2>
        <p className="mt-3 max-w-xl text-[#F1EEE6]/80">The film on the little screen and the names on the paper tabs come from the real lists below.</p>
        <div className="mt-12 grid gap-16 md:grid-cols-2">
          <div>
            <h3 className="text-3xl text-[#F6B94F]" style={{ fontFamily: 'var(--font-pinyon), cursive' }}>Movie night</h3>
            <ul className="mt-5 space-y-5">
              {d.movies.slice(0, 5).map((m) => (
                <li key={m.id} className="flex gap-4 border-t border-[#F1EEE6]/20 pt-4">
                  {m.posterUrl && <img src={labImg(m.posterUrl, 256) ?? ''} alt="" width={56} height={84} className="h-[84px] w-14 rounded-[2px] object-cover" loading="lazy" />}
                  <div>
                    <p className="text-xl text-[#FFF8EA]" style={{ fontFamily: 'var(--font-gilda), serif' }}>{m.title}</p>
                    <p className="mt-1 text-sm text-[#F1EEE6]/75">{m.rating}/5 · watched {fmt(m.watchDate)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-3xl text-[#F6B94F]" style={{ fontFamily: 'var(--font-pinyon), cursive' }}>The kitchen</h3>
            <ul className="mt-5 space-y-5">
              {d.dishes.slice(0, 5).map((x) => (
                <li key={x.id} className="border-t border-[#F1EEE6]/20 pt-4">
                  <p className="text-xl text-[#FFF8EA]" style={{ fontFamily: 'var(--font-gilda), serif' }}>{x.dishName}</p>
                  <p className="mt-1 text-sm text-[#F1EEE6]/75">{x.category} · {x.rating}/5 · cooked {fmt(x.cookDate)}</p>
                  {x.ingredients.length > 0 && <p className="mt-1 text-sm text-[#A9C3AE]">{x.ingredients.slice(0, 6).join(', ')}</p>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}
