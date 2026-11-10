import Link from 'next/link'
import { getLabData, withPosters } from '@/components/lab/kit/data'
import { labImg } from '@/components/lab/kit/img'
import LabTag from '@/components/lab/kit/LabTag'
import Lazy from '@/components/lab/wildcard/Lazy'
import './wc.css'

export const metadata = { title: 'Further in' }
export const revalidate = 3600

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

export default async function Page() {
  const { movies, dishes, posts, notes } = await getLabData()
  const withP = withPosters(movies)
  const films = withP.slice(0, 8).map((m) => ({ title: m.title, posterUrl: labImg(m.posterUrl, 384) as string, rating: m.rating, date: fmt(m.watchDate) }))
  const dishList = dishes.slice(0, 5).map((d) => ({ id: d.id, name: d.dishName, category: d.category, rating: d.rating, ingredients: d.ingredients.slice(0, 7) }))
  const content = { films, dishes: dishList, notes: notes.slice(0, 6).map((n) => n.title), posts: posts.slice(0, 4).map((p) => p.title) }
  const d0 = dishList[0]
  const caps = [
    { h: 'The street, dusk', p: 'Number 14 has one window lit.' },
    { h: 'The room', p: `${notes.length} notes on the wall, ${posts.length} letters on the sideboard.` },
    { h: 'The table', p: d0 ? `Laid for ${dishList.length}. The latest dish is ${d0.name}.` : 'Laid for supper.' },
    { h: d0?.name ?? 'The plate', p: d0 ? `${d0.category}, rated ${d0.rating} of 5.` : 'On the plate.' },
    { h: films[0]?.title ?? 'The film', p: films[0] ? `${films.length} films pass the frame. Rated ${films[0].rating} of 5.` : 'The reel turns.' },
    { h: 'The same street', p: 'Night now, every window lit. You came out where you started.' },
  ]

  return (
    <main className="wc-root">
      <LabTag title="Further in" />
      <div id="wc-wrap" className="wc-wrap">
        <div className="wc-stage">
          <div className="wc-static" aria-hidden><i /></div>
          <Lazy content={content} caps={caps} />
          <div id="wc-intro" className="wc-intro">
            <h1>Further in</h1>
            <p>Number 14, a supper club and a film night in Dublin. Scroll to fall through the window and keep going.</p>
          </div>
          <p id="wc-hint" className="wc-hint">Scroll</p>
          <p className="wc-rm-line">The street holds the window, the window the table, the table the plate, the plate the film.</p>
        </div>
      </div>

      <div className="wc-rm-heads">
        {caps.map((c) => (<div key={c.h}><h2>{c.h}</h2><p>{c.p}</p></div>))}
      </div>

      <div className="wc-after">
        <section aria-labelledby="wc-m">
          <h2 id="wc-m">Movies</h2>
          <p className="wc-lede">Every film in one strip, each poster holding the next. <Link href="/lab/wildcard/movies">Open the reel</Link>.</p>
          <ul className="wc-films">
            {withP.slice(0, 8).map((m) => (
              <li key={m.id}>
                <img src={labImg(m.posterUrl, 384) as string} alt="" loading="lazy" width={384} height={576} />
                <p>{m.title}<small>{m.rating} of 5, watched {fmt(m.watchDate)}</small></p>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="wc-c">
          <h2 id="wc-c">Cooking</h2>
          <ul className="wc-list">
            {dishes.slice(0, 6).map((d) => (
              <li key={d.id}><b>{d.dishName}</b><span>{d.category}, {d.rating} of 5</span><em>{fmt(d.cookDate)}</em></li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="wc-w">
          <h2 id="wc-w">Writing</h2>
          <ul className="wc-list">
            {posts.map((p) => (
              <li key={p.id}><b>{p.title}</b><span>{fmt(p.publishDate)}</span><em>{p.excerpt}</em></li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="wc-n">
          <h2 id="wc-n">Notes</h2>
          <ul className="wc-list">
            {notes.map((n) => (
              <li key={n.id}><b>{n.title}</b><span>{n.category ?? ''}</span></li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="wc-g">
          <h2 id="wc-g">Guestbook</h2>
          <p className="wc-links"><a href="/#guest-note">Leave a note at the door</a><Link href="/lab/wildcard/movies">The reel</Link><a href="#wc-wrap">Back to the street</a></p>
        </section>
      </div>
    </main>
  )
}
