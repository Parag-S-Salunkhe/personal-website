import { getLabData, withPosters } from '@/components/lab/kit/data'
import { labImg } from '@/components/lab/kit/img'
import LabTag from '@/components/lab/kit/LabTag'
import Scene from '@/components/lab/fx/spotlight-wall/Scene'

export const metadata = { title: 'Spotlight wall' }
export const revalidate = 3600

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })

export default async function Page() {
  const data = await getLabData()
  const movies = withPosters(data.movies)
  const items = movies.map((m) => ({ id: m.id, title: m.title, rating: m.rating, src: labImg(m.posterUrl, 384) ?? '' }))

  return (
    <main style={{ background: '#2B0B14', color: '#FFF3D6' }}>
      <LabTag title="Spotlight wall" />
      <Scene items={items}>
        <div className="sw-intro pointer-events-none absolute inset-x-0 bottom-0 z-10 px-6 pb-[5dvh] pt-24 md:px-12" style={{ background: 'linear-gradient(to top, rgba(8,2,5,.85) 25%, rgba(8,2,5,0))' }}>
          <h1 className="max-w-[16ch] text-[clamp(2.6rem,7vw,6rem)] font-black leading-[0.9] tracking-tight" style={{ fontFamily: 'var(--font-display), Impact, sans-serif', textShadow: '0 2px 18px #080205' }}>
            Find the film in the dark.
          </h1>
          <p data-hint className="mt-3 text-base md:text-lg" style={{ color: '#FFF3D6', textShadow: '0 1px 10px #080205' }}>Move the torch across the wall. Scroll and the house lights come up.</p>
        </div>
      </Scene>

      <section className="mx-auto max-w-4xl px-6 py-24">
        <h2 className="text-5xl font-black md:text-6xl" style={{ fontFamily: 'var(--font-display), Impact, sans-serif' }}>On the wall tonight</h2>
        <p className="mt-3 max-w-xl text-lg opacity-85">Everything the torch found, with the lights on.</p>
        <ul className="mt-10 divide-y divide-[#D8A84E]/30">
          {data.movies.slice(0, 8).map((m) => (
            <li key={m.id} className="flex items-baseline justify-between gap-5 py-4">
              <div className="min-w-0">
                <h3 className="text-2xl font-extrabold leading-tight" style={{ fontFamily: 'var(--font-display), Impact, sans-serif' }}>{m.title}</h3>
                <p className="text-sm opacity-80">Watched {fmt(m.watchDate)}</p>
              </div>
              <p className="shrink-0 text-lg" style={{ color: '#D8A84E' }}>{m.rating} / 5</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
