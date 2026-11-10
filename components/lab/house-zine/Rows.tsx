import Image from 'next/image'
import Link from 'next/link'
import { Play } from 'lucide-react'
import type { LabDish, LabMovie, LabNote, LabPost } from '@/components/lab/data'
import { NoPoster, Plate, Rated, Staple, Tape } from './Marks'
import Settle from './Settle'
import { fmtDate } from './util'
import s from './styles.module.css'

const TILTS = [-2, 1.5, -1, 2.5, -1.5, 1, -2.5, 2]

function Head({ id, title, href, linkLabel, scribble }: { id: string; title: string; href: string; linkLabel: string; scribble: string }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div>
        <h2 id={id} className={`${s.display} ${s.mis} text-[clamp(2rem,8vw,3.5rem)]`}>{title}</h2>
        <p className={`${s.hand} -rotate-1 pt-2 text-3xl`}>{scribble}</p>
      </div>
      <Link href={href} className={`${s.label} ${s.link} inline-flex min-h-[44px] items-center text-xl`}>{linkLabel}</Link>
    </div>
  )
}

function Empty({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className={`${s.cut} p-8 text-center`}>
      <p className="mx-auto max-w-[40ch] text-lg">{text}</p>
      <Link href={href} className={`${s.label} ${s.link} mt-2 inline-flex min-h-[44px] items-center text-xl`}>{cta}</Link>
    </div>
  )
}

const scroller = `${s.scroller} -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-6 pt-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-8 lg:overflow-visible lg:px-0`

