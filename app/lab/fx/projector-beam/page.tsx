import { getLabData, withPosters } from '@/components/lab/kit/data'
import { labImg } from '@/components/lab/kit/img'
import LabTag from '@/components/lab/kit/LabTag'
import Lazy from '@/components/lab/fx/projector-beam/Lazy'
import './pb.css'

export const metadata = { title: 'Projector beam' }
export const revalidate = 3600

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

export default async function Page() {
  const { movies } = await getLabData()
  const posters = withPosters(movies)
  const films = posters.slice(0, 5).map((m) => ({ id: m.id, title: m.title, rating: m.rating, watchDate: m.watchDate, posterUrl: labImg(m.posterUrl, 640) as string }))
  const first = films[0]

  return (
    <main className="pb-root">
      <LabTag title="Projector beam" />
      <div id="pb-wrap" className="pb-wrap">
        <div className="pb-stage">
          {/* static poster frame: what you see before the scene mounts */}
          <div className="pb-static" aria-hidden>
            <div className="pb-static-beam" />
            {first && <img src={first.posterUrl} alt="" className="pb-static-poster" />}
          </div>
          <Lazy films={films} />
          <div id="pb-intro" className="pb-intro">
            <h1>Projector beam</h1>
            <p>Lights down. Follow the light to the screen.</p>
          </div>
          <p id="pb-hint" className="pb-hint">Scroll to walk down the beam</p>
        </div>
      </div>

      <section className="pb-list" aria-labelledby="pb-now">
        <h2 id="pb-now">Now showing</h2>
        <ol>
          {movies.map((m) => (
            <li key={m.id}>
              {m.posterUrl ? <img src={labImg(m.posterUrl, 256) as string} alt="" loading="lazy" width={64} height={96} /> : <span className="pb-nothumb" />}
              <div>
                <p className="pb-li-title">{m.title}</p>
                <p className="pb-li-meta">Rated {m.rating} of 5 &middot; watched {fmtDate(m.watchDate)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}
