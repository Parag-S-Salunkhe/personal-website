import { getLabData } from '@/components/lab/kit/data'
import { labImg } from '@/components/lab/kit/img'
import LabTag from '@/components/lab/kit/LabTag'
import Lazy from '@/components/lab/fx/particle-name/Lazy'
import './pn.css'

export const metadata = { title: 'Popcorn name' }
export const revalidate = 3600

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

export default async function Page() {
  const { movies } = await getLabData()
  return (
    <main className="pn-root">
      <LabTag title="Popcorn name" />
      <div id="pn-wrap" className="pn-wrap">
        <div id="pn-stage" className="pn-stage">
          {/* static poster frame, fades once the popcorn scene is up */}
          <div className="pn-poster"><h1>Parag</h1></div>
          <Lazy />
          <p id="pn-hint" className="pn-hint">Scroll to scatter the popcorn</p>
        </div>
      </div>

      <section className="pn-list" aria-labelledby="pn-latest">
        <h2 id="pn-latest">Latest movies</h2>
        <ol>
          {movies.slice(0, 10).map((m) => (
            <li key={m.id}>
              {m.posterUrl ? <img src={labImg(m.posterUrl, 256) as string} alt="" loading="lazy" width={64} height={96} /> : <span className="pn-nothumb" />}
              <div>
                <p className="pn-li-title">{m.title}</p>
                <p className="pn-li-meta">Rated {m.rating} of 5 &middot; watched {fmtDate(m.watchDate)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}