export function MoviesRow({ movies }: { movies: LabMovie[] }) {
  const list = movies.slice(0, 8)
  return (
    <section aria-labelledby="hz-movies" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Head id="hz-movies" title="Movies" href="/movies" linkLabel="All the movies" scribble="double bill, dessert at the interval" />
      {list.length === 0 ? <Empty text="Nothing on the projector yet. The first double bill will land here." href="/movies" cta="Open the movies page" /> : (
        <ul className={scroller}>
          {list.map((m, i) => (
            <li key={m.id} className="w-[64%] shrink-0 snap-start sm:w-[40%] lg:w-auto">
              <Settle rotate={TILTS[i % TILTS.length]} delay={(i % 4) * 0.06} className="relative">
                <article>
                  <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-2" />
                  <div className="relative">
                    <div className={`${s.duo} relative aspect-[2/3]`}>
                      {m.posterUrl ? (
                        <Image src={m.posterUrl} alt={`Poster for ${m.title}`} fill sizes="(min-width: 1024px) 280px, 64vw" />
                      ) : <NoPoster />}
                    </div>
                    <div className="absolute -bottom-5 right-2 z-[3] rounded-full bg-[var(--paper)]"><Rated n={m.rating} /></div>
                  </div>
                  <h3 className={`${s.title} mt-3 pr-14 text-2xl [overflow-wrap:anywhere]`}>{m.title}</h3>
                  <p className={`${s.label} ${s.nums} mt-1 text-lg`}>{m.type === 'SERIES' ? 'Series' : 'Film'}, {fmtDate(m.watchDate)}</p>
                  {m.review && <p className="mt-2 line-clamp-2 text-base">{m.review}</p>}
                </article>
              </Settle>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function DishesRow({ dishes }: { dishes: LabDish[] }) {
  const list = dishes.slice(0, 8)
  return (
    <section aria-labelledby="hz-cooking" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Head id="hz-cooking" title="Cooking" href="/cooking" linkLabel="All the dishes" scribble="clipped from the Sunday pile" />
      {list.length === 0 ? <Empty text="The kitchen is quiet. The first recipe clipping goes here." href="/cooking" cta="Open the cooking page" /> : (
        <ul className={scroller}>
          {list.map((d, i) => (
            <li key={d.id} className="w-[78%] shrink-0 snap-start sm:w-[46%] lg:w-auto">
              <Settle rotate={TILTS[(i + 3) % TILTS.length] / 2} delay={(i % 4) * 0.06} className="h-full">
                <article className={`${s.cut} relative h-full bg-[var(--slip)] px-4 pb-5 pt-6`}>
                  {d.imageUrl ? (
                    <div className="relative h-24 w-full"><Image src={d.imageUrl} alt={d.dishName} fill sizes="(min-width: 1024px) 280px, 78vw" className="object-cover" /></div>
                  ) : <Plate variant={i % 3} />}
                  <h3 className={`${s.title} mt-3 text-2xl [overflow-wrap:anywhere]`}>{d.dishName}</h3>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className={`${s.label} ${s.nums} text-lg`}>{d.category}, {fmtDate(d.cookDate)}</p>
                    <Rated n={d.rating} />
                  </div>
                  {d.ingredients.length > 0 && (
                    <ul className="mt-2 flex flex-wrap gap-1 text-sm" aria-label="Ingredients">
                      {d.ingredients.slice(0, 5).map((ing) => (
                        <li key={ing} className="border border-[var(--riso-blue)] px-2 py-0.5">{ing}</li>
                      ))}
                      {d.ingredients.length > 5 && <li className="px-1 py-0.5">and {d.ingredients.length - 5} more</li>}
                    </ul>
                  )}
                  {d.review && <p className="mt-3 line-clamp-3 text-base">{d.review}</p>}
                </article>
              </Settle>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function PostsRow({ posts }: { posts: LabPost[] }) {
  const list = posts.slice(0, 4)
  return (
    <section aria-labelledby="hz-blog" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Head id="hz-blog" title="Blog" href="/blog" linkLabel="All the posts" scribble="things I wrote down" />
      {list.length === 0 ? <Empty text="No pages written yet. The first spread goes here." href="/blog" cta="Open the blog" /> : (
        <ul className="grid gap-8 md:grid-cols-2">
          {list.map((p, i) => {
            const video = p.blogType?.toLowerCase() === 'video'
            return (
              <li key={p.id}>
                <Settle rotate={i % 2 ? 0.6 : -0.6}>
                  <article className="relative grid bg-[var(--slip)] md:grid-cols-2">
                    <div className="relative bg-[var(--riso-blue)] p-5 text-[var(--paper)]">
                      <div className={`${s.halftone} absolute inset-0 opacity-60`} aria-hidden="true" />
                      <p className={`${s.label} ${s.nums} relative text-lg`}>{fmtDate(p.publishDate)}</p>
                      <h3 className={`${s.title} relative mt-2 text-3xl [overflow-wrap:anywhere]`}>
                        <Link href={`/blog/${p.id}`} className="hover:underline">{p.title}</Link>
                      </h3>
                      {video && <p className={`${s.label} relative mt-3 inline-flex items-center gap-1 bg-[var(--riso-yellow)] px-2 py-0.5 text-[var(--ink)]`}><Play className="h-4 w-4" aria-hidden="true" /> Video</p>}
                    </div>
                    <div className="p-5">
                      <p className="line-clamp-6 text-base">{p.excerpt}</p>
                      <Link href={`/blog/${p.id}`} className={`${s.label} ${s.link} mt-3 inline-flex min-h-[44px] items-center text-lg`}>Read the post</Link>
                    </div>
                    <Staple className="left-8 top-[-2px] md:hidden" />
                    <Staple className="left-1/2 top-8 hidden -translate-x-1/2 rotate-90 md:block" />
                  </article>
                </Settle>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export function NotesRow({ notes }: { notes: LabNote[] }) {
  const list = notes.slice(0, 4)
  if (list.length === 0) return null
  return (
    <section aria-labelledby="hz-notes" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Head id="hz-notes" title="Notes" href="/notes" linkLabel="All the notes" scribble="scraps from my pockets" />
      <ul className="grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-4">
        {list.map((n, i) => (
          <li key={n.id}>
            <Settle rotate={TILTS[(i * 3) % TILTS.length]} className="relative">
              <article className="relative h-full bg-[var(--riso-yellow)] p-4 pt-6 text-[var(--ink)]">
                <Tape className="-top-3 left-1/2 -translate-x-1/2 -rotate-2 !bg-[var(--riso-pink)]/60" />
                <h3 className={`${s.title} text-xl [overflow-wrap:anywhere]`}>{n.title}</h3>
                <p className="mt-2 line-clamp-4 text-sm">{n.excerpt}</p>
                <p className={`${s.label} ${s.nums} mt-3 text-base`}>{n.category ? `${n.category}, ` : ''}{fmtDate(n.createdAt)}</p>
              </article>
            </Settle>
          </li>
        ))}
      </ul>
    </section>
  )
}
