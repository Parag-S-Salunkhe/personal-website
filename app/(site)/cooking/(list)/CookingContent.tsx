'use client'
import { useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import type { Dish } from '@/lib/content'
import Filters from '@/components/site/Filters'
import { Empty } from '@/components/site/SectionHead'
import { useReducedMotion } from '@/components/site/hooks'
import DishCard from '@/components/site/cooking/DishCard'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const SORTS = [
  { value: 'date', label: 'Latest cooked' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'name', label: 'Name, A to Z' },
]

export default function CookingContent({ dishes }: { dishes: Dish[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('ALL')
  const [sort, setSort] = useState('date')
  const reduced = useReducedMotion()
  const grid = useRef<HTMLUListElement>(null)

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

  // Cards stand up like pop-up pages: hinged at the bottom edge, rotateX(-80deg) to 0 with a spring overshoot.
  const key = shown.map((d) => d.id).join('|')
  useGSAP(() => {
    const el = grid.current
    if (!el || reduced) return
    const items = gsap.utils.toArray<HTMLElement>(el.querySelectorAll('[data-pop]'))
    if (!items.length) return
    gsap.set(items, { rotateX: -80, transformOrigin: '50% 100%', opacity: 0.001 })
    const triggers = ScrollTrigger.batch(items, {
      start: 'top 92%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { rotateX: 0, opacity: 1, duration: 0.9, ease: 'back.out(1.7)', stagger: 0.12, overwrite: true, clearProps: 'transform,opacity' }),
    })
    return () => { triggers.forEach((t) => t.kill()); gsap.set(items, { clearProps: 'transform,opacity' }) }
  }, { scope: grid, dependencies: [key, reduced] })

  if (dishes.length === 0) {
    return <Empty title="The kitchen is quiet" text="The first recipe goes here: the dish, what went into it, and how it went." href="/" cta="Back to the front page" />
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
        <ul ref={grid} className="grid items-stretch gap-8 [perspective:1400px] sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((d) => (
            <li key={d.id} data-pop className="will-change-transform">
              <DishCard dish={d} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
