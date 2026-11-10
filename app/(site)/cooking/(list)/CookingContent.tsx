'use client'
import { useMemo, useState } from 'react'
import type { Dish } from '@/lib/content'
import { tilt } from '@/lib/format'
import Filters from '@/components/zine/Filters'
import DishCard from '@/components/zine/DishCard'
import Settle from '@/components/zine/Settle'
import { Empty } from '@/components/zine/SectionHead'
import { Plate } from '@/components/zine/Marks'

const SORTS = [
  { value: 'date', label: 'Latest cooked' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'name', label: 'Name, A to Z' },
]

export default function CookingContent({ dishes }: { dishes: Dish[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('ALL')
  const [sort, setSort] = useState('date')

  const chips = useMemo(() => {
    const cats = Array.from(new Set(dishes.map((d) => d.category).filter(Boolean))).sort()
    return [{ value: 'ALL', label: 'Everything' }, ...cats.map((c) => ({ value: c, label: c }))]
  }, [dishes])

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = dishes.filter(
      (d) =>
        (category === 'ALL' || d.category === category) &&
        (!q || d.dishName.toLowerCase().includes(q) || d.ingredients.some((i) => i.toLowerCase().includes(q)) || d.review.toLowerCase().includes(q)),
    )
    return [...list].sort((a, b) =>
      sort === 'rating' ? b.rating - a.rating || b.cookDate.localeCompare(a.cookDate)
        : sort === 'name' ? a.dishName.localeCompare(b.dishName)
          : b.cookDate.localeCompare(a.cookDate),
    )
  }, [dishes, query, category, sort])

  if (dishes.length === 0) {
    return (
      <Empty
        title="The kitchen is quiet"
        text="The first recipe clipping goes here: the dish, what went into it, and how it went."
        href="/"
        cta="Back to the front page"
        art={<Plate />}
      />
    )
  }

  return (
    <>
      <Filters
        idPrefix="cooking"
        query={query}
        onQuery={setQuery}
        searchLabel="Find a dish"
        placeholder="Dish or an ingredient"
        chips={chips}
        chip={category}
        onChip={setCategory}
        chipsLabel="Show a course"
        sort={sort}
        onSort={setSort}
        sortOptions={SORTS}
        count={shown.length}
        noun={['dish', 'dishes']}
      />
      {shown.length === 0 ? (
        <Empty title="Nothing matches that" text="Try one ingredient, or show everything again." />
      ) : (
        <ul className="grid items-start gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((d, i) => (
            <li key={d.id}>
              <Settle rotate={tilt(i + 3, 0.5)} delay={(i % 3) * 0.05}>
                <DishCard dish={d} index={i} headingLevel="h2" />
              </Settle>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
