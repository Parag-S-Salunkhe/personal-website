'use client'
import { useMemo, useState } from 'react'
import type { Movie } from '@/lib/content'
import { tilt } from '@/lib/format'
import Filters from '@/components/zine/Filters'
import MovieCard from '@/components/zine/MovieCard'
import Settle from '@/components/zine/Settle'
import { Empty } from '@/components/zine/SectionHead'
import { NoPoster } from '@/components/zine/Marks'

const CHIPS = [
  { value: 'ALL', label: 'Everything' },
  { value: 'MOVIE', label: 'Films' },
  { value: 'SERIES', label: 'Series' },
]
const SORTS = [
  { value: 'date', label: 'Latest watched' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'title', label: 'Title, A to Z' },
]

export default function MoviesContent({ movies }: { movies: Movie[] }) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('ALL')
  const [sort, setSort] = useState('date')

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = movies.filter(
      (m) => (type === 'ALL' || m.type === type) && (!q || m.title.toLowerCase().includes(q) || m.review.toLowerCase().includes(q)),
    )
    return [...list].sort((a, b) =>
      sort === 'rating' ? b.rating - a.rating || b.watchDate.localeCompare(a.watchDate)
        : sort === 'title' ? a.title.localeCompare(b.title)
          : b.watchDate.localeCompare(a.watchDate),
    )
  }, [movies, query, type, sort])

  if (movies.length === 0) {
    return (
      <Empty
        title="Nothing on the projector yet"
        text="The first double bill will land here, with a score and a few lines on each."
        href="/"
        cta="Back to the front page"
        art={<div className="relative aspect-[2/3]"><NoPoster /></div>}
      />
    )
  }

  return (
    <>
      <Filters
        idPrefix="movies"
        query={query}
        onQuery={setQuery}
        searchLabel="Find a title"
        placeholder="Title or a word from the review"
        chips={CHIPS}
        chip={type}
        onChip={setType}
        chipsLabel="Show films or series"
        sort={sort}
        onSort={setSort}
        sortOptions={SORTS}
        count={shown.length}
        noun={['title', 'titles']}
      />
      {shown.length === 0 ? (
        <Empty
          title="Nothing matches that"
          text="Try a shorter search, or show everything again."
        />
      ) : (
        <ul className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-4">
          {shown.map((m, i) => (
            <li key={m.id}>
              <Settle rotate={tilt(i)} delay={(i % 4) * 0.05} className="relative">
                <MovieCard movie={m} headingLevel="h2" priority={i < 2} sizes="(min-width: 1024px) 270px, (min-width: 640px) 30vw, 45vw" />
              </Settle>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
