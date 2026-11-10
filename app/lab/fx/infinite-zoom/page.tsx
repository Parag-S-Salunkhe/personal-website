import { getLabData, withPosters } from '@/components/lab/kit/data'
import { labImg } from '@/components/lab/kit/img'
import LabTag from '@/components/lab/kit/LabTag'
import Lazy from '@/components/lab/fx/infinite-zoom/Lazy'
import './iz.css'

export const metadata = { title: 'Infinite zoom' }
export const revalidate = 3600

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

export default async function Page() {
  const { movies, dishes } = await getLabData()
  const posters = withPosters(movies).slice(0, 2)
  const dish = dishes[0]
  const films = posters.map((m) => ({ title: m.title, posterUrl: labImg(m.posterUrl, 640) as string, rating: m.rating }))
  const dishInfo = { id: dish?.id ?? 'dish', name: dish?.dishName ?? 'Supper', ingredients: dish?.ingredients ?? [] }
  const caps = [
    { h: 'The street, lights on', p: 'Look for the one lit window.' },
    { h: 'A window, a room', p: 'Someone has laid the table.' },
    { h: 'Supper is laid', p: 'Candles, linen, a place for you.' },
    { h: dishInfo.name, p: dish ? `${dish.category}, rated ${dish.rating} of 5` : 'On the plate' },
    { h: films[0]?.title ?? 'The film', p: films[0] ? `Rated ${films[0].rating} of 5, and the screen shows the street again.` : 'And the screen shows the street again.' },
  ]

  return (
    <main className="iz-root">
      <LabTag title="Infinite zoom" />
      <div id="iz-wrap" className="iz-wrap">
        <div className="iz-stage">
          <div className="iz-static" aria-hidden><i /></div>
          <Lazy films={films} dish={dishInfo} caps={caps} />
          <div id="iz-intro" className="iz-intro">
            <h1>Infinite zoom</h1>
            <p>A street, a window, a table, a plate, a film frame, and the street again. Scroll to fall in.</p>
          </div>
          <p id="iz-hint" className="iz-hint">Scroll</p>
          <p className="iz-rm-line">Street, window, table, plate, film frame: each sits inside the last.</p>
        </div>
      </div>

      <div className="iz-after">
        <section aria-labelledby="iz-menu-h">
          <h2 id="iz-menu-h">On the table</h2>
          <ul className="iz-menu">
            {dishes.slice(0, 6).map((d) => (
              <li key={d.id}><b>{d.dishName}</b><span>{d.category}, {d.rating} of 5</span></li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="iz-films-h">
          <h2 id="iz-films-h">On the screen</h2>
          <ul className="iz-films">
            {withPosters(movies).slice(0, 6).map((m) => (
              <li key={m.id}>
                <img src={labImg(m.posterUrl, 384) as string} alt="" loading="lazy" width={384} height={576} />
                <p>{m.title}<small>{m.rating} of 5, watched {fmtDate(m.watchDate)}</small></p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}
