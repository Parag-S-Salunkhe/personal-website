import Image from 'next/image'
import Link from 'next/link'
import type { LabData } from '../data'
import Band, { Empty } from './Band'
import { Plate, Pot, Reel } from './Shapes'
import { Rating, fmtDate, isTmdb } from './util'
import s from './styles.module.css'
import { isOptimizable } from '@/lib/url'

const scroller = `${s.snap} -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:overflow-visible md:px-0 md:pb-0`

export function MoviesRow({ movies }: { movies: LabData['movies'] }) {
  const list = movies.slice(0, 4)
  return (
    <Band id="bk-movies" title="Movies" blurb="What I watched lately, rated in squares." href="/movies" linkLabel="All the movies" bg="var(--cobalt)" fg="var(--tile)" dark>
      {list.length === 0 ? (
        <Empty text="No films logged yet. The sofa is waiting." />
      ) : (
        <ul className={`${scroller} md:grid-cols-4`}>
          {list.map((m) => (
            <li key={m.id} className={`${s.lift} w-[72vw] max-w-[320px] shrink-0 md:w-auto md:max-w-none`}>
              <article>
                <div className="relative aspect-[2/3] overflow-hidden rounded-3xl bg-[var(--ink)]/30">
                  {isTmdb(m.posterUrl) ? (
                    <Image unoptimized={!isOptimizable(m.posterUrl)} src={m.posterUrl} alt={`Poster for ${m.title}`} fill sizes="(min-width: 768px) 25vw, 72vw" className="object-cover" />
                  ) : (
                    <Reel className="absolute inset-0 h-full w-full" />
                  )}
                </div>
                <h3 className={`${s.title} mt-4 line-clamp-3 text-2xl md:text-3xl`}>{m.title}</h3>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Rating value={m.rating} />
                  <span className={`${s.nums} text-sm`}>{m.type === 'SERIES' ? 'Series' : 'Film'}, {fmtDate(m.watchDate)}</span>
                </div>
                {m.review ? <p className={`${s.body} mt-3 line-clamp-2 text-base`}>{m.review}</p> : null}
              </article>
            </li>
          ))}
        </ul>
      )}
    </Band>
  )
}

export function CookingRow({ dishes }: { dishes: LabData['dishes'] }) {
  const list = dishes.slice(0, 3)
  const pots = ['var(--tomato)', 'var(--cobalt)', 'var(--pea)']
  return (
    <Band id="bk-cooking" title="Cooking" blurb="Pantry labels from the stove. Photos are coming; the pots will do for now." href="/cooking" linkLabel="All the dishes" bg="var(--tomato)" fg="var(--ink)">
      {list.length === 0 ? (
        <Empty text="Nothing cooked and written down yet." />
      ) : (
        <ul className={`${scroller} md:grid-cols-3`}>
          {list.map((d, i) => (
            <li key={d.id} className={`${s.lift} w-[82vw] max-w-[420px] shrink-0 md:w-auto md:max-w-none`}>
              <article className="flex h-full flex-col rounded-3xl bg-[var(--tile)] p-4 text-[var(--ink)] md:p-5">
                <p className={`${s.display} break-words`} style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>{d.category}</p>
                <div className="relative mt-4 aspect-[3/2] overflow-hidden rounded-2xl">
                  {isTmdbOrRemote(d.imageUrl) ? (
                    <Image unoptimized={!isOptimizable(d.imageUrl)} src={d.imageUrl} alt={`Photo of ${d.dishName}`} fill sizes="(min-width: 768px) 33vw, 82vw" className="object-cover" />
                  ) : (
                    <Pot body={pots[i % pots.length]} className="absolute inset-0 h-full w-full" />
                  )}
                </div>
                <h3 className={`${s.title} mt-4 break-words text-2xl`}>{d.dishName}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Rating value={d.rating} />
                  <span className={`${s.nums} text-sm text-[#4a4a52]`}>{fmtDate(d.cookDate)}</span>
                </div>
                {d.ingredients.length > 0 ? (
                  <ul className="mt-4 border-t-2 border-[var(--ink)]">
                    {d.ingredients.slice(0, 5).map((ing, k) => (
                      <li key={k} className="border-b-2 border-[var(--ink)] py-1.5 text-base font-semibold">{ing}</li>
                    ))}
                  </ul>
                ) : (
                  <p className={`${s.body} mt-4 border-t-2 border-[var(--ink)] pt-3 text-base text-[#4a4a52]`}>No ingredients written down yet.</p>
                )}
                {d.review ? <p className={`${s.body} mt-3 line-clamp-2 text-base`}>{d.review}</p> : null}
              </article>
            </li>
          ))}
        </ul>
      )}
    </Band>
  )
}

