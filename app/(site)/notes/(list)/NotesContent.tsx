'use client'
import { useMemo, useState } from 'react'
import type { Note } from '@/lib/content'
import { tilt } from '@/lib/format'
import Filters from '@/components/zine/Filters'
import NoteScrap from '@/components/zine/NoteScrap'
import Settle from '@/components/zine/Settle'
import { Empty } from '@/components/zine/SectionHead'

export default function NotesContent({ notes }: { notes: Note[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('ALL')

  const chips = useMemo(() => {
    const cats = Array.from(new Set(notes.map((n) => n.category).filter((c): c is string => !!c))).sort()
    return [{ value: 'ALL', label: 'Everything' }, ...cats.map((c) => ({ value: c, label: c }))]
  }, [notes])

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return notes.filter(
      (n) => (category === 'ALL' || n.category === category) && (!q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)),
    )
  }, [notes, query, category])

  if (notes.length === 0) {
    return <Empty title="No notes on the fridge yet" text="Short thoughts and lists will get stuck up here." href="/" cta="Back to the front page" />
  }

  return (
    <>
      <Filters
        idPrefix="notes"
        query={query}
        onQuery={setQuery}
        searchLabel="Find a note"
        placeholder="A word from the note"
        chips={chips}
        chip={category}
        onChip={setCategory}
        chipsLabel="Show a kind of note"
        count={shown.length}
        noun={['note', 'notes']}
      />
      {shown.length === 0 ? (
        <Empty title="Nothing matches that" text="Try a shorter search, or show everything again." />
      ) : (
        <ul className="grid grid-cols-1 gap-8 min-[420px]:grid-cols-2 lg:grid-cols-4">
          {shown.map((n, i) => (
            <li key={n.id}>
              <Settle rotate={tilt(i * 3)} delay={(i % 4) * 0.05} className="h-full">
                <NoteScrap note={n} headingLevel="h2" />
              </Settle>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
