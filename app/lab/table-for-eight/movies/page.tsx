import LabTag from '@/components/lab/kit/LabTag'
import { getMovies } from '@/lib/content'
import MenuCard from '@/components/lab/table-for-eight/MenuCard'
import { BASE } from '@/components/lab/table-for-eight/content'

export const metadata = { title: 'The film course · Table for eight' }
export const revalidate = 3600

export default async function Page() {
  const movies = await getMovies()
  return (
    <main className="min-h-[100dvh] text-[#F1EEE6]" style={{ background: 'radial-gradient(80% 50% at 50% 0%, #1f4a3a 0%, #17352A 45%, #10281F 100%)' }}>
      <LabTag title="The film course" />
      <MenuCard back={BASE} movies={movies.map((m) => ({ id: m.id, title: m.title, rating: m.rating, review: m.review, watchDate: m.watchDate, posterUrl: m.posterUrl, type: m.type }))} />
    </main>
  )
}
