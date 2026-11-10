import { getLabData, withPosters } from '@/components/lab/kit/data'
import { labImg } from '@/components/lab/kit/img'
import LabTag from '@/components/lab/kit/LabTag'
import Lazy from '@/components/lab/fx/tilt-shift/Lazy'
import './ts.css'

export const metadata = { title: 'Tilt-shift street' }
export const revalidate = 3600

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

/** Static first frame (and the no-JS / loading state): a dusk terrace silhouette with warm windows. */
function Still() {
  const colors = ['#C0453A', '#D79B3C', '#A63D3A', '#7FA6C9', '#C9593F', '#E3D3A3']
  return (
    <svg className="ts-static" viewBox="0 0 600 400" preserveAspectRatio="xMidYMax slice" aria-hidden>
      <rect x="0" y="300" width="600" height="100" fill="#454B5E" />
      {colors.map((c, i) => (
        <g key={i}>
          <rect x={i * 100} y={150 + (i % 3) * 8} width="100" height={150 - (i % 3) * 8} fill={c} />
          <polygon points={`${i * 100},${150 + (i % 3) * 8} ${i * 100 + 50},${112 + (i % 3) * 8} ${i * 100 + 100},${150 + (i % 3) * 8}`} fill="#3C4859" />
          {[14, 62].map((dx) => <rect key={dx} x={i * 100 + dx} y={176 + (i % 3) * 8} width="24" height="30" fill={(i + dx) % 3 ? '#F6B94F' : '#27355e'} />)}
          <rect x={i * 100 + 62} y="240" width="22" height="60" fill="#1F8A8A" />
        </g>
      ))}
    </svg>
  )
}

export default async function Page() {
  const data = await getLabData()
  const movies = withPosters(data.movies)
  const film = movies[0] ?? null
  const dish = data.dishes[0] ?? null
  const shelf = movies.slice(0, 6)

  return (
    <main className="ts-root">
      <LabTag title="Tilt-shift street" />
      <div id="ts-wrap" className="ts-wrap">
        <div className="ts-stage">
          <Still />
          <Lazy
            film={film ? { title: film.title, rating: film.rating, posterUrl: labImg(film.posterUrl, 384) } : null}
            dish={dish ? { name: dish.dishName, category: dish.category, rating: dish.rating } : null}
          />
          <div id="ts-intro" className="ts-intro">
            <h1>The evening, at miniature scale.</h1>
            <p>A terrace in Dublin at dusk. Scroll: the lamps come on, the guests arrive, dinner is served and the film starts.</p>
          </div>
        </div>
      </div>

      <section className="ts-content" aria-labelledby="ts-menu-h">
        <div>
          <h2 id="ts-menu-h">Recently on the table</h2>
          <ul className="ts-menu">
            {data.dishes.slice(0, 5).map((d) => (
              <li key={d.id}><b>{d.dishName}</b><span>{d.category} &middot; {fmt(d.cookDate)} &middot; <em>{d.rating} / 5</em></span></li>
            ))}
          </ul>
          <h2>Recently on the screen</h2>
          <ul className="ts-films">
            {shelf.map((m) => (
              <li key={m.id}>
                <img src={labImg(m.posterUrl, 384) as string} alt="" loading="lazy" width={384} height={576} />
                <p className="t">{m.title}</p>
                <p className="m">{fmt(m.watchDate)} &middot; {m.rating} / 5</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
