import { getLabData } from '@/components/lab/kit/data'
import LabTag from '@/components/lab/kit/LabTag'
import Hero from '@/components/lab/fx/kinetic-type/Hero'
import Swell from '@/components/lab/fx/kinetic-type/Swell'
import Board from '@/components/lab/fx/kinetic-type/Board'
import s from '@/components/lab/fx/kinetic-type/kinetic.module.css'

export const metadata = { title: 'Kinetic type' }
export const revalidate = 3600

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

export default async function Page() {
  const { movies } = await getLabData()
  const rows = movies.slice(0, 8).map((m) => ({ title: m.title, rating: m.rating, date: m.watchDate }))
  return (
    <main className={s.page}>
      <LabTag title="Kinetic type" />
      <Hero line2="Movie nights at home in Dublin. Doors at eight, the projector warms up at nine." />
      <Swell />
      <section className={s.boardSec}>
        <h2 className={`${s.boardTitle} ${s.display}`}>Now showing</h2>
        <Board rows={rows} />
      </section>
      <section className={s.listSec}>
        <p className={s.cap}>The board above, as plain text: what has been on the screen lately, with the score and the date watched.</p>
        <ul className={s.list}>
          {movies.map((m) => (
            <li key={m.id}>
              <span className={`${s.t} ${s.display}`}>{m.title}</span>
              <span className={s.r}>{m.rating.toFixed(1)}</span>
              <time className={s.d} dateTime={m.watchDate}>{fmt(m.watchDate)}</time>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
