// The courses: normal document sections after the story, on cloth / cloth-deep. Server component; the entrances are in Reveals.
// Modelled on the sections of app/lab/table-for-eight/page.tsx (run 2 home), with real links and real data.
import Image from 'next/image'
import Link from 'next/link'
import { Github, Linkedin } from '@/components/icons/Brand'
import PosterFrame from '@/components/site/PosterFrame'
import Plate from '@/components/site/Plate'
import Rating from '@/components/site/Rating'
import GuestForm from '@/components/site/GuestForm'
import { Empty, SectionHead } from '@/components/site/SectionHead'
import type { Dish, GuestNote, Movie, Note, Post, Project } from '@/lib/content'
import { fmtDate } from '@/lib/format'
import { isOptimizable } from '@/lib/url'
import { socials } from '@/lib/site'
import { shorten } from './content'

const wrap = 'mx-auto max-w-6xl px-4 sm:px-6'

export default function Courses({ movies, dishes, posts, notes, projects, guest }: { movies: Movie[]; dishes: Dish[]; posts: Post[]; notes: Note[]; projects: Project[]; guest: GuestNote | null }) {
  const films = movies.slice(0, 6)
  const posters = movies.filter((m) => m.posterUrl).slice(0, 3)
  const dishList = dishes.slice(0, 4)
  const postList = posts.slice(0, 3)
  const noteList = notes.slice(0, 6)
  const projectList = projects.slice(0, 4)

  return (
    <>
      {/* the film course */}
      <section aria-labelledby="home-movies" className={`${wrap} py-24`}>
        <div data-mv="wipe"><SectionHead id="home-movies" title="The film course" name="Movies" text="What went on the screen after supper, most recent first." href="/movies" linkLabel="All the movies" /></div>
        {films.length === 0 ? (
          <Empty title="Nothing on the projector yet" text="The first film night will land here." />
        ) : (
          <div data-mv="unroll" className="ev-card grid gap-8 p-6 sm:p-10 md:grid-cols-[1.4fr_1fr]">
            <ol data-mv="lines" className="divide-y divide-[rgb(23_53_42/0.15)]">
              {films.map((m) => (
                <li key={m.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-2">
                  <Link href={`/movies/${m.slug}`} className="ev-serif ev-link inline-flex min-h-[44px] min-w-0 flex-1 items-center text-xl no-underline hover:underline sm:text-2xl">{m.title}</Link>
                  <Rating n={m.rating} size="sm" />
                  <span className="ev-meta ev-soft shrink-0">{fmtDate(m.watchDate)}</span>
                </li>
              ))}
            </ol>
            {posters.length > 0 && (
              <div data-mv="deal" className="flex items-start justify-center gap-3">
                {posters.map((m, i) => (
                  <div key={m.id} className="w-[31%] shadow-[0_10px_24px_rgba(0,0,0,.35)]" style={{ transform: `rotate(${(i - 1) * 3}deg) translateY(${i === 1 ? 14 : 0}px)` }}>
                    <PosterFrame src={m.posterUrl} title={m.title} sizes="(min-width: 768px) 12vw, 28vw" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* the kitchen */}
      <section aria-labelledby="home-cooking" className="bg-[var(--cloth-deep)]">
        <div className={`${wrap} py-24`}>
          <div data-mv="wipe"><SectionHead id="home-cooking" title="From the kitchen" name="Cooking" href="/cooking" linkLabel="All the dishes" /></div>
          {dishList.length === 0 ? (
            <Empty title="The kitchen is quiet" text="The first dish goes here." />
          ) : (
            <ul data-mv="deal" className="grid gap-10 sm:grid-cols-2">
              {dishList.map((d) => (
                <li key={d.id} className="flex items-center gap-6">
                  <Link href={`/cooking/${d.slug}`} tabIndex={-1} aria-hidden="true" className="shrink-0">
                    {d.imageUrl ? (
                      <span className="relative block h-28 w-28 overflow-hidden rounded-full shadow-[0_14px_18px_rgba(0,0,0,.5)] sm:h-36 sm:w-36">
                        <Image unoptimized={!isOptimizable(d.imageUrl)} src={d.imageUrl} alt="" fill sizes="144px" className="object-cover" />
                      </span>
                    ) : (
                      <Plate name={d.dishName} className="w-28 drop-shadow-[0_14px_18px_rgba(0,0,0,.5)] sm:w-36" />
                    )}
                  </Link>
                  <div className="min-w-0">
                    <Link href={`/cooking/${d.slug}`} className="ev-title ev-link inline-flex min-h-[44px] items-center text-[var(--wax)] no-underline hover:underline">{d.dishName}</Link>
                    <p className="ev-meta flex flex-wrap items-center gap-x-3 gap-y-1 text-[var(--sage)]">
                      <span>{d.category}</span>
                      <Rating n={d.rating} size="sm" className="text-[var(--sage)]" />
                      <span>{fmtDate(d.cookDate)}</span>
                    </p>
                    {d.ingredients.length > 0 && <p className="mt-2 text-sm text-[var(--sage)]">{shorten(d.ingredients.join(', '), 90)}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* the reading */}
      <section aria-labelledby="home-blog" className={`${wrap} py-24`}>
        <div data-mv="wipe"><SectionHead id="home-blog" title="The reading" name="Writing" text="Each post arrives as an invitation." href="/blog" linkLabel="All the posts" /></div>
        {postList.length === 0 ? (
          <Empty title="No pages written yet" text="The first post goes here." />
        ) : (
          <ul data-mv="flip" className="grid gap-8 md:grid-cols-3">
            {postList.map((p, i) => (
              <li key={p.id}>
                <Link href={`/blog/${p.slug}`} className="ev-card group relative block h-full px-6 pb-7 pt-12 transition-transform duration-500 ease-[var(--ease-ev)] hover:-translate-y-2 hover:-rotate-1 focus-visible:-translate-y-2">
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-9 origin-top bg-[var(--claret)] transition-transform duration-500 group-hover:[transform:rotateX(180deg)] group-focus-visible:[transform:rotateX(180deg)]" style={{ clipPath: 'polygon(0 0,100% 0,50% 100%)' }} />
                  <span aria-hidden="true" className="ev-name block text-3xl text-[var(--claret)]">{i === 0 ? 'Newest' : 'You are invited'}</span>
                  <span className="ev-title mt-3 block leading-snug">{p.title}</span>
                  <span className="ev-soft mt-2 block text-sm">{shorten(p.excerpt, 130)}</span>
                  <span className="ev-meta ev-soft mt-3 block">{fmtDate(p.publishDate)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* place cards */}
      {noteList.length > 0 && (
        <section aria-labelledby="home-notes" className="overflow-hidden bg-[var(--cloth-deep)]">
          <div className={`${wrap} py-24`}>
            <div data-mv="wipe"><SectionHead id="home-notes" title="Place cards" name="Notes" text="Short notes, propped up where you can read them." href="/notes" linkLabel="All the notes" /></div>
            <ul data-mv="fan" className="mt-4 flex flex-wrap justify-center gap-4 pb-6 sm:flex-nowrap sm:justify-start sm:gap-0">
              {noteList.map((n, i) => (
                <li key={n.id} className="sm:-ml-4 sm:first:ml-0" style={{ transform: `rotate(${(i - (noteList.length - 1) / 2) * 4}deg)`, zIndex: i }}>
                  <Link href={`/notes/${n.slug}`} className="ev-card block h-44 w-44 px-4 py-4 transition-transform duration-300 ease-[var(--ease-ev)] hover:-translate-y-3 focus-visible:-translate-y-3" style={{ outlineOffset: -5 }}>
                    <span aria-hidden="true" className="ev-name block text-2xl text-[var(--claret)]">{n.category ?? 'Note'}</span>
                    <span className="ev-serif mt-2 block text-lg leading-snug">{shorten(n.title, 54)}</span>
                    <span className="ev-meta ev-soft mt-2 block">{fmtDate(n.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* the workbench */}
      {projectList.length > 0 && (
        <section aria-labelledby="home-bench" className={`${wrap} py-24`}>
          <div data-mv="wipe"><SectionHead id="home-bench" title="The workbench" name="Projects" href="/projects" linkLabel="See the build sheets" /></div>
          <ul data-mv="deal" className="grid gap-6 sm:grid-cols-2">
            {projectList.map((p) => (
              <li key={p.id} className="ev-card px-6 py-6">
                <p className="ev-title">{p.title}</p>
                <p className="ev-soft mt-2">{shorten(p.description, 120)}</p>
                {p.techStack.length > 0 && <p className="ev-meta ev-soft mt-3">{p.techStack.slice(0, 5).join(', ')}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* the guestbook */}
      <section id="guest-note" aria-labelledby="home-guest" className="scroll-mt-16 bg-[var(--cloth-deep)]">
        <div className={`${wrap} grid gap-10 py-24 lg:grid-cols-[1fr_1.1fr] lg:items-start`}>
          <div>
            <p aria-hidden="true" className="ev-name text-5xl text-[var(--candle)]">For you</p>
            <h2 id="home-guest" className="ev-h2 text-[var(--wax)]">Leave a note at the table</h2>
            <p className="mt-3 max-w-[44ch] text-[var(--sage)]">The ninth place is yours. One line is plenty. Links get sent back, so keep it to words.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="ev-btn ev-btn-line"><Linkedin className="h-5 w-5" /> LinkedIn</a>
              <a href={socials.github} target="_blank" rel="noopener noreferrer" className="ev-btn ev-btn-line"><Github className="h-5 w-5" /> GitHub</a>
            </div>
          </div>
          <div data-mv="unroll" className="ev-card px-5 pb-8 pt-8 sm:px-8">
            <GuestForm idPrefix="home-note" />
            {guest && (
              <figure className="mt-6 border-t border-[rgb(184_138_68/0.6)] pt-4">
                <figcaption className="ev-meta ev-soft">Last note in the guestbook</figcaption>
                <blockquote className="ev-serif mt-1 text-2xl [overflow-wrap:anywhere]">
                  &ldquo;{guest.message}&rdquo; {guest.emoji && <span aria-hidden="true">{guest.emoji}</span>}
                </blockquote>
              </figure>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
