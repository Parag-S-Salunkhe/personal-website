import Link from 'next/link'
import { Linkedin, Github } from 'lucide-react'
import { getLabData } from '@/components/lab/data'
import Table, { type TablePlace } from '@/components/lab/table-for-eight/Table'
import NoteForm from '@/components/lab/table-for-eight/NoteForm'
import { MovieRow, DishRow, PostRow, NoteRow } from '@/components/lab/table-for-eight/Courses'
import styles from '@/components/lab/table-for-eight/styles.module.css'

export const dynamic = 'force-dynamic'

const linkCls = `${styles.focusRing} inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--sage)]/50 px-4 text-base font-semibold text-[var(--wax)] transition-colors duration-300 hover:border-[var(--candle)] hover:text-[var(--candle)]`

export default async function Page() {
  const data = await getLabData()
  const g = data.guestbook[0]
  const places: TablePlace[] = [
    { key: 'movies', name: 'Movies', href: '/movies', blurb: 'the film course', latest: data.movies[0]?.title ?? null },
    { key: 'cooking', name: 'Cooking', href: '/cooking', blurb: 'from the kitchen', latest: data.dishes[0]?.dishName ?? null },
    { key: 'blog', name: 'Blog', href: '/blog', blurb: 'long thoughts', latest: data.posts[0]?.title ?? null },
    { key: 'notes', name: 'Notes', href: '/notes', blurb: 'scraps and lists', latest: data.notes[0]?.title ?? null },
    { key: 'projects', name: 'Projects', href: '/projects', blurb: 'things I tinker with', latest: data.projects[0]?.title ?? null },
    { key: 'guestbook', name: 'Guests', href: '#leave-a-note', blurb: 'who stopped by', latest: g ? g.message : null },
    { key: 'you1', name: 'For you', href: '#leave-a-note', blurb: 'an empty chair', latest: null, empty: true },
    { key: 'you2', name: 'For you', href: '#leave-a-note', blurb: 'and another', latest: null, empty: true },
  ]
  return (
    <main className="pb-8">
      <div className="mx-auto grid w-full max-w-[1280px] gap-6 px-4 pb-4 pt-6 sm:px-8 sm:pt-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-x-12 lg:grid-rows-[auto_1fr] lg:gap-y-6">
        <header className="lg:col-start-1 lg:row-start-1">
          <div className="rounded-[10px] bg-[var(--linen)] p-6 text-[var(--ink)] shadow-[0_24px_40px_-24px_rgba(0,0,0,.8)] sm:p-8">
            <p className={`${styles.script} text-3xl leading-none text-[var(--claret)]`}>Parag&rsquo;s table</p>
            <h1 className={`${styles.display} mt-3 text-5xl leading-[1.02] tracking-[-0.02em] sm:text-6xl`}>Pull up a chair.</h1>
            <p className={`${styles.pretty} mt-4 max-w-md text-base text-[var(--ink-soft)] sm:text-lg`}>
              I cook, watch too many films and keep a long table. Everything I make, watch and write has a place at it. Sit anywhere, the candles are lit.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a href="#leave-a-note" className="inline-flex min-h-[48px] items-center rounded-full bg-[var(--claret)] px-6 text-base font-semibold text-[var(--wax)] shadow-[0_8px_16px_-8px_rgba(124,34,54,.8)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:translate-y-px active:scale-[.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--claret)]">
                Leave a note
              </a>
              <a href="https://www.linkedin.com/in/parag-salunkhe" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--ink-soft)]/50 px-4 text-base font-semibold text-[var(--ink)] hover:border-[var(--claret)] hover:text-[var(--claret)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--claret)]">
                <Linkedin className="h-4 w-4" aria-hidden="true" /> LinkedIn
              </a>
              <a href="https://github.com/Parag-S-Salunkhe" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--ink-soft)]/50 px-4 text-base font-semibold text-[var(--ink)] hover:border-[var(--claret)] hover:text-[var(--claret)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--claret)]">
                <Github className="h-4 w-4" aria-hidden="true" /> GitHub
              </a>
            </div>
          </div>
        </header>
        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <Table places={places} />
        </div>
        <div className="self-start lg:col-start-1 lg:row-start-2">
          <NoteForm scraps={data.guestbook.map((x) => ({ id: x.id, message: x.message, emoji: x.emoji }))} />
        </div>
      </div>

      <MovieRow movies={data.movies} />
      <DishRow dishes={data.dishes} />
      <PostRow posts={data.posts} />
      <NoteRow notes={data.notes} />

      <footer className="mx-auto mt-24 w-full max-w-[1280px] px-4 sm:px-8">
        <div className="flex flex-col gap-6 border-t border-dashed border-[var(--sage)]/40 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className={`${styles.script} text-4xl leading-none text-[var(--wax)]`}>Thanks for stopping by.</p>
          <nav aria-label="Sections" className="flex flex-wrap gap-x-2 gap-y-1">
            {[['Movies', '/movies'], ['Cooking', '/cooking'], ['Blog', '/blog'], ['Notes', '/notes'], ['Projects', '/projects']].map(([l, h]) => (
              <Link key={h} href={h} className={`${styles.focusRing} inline-flex min-h-[44px] items-center px-2 text-base font-semibold text-[var(--sage)] underline-offset-4 hover:text-[var(--candle)] hover:underline`}>{l}</Link>
            ))}
          </nav>
        </div>
      </footer>
    </main>
  )
}