function isTmdbOrRemote(url: string | null): url is string {
  // Dish photos may live on hosts next/image has not been told about; only render same-origin or tmdb.
  if (!url) return false
  return url.startsWith('/') || isTmdb(url)
}

export function BlogRow({ posts }: { posts: LabData['posts'] }) {
  const list = posts.slice(0, 3)
  return (
    <Band id="bk-blog" title="Blog" blurb="Longer thoughts, set in poster type." href="/blog" linkLabel="All the posts" bg="var(--mustard)" fg="var(--ink)">
      {list.length === 0 ? (
        <Empty text="Nothing written yet. The pen is warming up." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-3">
          {list.map((p) => (
            <li key={p.id}>
              <Link
                href={`/blog/${p.id}`}
                className={`${s.lift} ${s.onDark} group relative flex h-full min-h-[22rem] flex-col justify-between overflow-hidden rounded-3xl bg-[var(--ink)] p-5 text-[var(--tile)] md:p-6`}
              >
                <Plate className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 md:-right-10 md:-top-10 md:h-40 md:w-40" />
                <span className={`${s.title} relative inline-flex w-fit rounded-full bg-[var(--tile)] px-3 py-1 text-sm text-[var(--ink)]`}>
                  {p.blogType ?? 'Post'}
                </span>
                <span className="mt-24 block">
                  <span className={`${s.display} line-clamp-4 block break-words`} style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}>{p.title}</span>
                  <span className={`${s.body} mt-3 line-clamp-3 block text-base text-[var(--tile)]/90`}>{p.excerpt}</span>
                  <span className={`${s.nums} mt-4 block text-sm text-[var(--mustard)]`}>{fmtDate(p.publishDate)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Band>
  )
}

export function NotesRow({ notes, projects }: { notes: LabData['notes']; projects: LabData['projects'] }) {
  const list = notes.slice(0, 4)
  return (
    <Band id="bk-notes" title="Notes" blurb="Scraps from the counter, and what is on the workbench." href="/notes" linkLabel="All the notes" bg="var(--pea)" fg="var(--tile)" dark>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
        {list.length === 0 ? (
          <Empty text="No scraps yet. Nothing to put on the fridge." />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {list.map((n) => (
              <li key={n.id} className="rounded-2xl bg-[var(--tile)] p-4 text-[var(--ink)]">
                <p className={`${s.nums} text-sm font-semibold text-[#2f5d3c]`}>{n.category ?? 'Note'}, {fmtDate(n.createdAt)}</p>
                <h3 className={`${s.title} mt-2 line-clamp-2 text-xl`}>{n.title}</h3>
                <p className={`${s.body} mt-2 line-clamp-3 text-base`}>{n.excerpt}</p>
              </li>
            ))}
          </ul>
        )}
        <div>
          <h3 className={`${s.title} text-2xl`}>On the workbench</h3>
          {projects.length === 0 ? (
            <p className={`${s.body} mt-3`}>The bench is clear.</p>
          ) : (
            <ul className="mt-4 border-t-2 border-[var(--tile)]">
              {projects.slice(0, 3).map((p) => (
                <li key={p.id} className="border-b-2 border-[var(--tile)] py-3">
                  <p className={`${s.title} break-words text-lg`}>{p.title}</p>
                  <p className="mt-1 text-sm">{p.techStack.slice(0, 4).join(', ')}</p>
                </li>
              ))}
            </ul>
          )}
          <Link href="/projects" className={`${s.press} mt-5 inline-flex h-11 items-center rounded-full border-2 border-[var(--tile)] px-5 text-base font-bold hover:bg-[var(--tile)] hover:text-[var(--pea)]`}>
            All the projects
          </Link>
        </div>
      </div>
    </Band>
  )
}
