import Link from 'next/link'
import { getLabData, withPosters } from '@/components/lab/kit/data'
import { labImg } from '@/components/lab/kit/img'
import { excerpt } from '@/lib/content'
import LabTag from '@/components/lab/kit/LabTag'
import Lazy from '@/components/lab/wildcard/ReelLazy'
import '../wc.css'
import './reel.css'

export const metadata = { title: 'The reel' }
export const revalidate = 3600

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

export default async function Page() {
  const { movies } = await getLabData()
  const withP = withPosters(movies)
  const frames = withP.map((m) => ({ title: m.title, posterUrl: labImg(m.posterUrl, 640) as string, rating: m.rating, date: fmt(m.watchDate), excerpt: excerpt(m.review, 150) }))

  return (
    <main className="wc-root wc-reel-root">
      <LabTag title="The reel" />
      <div id="rl-wrap" className="rl-wrap" style={{ ['--n' as string]: Math.max(frames.length, 1) }}>
        <div className="wc-stage rl-stage">
          <div className="wc-static" aria-hidden><i /></div>
          <Lazy frames={frames} />
          <div id="rl-intro" className="wc-intro rl-intro">
            <h1>The reel</h1>
            <p>{movies.length} films on one strip. Scroll to fall into each frame; every poster holds the next.</p>
            <p><Link href="/lab/wildcard">Back up to the street</Link></p>
          </div>
        </div>
      </div>
      <div className="wc-after">
        <section aria-labelledby="rl-l">
          <h2 id="rl-l">Every frame</h2>
          <ol className="rl-list">
            {movies.map((m) => (
              <li key={m.id}>
                {m.posterUrl ? <img src={labImg(m.posterUrl, 256) as string} alt="" loading="lazy" width={256} height={384} /> : <span className="rl-noimg" />}
                <div>
                  <b>{m.title}</b>
                  <span>{m.rating} of 5, watched {fmt(m.watchDate)}</span>
                  <p>{excerpt(m.review, 220)}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="wc-links"><Link href="/lab/wildcard">Back up to the street</Link></p>
        </section>
      </div>
    </main>
  )
}
