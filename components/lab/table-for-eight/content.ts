// Shared (server-safe) helpers for the Table for Eight direction.
import type { LabData } from '@/components/lab/kit/data'
import type { SeatCard } from './seats'

export const BASE = '/lab/table-for-eight'
export const shorten = (s: string, n = 110) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s)
export const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })

export function buildCards(d: LabData): SeatCard[] {
  const m = d.movies[0], c = d.dishes[0], p = d.posts[0], n = d.notes[0], pr = d.projects[0], g = d.guestNotes[0]
  return [
    { key: 'movies', name: 'Movies', headline: m?.title ?? 'Nothing watched yet', meta: m ? `${m.rating}/5 · ${fmt(m.watchDate)}` : '', href: `${BASE}/movies` },
    { key: 'cooking', name: 'Cooking', headline: c?.dishName ?? 'Nothing cooked yet', meta: c ? `${c.category} · ${c.rating}/5` : '', href: '/cooking' },
    { key: 'writing', name: 'Writing', headline: p?.title ?? 'Nothing written yet', meta: p ? fmt(p.publishDate) : '', href: '/blog' },
    { key: 'notes', name: 'Notes', headline: n?.title ?? 'No notes yet', meta: n ? `${n.category ?? 'Note'} · ${fmt(n.createdAt)}` : '', href: '/notes' },
    { key: 'projects', name: 'Projects', headline: pr?.title ?? 'No projects yet', meta: pr ? shorten(pr.description, 80) : '', href: '/projects' },
    { key: 'guestbook', name: 'Guestbook', headline: g ? `“${shorten(g.message, 90)}”` : 'No notes left yet', meta: g ? `Left ${fmt(g.createdAt)}` : '', href: null },
    { key: 'you-a', name: 'For you', headline: 'An empty chair', meta: 'Pull it out and stay a while.', href: null },
    { key: 'you-b', name: 'For you', headline: 'Leave a note at the table', meta: 'The ninth place is yours.', href: '/#guest-note' },
  ]
}

/** What the 3D props need, all from real rows. */
export type StageData = {
  posterUrl: string | null
  movieTitle: string
  dishName: string
  dishCategory: string
  postTitle: string
  postExcerpt: string
  noteTitles: string[]
}

export function buildStage(d: LabData): StageData {
  const m = d.movies.find((x) => x.posterUrl) ?? d.movies[0]
  const c = d.dishes[0], p = d.posts[0]
  return {
    posterUrl: m?.posterUrl ?? null,
    movieTitle: m?.title ?? '',
    dishName: c?.dishName ?? '',
    dishCategory: c?.category ?? '',
    postTitle: p?.title ?? '',
    postExcerpt: p ? shorten(p.excerpt, 120) : '',
    noteTitles: d.notes.slice(0, 5).map((n) => n.title),
  }
}

export const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) } return h >>> 0 }
export const stars = (n: number) => '★'.repeat(Math.round(n)) + '☆'.repeat(Math.max(0, 5 - Math.round(n)))
