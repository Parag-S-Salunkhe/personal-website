import { statSync } from 'node:fs'
import path from 'node:path'
import { getLabData, withPosters } from '@/components/lab/kit/data'
import { labImg } from '@/components/lab/kit/img'
import LabTag from '@/components/lab/kit/LabTag'
import Lazy from '@/components/lab/fx/blender-hero/Lazy'
import './bh.css'

export const metadata = { title: 'Blender hero' }
export const revalidate = 3600

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

function glbKb() {
  try { return Math.round(statSync(path.join(process.cwd(), 'public/lab-models/projector.glb')).size / 1024) } catch { return 370 }
}

export default async function Page() {
  const { movies } = await getLabData()
  const films = withPosters(movies).slice(0, 5).map((m) => ({ id: m.id, title: m.title, rating: m.rating, watchDate: m.watchDate, posterUrl: labImg(m.posterUrl, 640) as string }))

  return (
    <main className="bh-root">
      <LabTag title="Blender hero" />
      <div id="bh-wrap" className="bh-wrap">
        <div className="bh-stage">
          <div className="bh-static" aria-hidden><i /></div>
          <Lazy films={films} />
          <div id="bh-intro" className="bh-intro">
            <h1>Blender hero</h1>
            <p>A vintage projector, built in Blender and lit in the browser. Scroll to take it apart.</p>
          </div>
          <p id="bh-hint" className="bh-hint">Scroll</p>
        </div>
      </div>

      <section className="bh-notes" aria-labelledby="bh-how">
        <h2 id="bh-how">Modelled in Blender, lit in the browser</h2>
        <ul>
          <li>Built by a Python script in headless Blender: 31 named parts, enamel, brass and chrome as plain PBR materials.</li>
          <li>Exported as one glTF file of {glbKb()} KB, no compression needed.</li>
          <li>About 4,000 triangles. The lights, shadow, bloom and beam are all made in the page.</li>
        </ul>
      </section>

      <section className="bh-list" aria-labelledby="bh-now">
        <h2 id="bh-now">Now showing</h2>
        <ol>
          {movies.map((m) => (
            <li key={m.id}>
              {m.posterUrl ? <img src={labImg(m.posterUrl, 256) as string} alt="" loading="lazy" width={64} height={96} /> : <span className="bh-nothumb" />}
              <div>
                <p className="bh-li-title">{m.title}</p>
                <p className="bh-li-meta">Rated {m.rating} of 5 &middot; watched {fmtDate(m.watchDate)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}
