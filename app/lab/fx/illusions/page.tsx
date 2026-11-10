import { getLabData, withPosters } from '@/components/lab/kit/data'
import { labImg } from '@/components/lab/kit/img'
import { excerpt } from '@/lib/content'
import LabTag from '@/components/lab/kit/LabTag'
import Lazy from '@/components/lab/fx/illusions/Lazy'

export const metadata = { title: 'Illusions' }
export const revalidate = 3600

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })
const display = { fontFamily: 'var(--font-gilda), Georgia, serif' }
const chip = 'rounded-md border border-[#F6B94F]/50 bg-[#10281F]/95 px-4 py-3 text-[#FFF8EA]'

export default async function Page() {
  const data = await getLabData()
  const dishes = data.dishes.slice(0, 6)
  const movie = withPosters(data.movies)[0]
  const posterSrc = movie ? labImg(movie.posterUrl, 640) : null

  return (
    <main data-ill-root style={{ background: '#10281F', color: '#FFF8EA' }}>
      <style>{`.ill-wrap{height:480vh}@media (prefers-reduced-motion:reduce){.ill-wrap{height:200dvh}}`}</style>
      <LabTag title="Illusions" />
      <div id="ill-wrap" className="ill-wrap relative">
        <div className="sticky top-0 h-[100dvh] w-full overflow-hidden" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, #2f6150 0%, #17352A 55%, #0a1c14 100%)' }}>
          {/* Static poster frame: the word, skewed, until the scene mounts */}
          <div aria-hidden className="absolute inset-0 flex items-center justify-center" style={{ perspective: '900px' }}>
            <div className="bg-[#F1EEE6] px-[6vw] py-[2vw] text-[clamp(3.5rem,14vw,12rem)] leading-none text-[#7C2236] shadow-2xl" style={{ ...display, transform: 'rotateY(-38deg) rotateX(8deg) skewY(4deg)', border: '6px double #7C2236' }}>Dinner</div>
          </div>
          <Lazy dishes={dishes.slice(0, 5).map((d) => ({ name: d.dishName, category: d.category }))} posterSrc={posterSrc} />
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 85% 80% at 50% 50%, transparent 55%, rgba(8,20,14,0.55) 100%)' }} />
          <div data-ill="cap0" className={`${chip} absolute bottom-6 left-4 max-w-[min(26rem,calc(100%-2rem))] md:bottom-10 md:left-10`}>
            <h1 className="text-3xl leading-tight md:text-4xl" style={display}>Dinner is a point of view.</h1>
            <p className="mt-1 text-sm text-[#F1EEE6] md:text-base">Scroll. The pieces only agree from one spot.</p>
          </div>
          <p data-ill="cap1" style={{ opacity: 0, visibility: 'hidden' }} className={`${chip} absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-base md:bottom-10 md:text-lg`}>From here, it reads.</p>
          <p data-ill="cap2" style={{ opacity: 0, visibility: 'hidden' }} className={`${chip} absolute bottom-6 left-4 max-w-[min(24rem,calc(100%-2rem))] text-sm md:bottom-10 md:left-10 md:text-base`}>The cloche stays the same size. The room behind it stretches away.</p>
          <div data-ill="veil" aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: 0, visibility: 'hidden', background: 'radial-gradient(circle at 50% 50%, #FFF8EA 0%, #F6B94F 45%, #7C2236 100%)' }} />
        </div>
      </div>

      <section style={{ background: '#F1EEE6', color: '#10281F' }}>
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-[1.4fr_1fr] md:px-10 md:py-24">
          <div>
            <h2 className="text-4xl md:text-6xl" style={{ ...display, color: '#7C2236' }}>What came out of the kitchen</h2>
            <ul className="mt-8 divide-y divide-[#17352A]/20">
              {dishes.map((d) => (
                <li key={d.id} className="py-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-xl md:text-2xl" style={display}>{d.dishName}</span>
                    <span className="shrink-0 text-sm text-[#5b3a2e]">{fmt(d.cookDate)} · {d.rating} / 5</span>
                  </div>
                  <p className="mt-1 text-sm text-[#2c3d34] md:text-base">{d.category}{d.ingredients.length ? `: ${d.ingredients.slice(0, 5).join(', ')}` : ''}</p>
                  <p className="mt-1 max-w-2xl text-sm text-[#2c3d34]">{excerpt(d.review, 150)}</p>
                </li>
              ))}
            </ul>
          </div>
          {movie && (
            <aside>
              <h2 className="text-3xl md:text-4xl" style={{ ...display, color: '#7C2236' }}>Afterwards, a film</h2>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={labImg(movie.posterUrl, 384) ?? ''} alt={`Poster for ${movie.title}`} width={384} height={576} className="mt-6 w-full max-w-[16rem] rounded-sm shadow-xl" />
              <p className="mt-4 text-xl" style={display}>{movie.title}</p>
              <p className="text-sm text-[#5b3a2e]">{fmt(movie.watchDate)} · {movie.rating} / 5</p>
              <p className="mt-2 text-sm text-[#2c3d34]">{excerpt(movie.review, 200)}</p>
            </aside>
          )}
        </div>
      </section>
    </main>
  )
}
