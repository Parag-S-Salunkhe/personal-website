import Link from 'next/link'
import { getLabData, withPosters } from '@/components/lab/kit/data'
import { labImg } from '@/components/lab/kit/img'
import LabTag from '@/components/lab/kit/LabTag'
import Street from '@/components/lab/late-show/Street'
import Curtain from '@/components/lab/late-show/Curtain'
import BeamLazy from '@/components/lab/late-show/beam/Lazy'
import Intermission from '@/components/lab/late-show/Intermission'
import HouseLights from '@/components/lab/late-show/HouseLights'
import Wall from '@/components/lab/late-show/Wall'

export const metadata = { title: 'Late Show' }
export const revalidate = 3600

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

export default async function Page() {
  const { movies, dishes, posts, notes, guestNotes } = await getLabData()
  const withP = withPosters(movies)
  const latest = movies[0]
  const tonight = latest?.title ?? 'A mystery feature'
  const rows = movies.slice(0, 3).map((m) => ({ title: m.title, rating: m.rating, date: m.watchDate }))
  const films = withP.slice(0, 8).map((m) => ({ id: m.id, title: m.title, rating: m.rating, watchDate: m.watchDate, posterUrl: labImg(m.posterUrl, 640)! }))
  const first = films[0]

  return (
    <main>
      <LabTag title="Late Show" />
      <Street tonight={tonight} rows={rows} />
      <Curtain film={{ title: films[0]?.title ?? tonight, src: films[0] ? labImg(withP[0].posterUrl, 640) : null }} />

      <section id="ls-feature" className="ls-feature" aria-label="The feature">
        <div id="ls-stage" className="ls-stage">
          <div id="ls-static" className="ls-static" aria-hidden>
            <div className="ls-static-beam" />
            {first && /* eslint-disable-next-line @next/next/no-img-element */ <img className="ls-static-poster" src={first.posterUrl} alt="" />}
          </div>
          <p className="ls-feature-label">The feature</p>
          {films.length > 0 && <BeamLazy films={films} />}
        </div>
      </section>

      <Intermission dishes={dishes.map((d) => ({ slug: d.slug, name: d.dishName, category: d.category, rating: d.rating }))} />

      <HouseLights>
        <div className="ls-house-inner">
          <div>
            <h2 className="ls-h2">Programme notes</h2>
            <p className="ls-lede">Things written down between reels.</p>
            <div className="ls-programme">
              {posts.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`} className="ls-leaflet">
                  <span className="ls-leaflet-date">{fmt(p.publishDate)}</span>
                  <h3 className="ls-leaflet-title">{p.title}</h3>
                  <p>{p.excerpt.replace(/#+\s*/g, "")}</p>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h2 className="ls-h2">Torn tickets</h2>
            <p className="ls-lede">Short notes, stubs kept from the evening.</p>
            <div className="ls-tickets">
              {notes.map((n) => (
                <Link key={n.id} href={`/notes/${n.slug}`} className="ls-ticket">
                  <span className="ls-ticket-cat">{n.category ?? 'Note'} &middot; {fmt(n.createdAt)}</span>
                  <h3 className="ls-ticket-title">{n.title}</h3>
                  <p>{n.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h2 className="ls-h2">Visitors&rsquo; book</h2>
            <div className="ls-book">
              <div>
                {guestNotes.slice(0, 2).map((g) => <blockquote key={g.id}>{g.message}</blockquote>)}
                {guestNotes.length === 0 && <p>The book is open on the front desk.</p>}
              </div>
              <a className="ls-book-cta" href="/#guest-note">Sign the book</a>
            </div>
          </div>
        </div>
      </HouseLights>

      <section id="wall" className="ls-wallsec" aria-label="Now showing">
        <div className="ls-wallsec-inner">
          <h2 className="ls-h2">Now showing</h2>
          <p className="ls-lede">Every film from the screen, in one lobby. Pick a poster to step inside.</p>
          <Wall>
            <div className="ls-wall">
              {movies.map((m) => (
                <Link key={m.id} href={`/lab/late-show/film/${m.id}`} data-film={m.id} className="ls-poster">
                  {m.posterUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={labImg(m.posterUrl, 384)!} alt={`${m.title} poster`} loading="lazy" />
                    : <span className="ls-poster-none">{m.title}</span>}
                  <span className="ls-poster-cap">{m.title} <span className="ls-poster-rate">{m.rating.toFixed(1)} / 5</span></span>
                </Link>
              ))}
            </div>
          </Wall>
          <ul className="ls-list">
            {movies.map((m) => (
              <li key={m.id}>
                <Link href={`/lab/late-show/film/${m.id}`}>
                  <span className="ls-li-t">{m.title}</span>
                  <span className="ls-li-r">{m.rating.toFixed(1)} / 5</span>
                  <time className="ls-li-d" dateTime={m.watchDate}>{fmt(m.watchDate)}</time>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <footer className="ls-end"><p>That is the programme. <a href="/">Back to the main site</a></p></footer>
    </main>
  )
}
