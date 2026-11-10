import LabTag from '@/components/lab/kit/LabTag'
import { getLabData, withPosters } from '@/components/lab/kit/data'
import { labImg } from '@/components/lab/kit/img'
import Lazy from '@/components/lab/fx/webgl-gallery/Lazy'

export const metadata = { title: 'WebGL gallery' }
export const revalidate = 3600

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })
const big = { fontFamily: 'var(--font-big), Impact, sans-serif' } as const
const gilda = { fontFamily: 'var(--font-gilda), serif' } as const

const CSS = `
.wg-wrap{height:400vh}
@media (max-width:767px){.wg-wrap{height:520vh}.wg-frame-row{display:none!important}}
.wg-grid{display:none}
.wg-wrap[data-ready] .wg-frame{opacity:0}
.wg-frame{transition:opacity .5s}
@media (prefers-reduced-motion: reduce){
  .wg-wrap{height:auto}
  .wg-stage{position:relative!important;height:auto!important;overflow:visible!important}
  .wg-frame{display:none}
  .wg-grid{display:grid}
}
`

export default async function Page() {
  const d = await getLabData()
  const movies = withPosters(d.movies)
  const posters = movies.map((m) => labImg(m.posterUrl, 640)!).filter(Boolean)
  const dishes = d.dishes.map((x) => ({ name: x.dishName, category: x.category, rating: x.rating }))
  return (
    <main className="bg-[#10281F] text-[#F1EEE6]">
      <LabTag title="WebGL gallery" />
      <style>{CSS}</style>
      <div data-wg-wrap className="wg-wrap relative">
        <div className="wg-stage sticky top-0 h-[100dvh] w-full overflow-hidden" style={{ background: 'linear-gradient(180deg,#2B0B14 0%,#4a1322 38%,#17352A 62%,#10281F 100%)' }}>
          {/* static poster frame, faded out once textures are in */}
          <div aria-hidden className="wg-frame wg-frame-row pointer-events-none absolute inset-x-0 top-[11%] z-0 flex h-[38%] gap-[2.2vh] px-[7vw]">
            {posters.slice(0, 8).map((u, i) => <img key={i} src={u} alt="" className="h-full w-auto rounded-[2px] object-cover" style={{ aspectRatio: '2/3', border: '2px solid #D8A84E' }} />)}
          </div>
          <div aria-hidden className="wg-frame wg-frame-row pointer-events-none absolute inset-x-0 top-[51%] z-0 flex h-[38%] gap-[2.2vh] px-[7vw]">
            {dishes.slice(0, 8).map((x, i) => <div key={i} className="h-full shrink-0 bg-[#F1EEE6]" style={{ aspectRatio: '2/3', border: '2px solid #F6B94F', boxShadow: 'inset 0 0 0 6px #F1EEE6, inset 0 0 0 8px #7C2236' }} />)}
          </div>
          <Lazy data={{ posters, dishes }} />
          {/* reduced motion: static grid, no WebGL */}
          <div className="wg-grid mx-auto max-w-6xl grid-cols-2 gap-4 px-6 pb-12 pt-28 sm:grid-cols-4">
            {movies.slice(0, 8).map((m) => <img key={m.id} src={labImg(m.posterUrl, 384) ?? ''} alt={m.title} className="w-full rounded-[2px] object-cover" style={{ aspectRatio: '2/3', border: '2px solid #D8A84E' }} />)}
            {d.dishes.slice(0, 8).map((x) => (
              <div key={x.id} className="flex flex-col justify-between bg-[#F1EEE6] p-4 text-[#17352A]" style={{ aspectRatio: '2/3', border: '2px solid #F6B94F', boxShadow: 'inset 0 0 0 5px #F1EEE6, inset 0 0 0 7px #7C2236' }}>
                <p className="text-sm italic text-[#7C2236]">{x.category}</p>
                <p className="text-xl leading-tight" style={gilda}>{x.dishName}</p>
                <p className="text-sm">{x.rating}/5</p>
              </div>
            ))}
          </div>
          <header className="pointer-events-none absolute inset-x-0 top-0 z-[2] px-6 pt-14 sm:px-[7vw] sm:pt-6">
            <h1 className="text-4xl uppercase leading-none text-[#FFF3D6] sm:text-5xl" style={{ ...big, fontWeight: 900, textShadow: '0 2px 18px rgba(0,0,0,.8)' }}>Films above, plates below</h1>
          </header>
          <p className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] px-6 pb-4 text-sm text-[#FFF8EA] sm:px-[7vw]" style={{ textShadow: '0 1px 12px rgba(0,0,0,.9)' }}>
            Scroll to slide both rows. Hover a card to stir it.
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-5xl px-6 py-24 sm:px-12" aria-labelledby="wg-h">
        <h2 id="wg-h" className="text-4xl text-[#FFF8EA] sm:text-5xl" style={gilda}>On the gallery wall</h2>
        <p className="mt-3 max-w-xl text-[#F1EEE6]/80">Every poster and every menu card above is one of these.</p>
        <div className="mt-12 grid gap-14 md:grid-cols-2">
          <div>
            <h3 className="text-3xl uppercase text-[#D8A84E]" style={{ ...big, fontWeight: 800 }}>Movie nights</h3>
            <ul className="mt-5 space-y-5">
              {d.movies.slice(0, 6).map((m) => (
                <li key={m.id} className="border-t border-[#F1EEE6]/20 pt-4">
                  <p className="text-xl text-[#FFF8EA]" style={gilda}>{m.title}</p>
                  <p className="mt-1 text-sm text-[#F1EEE6]/75">{m.rating}/5 · watched {fmt(m.watchDate)}</p>
                  <p className="mt-2 text-[#F1EEE6]/85">{m.review}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-3xl text-[#F6B94F]" style={gilda}>From the kitchen</h3>
            <ul className="mt-5 space-y-5">
              {d.dishes.slice(0, 6).map((x) => (
                <li key={x.id} className="border-t border-[#F1EEE6]/20 pt-4">
                  <p className="text-xl text-[#FFF8EA]" style={gilda}>{x.dishName}</p>
                  <p className="mt-1 text-sm text-[#F1EEE6]/75">{x.category} · {x.rating}/5 · cooked {fmt(x.cookDate)}</p>
                  <p className="mt-2 text-[#F1EEE6]/85">{x.review}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}
