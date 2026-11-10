import Link from 'next/link'
import Image from 'next/image'
import type { LabMovie } from '@/components/lab/data'
import s from './styles.module.css'
import SectionHead from './SectionHead'
import PosterFallback from './PosterFallback'
import Empty from './Empty'
import Reveal from './Reveal'
import { fmtDate } from './fmt'

function Holes({ n }: { n: number }) {
  return (
    <span className="flex gap-1.5" role="img" aria-label={`Rated ${n} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`h-3 w-3 rounded-full ${i <= n ? 'bg-[var(--velvet)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]' : 'border border-[var(--velvet)]/50'}`} />
      ))}
    </span>
  )
}

export default function MoviesRow({ movies }: { movies: LabMovie[] }) {
  return (
    <section aria-labelledby="movies-h" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
      <SectionHead id="movies-h" title="Now showing" line="What I watched lately, rated by how loudly I told people about it." href="/movies" cta="See every film" />
      {movies.length === 0 ? (
        <Empty text="The screen is dark tonight. Nothing logged yet." href="/movies" cta="Check the movies page" />
      ) : (
        <Reveal>
          <ul className={`${s.row} -mx-5 flex gap-6 overflow-x-auto px-5 pb-6 sm:mx-0 sm:px-0`}>
            {movies.map((m) => (
              <li key={m.id} className="w-[200px] shrink-0">
                <Link href="/movies" className={`${s.lift} block`} aria-label={`${m.title}, ${m.type === 'SERIES' ? 'series' : 'film'}, rated ${m.rating} out of 5`}>
                  <div className="relative aspect-[2/3] border-[6px] border-[var(--brass)] bg-[var(--velvet)] shadow-[0_14px_30px_-10px_rgba(0,0,0,0.8)]">
                    {m.posterUrl ? (
                      <Image src={m.posterUrl} alt={`Poster for ${m.title}`} fill sizes="200px" className="object-cover" />
                    ) : (
                      <PosterFallback label={`No poster for ${m.title}`} />
                    )}
                  </div>
                  <div className={`${s.ticket} -mt-px bg-[var(--beam)] px-4 pb-4 pt-3 text-[var(--velvet)]`}>
                    <div className={s.perf} aria-hidden />
                    <p className={`${s.display} mt-3 break-words text-2xl`}>{m.title}</p>
                    <p className="mt-1 text-sm font-semibold">Admit one, {m.type === 'SERIES' ? 'series' : 'film'}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <time dateTime={m.watchDate} className="num text-sm">{fmtDate(m.watchDate)}</time>
                      <Holes n={m.rating} />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </section>
  )
}
