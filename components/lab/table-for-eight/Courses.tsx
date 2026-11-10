import Image from 'next/image'
import Link from 'next/link'
import { Star, Play, Feather } from 'lucide-react'
import type { LabMovie, LabDish, LabPost, LabNote } from '@/components/lab/data'
import { Plate } from './Plate'
import styles from './styles.module.css'

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${n} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-4 w-4 ${i <= n ? 'fill-[var(--claret)] text-[var(--claret)]' : 'text-[var(--ink-soft)]/45'}`} aria-hidden="true" />
      ))}
    </span>
  )
}

export function CourseRow({ id, title, intro, href, linkLabel, children, empty }: { id: string; title: string; intro: string; href: string; linkLabel: string; children?: React.ReactNode; empty?: string }) {
  return (
    <section aria-labelledby={id} className="mx-auto w-full max-w-[1280px] px-4 pt-16 sm:px-8 lg:pt-24">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h2 id={id} className="text-3xl font-bold leading-tight tracking-tight text-[var(--wax)] sm:text-4xl">{title}</h2>
          <p className={`${styles.pretty} mt-1 max-w-xl text-base text-[var(--sage)]`}>{intro}</p>
        </div>
        <Link href={href} className={`${styles.focusRing} inline-flex min-h-[44px] items-center rounded-full border border-[var(--sage)]/50 px-5 text-base font-semibold text-[var(--wax)] transition-colors duration-300 hover:border-[var(--candle)] hover:text-[var(--candle)]`}>
          {linkLabel}
        </Link>
      </div>
      {children ?? (
        <div className="flex items-center gap-4 rounded-[10px] border border-dashed border-[var(--sage)]/40 p-6">
          <Plate kind="empty" className="h-16 w-16 shrink-0" />
          <p className="text-base text-[var(--sage)]">{empty}</p>
        </div>
      )}
    </section>
  )
}

const rowCls = `${styles.scroller} -mx-4 flex gap-4 overflow-x-auto px-4 pb-6 pt-1 sm:-mx-8 sm:px-8 xl:mx-0 xl:px-0`

export function MovieRow({ movies }: { movies: LabMovie[] }) {
  return (
    <CourseRow id="films" title="The film course" intro="What went on after dinner. Lights low, phones face down." href="/movies" linkLabel="All the films" empty="No films yet. The sofa is free tonight.">
      {movies.length > 0 && (
        <ul className={rowCls}>
          {movies.map((m, i) => (
            <li key={m.id} className={`${styles.snap} w-[17rem] shrink-0 sm:w-[19rem]`}>
              <Link href="/movies" className={`${styles.course} ${styles.focusRingInk} flex h-full flex-col items-center rounded-[10px] bg-[var(--linen)] px-5 pb-5 pt-6 text-center text-[var(--ink)] focus-visible:outline`}>
                <span className="relative block h-36 w-36 shrink-0">
                  {m.posterUrl ? (
                    <>
                      <Plate kind="film" className="absolute inset-0 h-full w-full" />
                      <span className="absolute inset-[11%] overflow-hidden rounded-full shadow-[inset_0_0_0_3px_#F1EEE6,0_0_0_1px_#C9C3B2]">
                        <Image src={m.posterUrl} alt={`Poster for ${m.title}`} fill sizes="160px" className="object-cover" />
                      </span>
                    </>
                  ) : (
                    <Plate kind="film" variant={i} className="h-full w-full" />
                  )}
                </span>
                <span className={`${styles.display} mt-4 line-clamp-2 break-words text-2xl leading-tight`}>{m.title}</span>
                <span className="mt-2"><Stars n={m.rating} /></span>
                <span className={`${styles.nums} mt-1 text-sm text-[var(--ink-soft)]`}>{m.type === 'SERIES' ? 'Series' : 'Film'}, watched {fmt(m.watchDate)}</span>
                {m.review && <span className={`${styles.pretty} mt-3 line-clamp-3 break-words border-t border-dashed border-[var(--ink-soft)]/40 pt-3 text-sm text-[var(--ink-soft)]`}>{m.review}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </CourseRow>
  )
}

export function DishRow({ dishes }: { dishes: LabDish[] }) {
  return (
    <CourseRow id="kitchen" title="From the kitchen" intro="Courses I have cooked, set out like the menu on the fridge." href="/cooking" linkLabel="The whole menu" empty="Nothing cooked yet. Give me an evening.">
      {dishes.length > 0 && (
        <ul className={rowCls}>
          {dishes.map((d, i) => (
            <li key={d.id} className={`${styles.snap} w-[17rem] shrink-0 sm:w-[19rem]`}>
              <Link href="/cooking" className={`${styles.course} ${styles.focusRingInk} flex h-full flex-col rounded-[10px] bg-[var(--linen)] p-5 text-[var(--ink)] focus-visible:outline`}>
                <span className="flex items-center gap-4">
                  {d.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.imageUrl} alt={`${d.dishName}, on the plate`} className="h-20 w-20 shrink-0 rounded-full object-cover shadow-[0_0_0_4px_#F1EEE6,0_0_0_5px_#C9C3B2]" loading="lazy" />
                  ) : (
                    <Plate variant={i} className="h-20 w-20 shrink-0" />
                  )}
                  <span className="min-w-0">
                    <span className={`${styles.display} line-clamp-2 break-words text-2xl leading-tight`}>{d.dishName}</span>
                    <span className="mt-1 block text-sm font-semibold text-[var(--claret)]">{d.category}</span>
                  </span>
                </span>
                <span className="mt-4 flex items-center justify-between gap-2 border-t border-dashed border-[var(--ink-soft)]/40 pt-3">
                  <Stars n={d.rating} />
                  <span className={`${styles.nums} text-sm text-[var(--ink-soft)]`}>{fmt(d.cookDate)}</span>
                </span>
                {d.ingredients.length > 0 ? (
                  <span className="mt-3 block text-sm text-[var(--ink-soft)]">
                    <span className="font-semibold text-[var(--ink)]">Set beneath: </span>
                    {d.ingredients.slice(0, 6).join(', ')}
                  </span>
                ) : d.review ? (
                  <span className={`${styles.pretty} mt-3 line-clamp-3 break-words text-sm text-[var(--ink-soft)]`}>{d.review}</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </CourseRow>
  )
}

export function PostRow({ posts }: { posts: LabPost[] }) {
  return (
    <CourseRow id="invitations" title="Invitations to read" intro="Longer thoughts, sealed and sent." href="/blog" linkLabel="All the posts" empty="No posts yet. I am still finding the pen.">
      {posts.length > 0 && (
        <ul className="grid gap-4 pb-2 md:grid-cols-2">
          {posts.slice(0, 4).map((p) => {
            const video = p.blogType === 'Video'
            return (
              <li key={p.id}>
                <Link href={`/blog/${p.id}`} className={`${styles.course} ${styles.focusRingInk} relative flex h-full gap-4 rounded-[10px] bg-[var(--linen)] p-5 text-[var(--ink)] focus-visible:outline`}>
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[var(--claret)] text-[var(--wax)] shadow-[0_0_0_3px_#F1EEE6,0_0_0_4px_#7C2236]" aria-hidden="true">
                    {video ? <Play className="h-6 w-6 fill-current" /> : <Feather className="h-6 w-6" />}
                  </span>
                  <span className="min-w-0">
                    <span className={`${styles.nums} block text-sm text-[var(--ink-soft)]`}>{fmt(p.publishDate)}{video ? ', a video' : ''}</span>
                    <span className={`${styles.display} mt-1 line-clamp-2 break-words text-2xl leading-tight`}>{p.title}</span>
                    {p.excerpt && <span className={`${styles.pretty} mt-2 line-clamp-3 break-words text-base text-[var(--ink-soft)]`}>{p.excerpt}</span>}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </CourseRow>
  )
}

export function NoteRow({ notes }: { notes: LabNote[] }) {
  const tilt = ['-rotate-1', 'rotate-1', '-rotate-[0.5deg]']
  return (
    <CourseRow id="scraps" title="Scraps from the pocket" intro="Notes to self, left lying about the table." href="/notes" linkLabel="All the notes" empty="No scraps yet. The pockets are empty.">
      {notes.length > 0 && (
        <ul className="grid gap-5 pb-2 sm:grid-cols-2 lg:grid-cols-3">
          {notes.slice(0, 3).map((n, i) => (
            <li key={n.id}>
              <Link href="/notes" className={`${styles.course} ${styles.focusRingInk} block h-full ${tilt[i % 3]} rounded-[4px] bg-[#F7E7B8] p-5 text-[var(--ink)] focus-visible:outline`}>
                <span className={`${styles.script} block text-3xl leading-none`}>{n.title}</span>
                <span className={`${styles.pretty} mt-2 line-clamp-3 break-words text-base`}>{n.excerpt}</span>
                <span className={`${styles.nums} mt-3 block text-sm text-[#4A4630]`}>{n.category ? `${n.category}, ` : ''}{fmt(n.createdAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </CourseRow>
  )
}
