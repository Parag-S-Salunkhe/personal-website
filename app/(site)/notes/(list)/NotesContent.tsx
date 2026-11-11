'use client'
import { useMemo, useState } from 'react'
import type { Note } from '@/lib/content'
import Filters from '@/components/site/Filters'
import { Empty } from '@/components/site/SectionHead'
import NoteGrid from '@/components/site/writing/NoteGrid'

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
    return <Empty title="No notes on the table yet" text="Short thoughts and lists will be set out here." href="/" cta="Back to the front page" />
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
        <NoteGrid notes={shown} />
      )}
    </>
  )
}
