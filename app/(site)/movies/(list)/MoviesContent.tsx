'use client'
import { useMemo, useState } from 'react'
import type { Movie } from '@/lib/content'
import Filters from '@/components/site/Filters'
import { Empty } from '@/components/site/SectionHead'
import PosterGrid from '@/components/site/movies/PosterGrid'

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
        <PosterGrid movies={shown} />
      )}
    </>
  )
}
