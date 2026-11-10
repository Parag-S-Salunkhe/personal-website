import { getLabData } from '@/components/lab/data'
import Hero from '@/components/lab/bold-kitchen/Hero'
import SectionTiles from '@/components/lab/bold-kitchen/SectionTiles'
import { BlogRow, CookingRow, MoviesRow, NotesRow } from '@/components/lab/bold-kitchen/Rows'
import { Footer, TopBar } from '@/components/lab/bold-kitchen/Chrome'

export const dynamic = 'force-dynamic'

export default async function BoldKitchenPage() {
  const data = await getLabData()
  return (
    <>
      <TopBar />
      <main id="bk-main">
        <Hero />
        <SectionTiles data={data} />
        <MoviesRow movies={data.movies} />
        <CookingRow dishes={data.dishes} />
        <BlogRow posts={data.posts} />
        <NotesRow notes={data.notes} projects={data.projects} />
      </main>
      <Footer guestbook={data.guestbook} />
    </>
  )
}
