import { getLabData } from '@/components/lab/data'
import Hero from '@/components/lab/house-zine/Hero'
import Masthead from '@/components/lab/house-zine/Masthead'
import Footer from '@/components/lab/house-zine/Footer'
import { CutLine } from '@/components/lab/house-zine/Marks'
import { DishesRow, MoviesRow, NotesRow, PostsRow } from '@/components/lab/house-zine/Rows'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const data = await getLabData()
  return (
    <>
      <Masthead />
      <main id="hz-main">
        <Hero guest={data.guestbook[0] ?? null} />
        <CutLine />
        <MoviesRow movies={data.movies} />
        <CutLine />
        <DishesRow dishes={data.dishes} />
        <CutLine />
        <PostsRow posts={data.posts} />
        <CutLine />
        <NotesRow notes={data.notes} />
      </main>
      <Footer />
    </>
  )
}
