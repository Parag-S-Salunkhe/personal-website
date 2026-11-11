import type { Metadata } from 'next'
import { getDishes, getGuestNotes, getMovies, getNotes, getPosts, getProjects } from '@/lib/content'
import CountVisit from '@/components/site/CountVisit'
import Lazy from '@/components/site/home/Lazy'
import SkipIntro from '@/components/site/home/SkipIntro'
import Reveals from '@/components/site/home/Reveals'
import Courses from '@/components/site/home/Courses'
import { buildCards, buildFilms, buildStage } from '@/components/site/home/content'
import { JsonLd, author, person } from '@/lib/jsonld'
import { siteName, siteUrl, ogBase } from '@/lib/site'

export const revalidate = 3600

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { ...ogBase, url: '/' },
}

export default async function HomePage() {
  const [movies, dishes, posts, notes, guests, projects] = await Promise.all([
    getMovies(), getDishes(), getPosts(), getNotes(), getGuestNotes(1), getProjects(),
  ])
  const rows = { movies, dishes, posts, notes, projects, guests }
  const stageData = { cards: buildCards(rows), stage: buildStage(rows), films: buildFilms(movies) }

  return (
    <>
      <CountVisit />
      <JsonLd data={{ '@graph': [
        { '@type': 'WebSite', '@id': `${siteUrl}/#website`, url: `${siteUrl}/`, name: siteName, inLanguage: 'en-IE', publisher: author,
          description: 'Supper clubs, movie nights and home cooking: what Parag watched, cooked and wrote down.' },
        person,
      ] }} />

      {/* The story: one evening, scrolled. Under reduced motion the wrapper is as tall as the stage (no story). */}
      <style>{`@media (prefers-reduced-motion: reduce){[data-story]{height:auto!important}}`}</style>
      <div data-story className="relative h-[600vh] lg:h-[900vh]">
        <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
          {/* static poster frame (dusk over the terrace, one lit window); the scene fades in over it */}
          <div aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #1a2a5c 0%, #4a4a86 38%, #E9A66B 78%, #6b3b3a 100%)' }}>
            <div className="absolute inset-x-0 bottom-0 h-[34%] bg-[#10281F]" />
            <div className="absolute left-1/2 top-[66%] h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-[var(--wax)]" style={{ boxShadow: '0 0 28px 12px rgba(246,185,79,.8), -180px 6px 22px 8px rgba(246,185,79,.55), 190px 4px 22px 8px rgba(246,185,79,.55), 320px -10px 18px 6px rgba(246,185,79,.4), -330px -6px 18px 6px rgba(246,185,79,.4)' }} />
          </div>
          <Lazy data={stageData} />
          <header className="pointer-events-none absolute inset-x-0 top-0 z-10 px-4 pt-24 sm:px-12 sm:pt-28" style={{ opacity: 'var(--hero, 1)' }}>
            <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-[rgb(16_40_31/0.9)] via-[rgb(16_40_31/0.6)] to-transparent" />
            <h1 className="ev-display text-[var(--wax)]" style={{ textShadow: '0 2px 28px rgba(0,0,0,.65)' }}>Supper at Parag&rsquo;s</h1>
            <p className="mt-3 max-w-md text-lg text-[var(--wax)]" style={{ textShadow: '0 1px 16px rgba(0,0,0,.85)' }}>
              I host supper clubs and movie nights in Dublin. Scroll through one evening: the street at dusk, the table, then the film.
            </p>
          </header>
        </div>
      </div>
      <SkipIntro />

      <div id="courses" tabIndex={-1} className="outline-none">
        <Reveals>
          <Courses movies={movies} dishes={dishes} posts={posts} notes={notes} projects={projects} guest={guests[0] ?? null} />
        </Reveals>
      </div>
    </>
  )
}
