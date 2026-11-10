import { getLabData } from '@/components/lab/data'
import Hero from '@/components/lab/late-show/Hero'
import MoviesRow from '@/components/lab/late-show/MoviesRow'
import DishesRow from '@/components/lab/late-show/DishesRow'
import PostsRow from '@/components/lab/late-show/PostsRow'
import NotesRow from '@/components/lab/late-show/NotesRow'
import Footer from '@/components/lab/late-show/Footer'

export const dynamic = 'force-dynamic'

export default async function LateShowPage() {
  const data = await getLabData()
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-[var(--beam)] focus:px-4 focus:py-3 focus:text-[var(--velvet)]">Skip to content</a>
      <main id="main">
        <Hero lastNote={data.guestbook[0] ?? null} />
        <MoviesRow movies={data.movies} />
        <DishesRow dishes={data.dishes} />
        <PostsRow posts={data.posts} />
        <NotesRow notes={data.notes} />
      </main>
      <Footer />
    </>
  )
}
