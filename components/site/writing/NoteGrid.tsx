'use client'
import { useRef } from 'react'
import type { Note } from '@/lib/content'
import PlaceCard from './PlaceCard'
import { useEntrance } from './useEntrance'
import './writing.css'

export default function NoteGrid({ notes, headingLevel = 'h2' }: { notes: Note[]; headingLevel?: 'h2' | 'h3' }) {
  const ref = useRef<HTMLUListElement>(null)
  const pre = useEntrance(ref, 'stand')
  return (
    <>
      <noscript><style>{'.wr-pre-stand{opacity:1!important;transform:none!important}'}</style></noscript>
      <ul ref={ref} className="grid grid-cols-1 gap-8 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {notes.map((n) => (
          <li key={n.id} data-enter className={pre ? 'wr-pre-stand' : ''}>
            <PlaceCard note={n} headingLevel={headingLevel} />
          </li>
        ))}
      </ul>
    </>
  )
}
