import type { Metadata } from 'next'
import Link from 'next/link'
import { getDishes, getGuestNotes, getMovies, getNotes, getPosts, getProjects } from '@/lib/content'
import { tilt } from '@/lib/format'
import HomeHero from '@/components/zine/HomeHero'
import CountVisit from '@/components/zine/CountVisit'
import { CutLine, NoPoster, Plate } from '@/components/zine/Marks'
import { Empty, SectionHead } from '@/components/zine/SectionHead'
import Settle from '@/components/zine/Settle'
import MovieCard from '@/components/zine/MovieCard'
import DishCard from '@/components/zine/DishCard'
import PostSpread from '@/components/zine/PostSpread'
import NoteScrap from '@/components/zine/NoteScrap'
import { JsonLd, author, person } from '@/lib/jsonld'
import { siteName, siteUrl, ogBase } from '@/lib/site'

export const revalidate = 3600

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { ...ogBase, url: '/' },
}

// On phones each row is a swipeable strip; from lg up it's a four-column spread.
const strip = 'scroller -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-6 pt-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-8 lg:overflow-visible lg:px-0'

export default async function HomePage() {
  const [movies, dishes, posts, notes, guests, projects] = await Promise.all([
    getMovies(), getDishes(), getPosts(), getNotes(), getGuestNotes(1), getProjects(),
  ])

  return (
    <>
      <CountVisit />
      <JsonLd data={{ '@graph': [
        { '@type': 'WebSite', '@id': `${siteUrl}/#website`, url: `${siteUrl}/`, name: siteName, inLanguage: 'en-IE', publisher: author,
          description: 'Supper clubs, movie nights and home cooking: what Parag watched, cooked and wrote down.' },
        person,
      ] }} />
      <HomeHero guest={guests[0] ?? null} />

      <CutLine />
      <section aria-labelledby="home-movies" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHead id="home-movies" title="Movies" scribble="double bill, dessert at the interval" href="/movies" linkLabel="All the movies" />
        {movies.length === 0 ? (
          <Empty title="Nothing on the projector yet" text="The first double bill will land here." art={<div className="relative aspect-[2/3]"><NoPoster /></div>} />
        ) : (
          <ul className={strip}>
            {movies.slice(0, 8).map((m, i) => (
              <li key={m.id} className="w-[64%] shrink-0 snap-start sm:w-[40%] lg:w-auto">
                <Settle rotate={tilt(i)} delay={(i % 4) * 0.06} className="relative">
                  <MovieCard movie={m} />
                </Settle>
              </li>
            ))}
          </ul>
        )}
      </section>

      <CutLine />
      <section aria-labelledby="home-cooking" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHead id="home-cooking" title="Cooking" scribble="clipped from the Sunday pile" href="/cooking" linkLabel="All the dishes" />
        {dishes.length === 0 ? (
          <Empty title="The kitchen is quiet" text="The first recipe clipping goes here." art={<Plate />} />
        ) : (
          <ul className={`${strip} items-start`}>
            {dishes.slice(0, 8).map((d, i) => (
              <li key={d.id} className="w-[78%] shrink-0 snap-start sm:w-[46%] lg:w-auto">
                <Settle rotate={tilt(i + 3, 0.5)} delay={(i % 4) * 0.06}>
                  <DishCard dish={d} index={i} />
                </Settle>
              </li>
            ))}
          </ul>
        )}
      </section>

      <CutLine />
      <section aria-labelledby="home-blog" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHead id="home-blog" title="Blog" scribble="things I wrote down" href="/blog" linkLabel="All the posts" />
        {posts.length === 0 ? (
          <Empty title="No pages written yet" text="The first spread goes here." />
        ) : (
          <ul className="grid gap-8 md:grid-cols-2">
            {posts.slice(0, 4).map((p, i) => (
              <li key={p.id}>
                <Settle rotate={i % 2 ? 0.6 : -0.6}>
                  <PostSpread post={p} />
                </Settle>
              </li>
            ))}
          </ul>
        )}
      </section>

      {notes.length > 0 && (
        <>
          <CutLine />
          <section aria-labelledby="home-notes" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <SectionHead id="home-notes" title="Notes" scribble="scraps from my pockets" href="/notes" linkLabel="All the notes" />
            <ul className="grid grid-cols-1 gap-6 min-[420px]:grid-cols-2 sm:gap-8 lg:grid-cols-4">
              {notes.slice(0, 4).map((n, i) => (
                <li key={n.id}>
                  <Settle rotate={tilt(i * 3)} className="h-full">
                    <NoteScrap note={n} />
                  </Settle>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {projects.length > 0 && (
        <section aria-labelledby="home-bench" className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
          <div className="cut flex flex-wrap items-center gap-x-6 gap-y-3 bg-slip/60 px-5 py-4">
            <h2 id="home-bench" className="t-title text-2xl">On the workbench</h2>
            <ul className="flex flex-1 flex-wrap gap-x-4 gap-y-1">
              {projects.slice(0, 4).map((p) => (
                <li key={p.id} className="t-label text-lg text-ink">{p.title}</li>
              ))}
            </ul>
            <Link href="/projects" className="t-label ink-link inline-flex min-h-[44px] items-center text-xl">See the build sheets</Link>
          </div>
        </section>
      )}
    </>
  )
}
