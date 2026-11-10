import { withPosters, type LabData } from '@/components/lab/kit/data'
import type { StoryData } from './timeline'

const short = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s)

/** Serialisable props for the 3D story and its overlays, built from real rows. */
export function buildStory(d: LabData): StoryData {
  const g = d.guestNotes[0]
  return {
    films: withPosters(d.movies).slice(0, 6).map((m) => ({ id: m.id, title: m.title, rating: m.rating, watchDate: m.watchDate, posterUrl: m.posterUrl as string })),
    dishes: d.dishes.slice(0, 3).map((x) => ({ id: x.id, name: x.dishName, category: x.category, rating: x.rating, review: short(x.review, 90), cookDate: x.cookDate })),
    toasts: d.posts.slice(0, 3).map((p) => ({ title: p.title, date: p.publishDate, kind: p.blogType ?? 'Post' })),
    notes: d.notes.slice(0, 3).map((n) => ({ title: n.title, category: n.category ?? 'Note' })),
    door: g ? { message: short(g.message, 120), date: g.createdAt } : null,
    moviesCount: d.movies.length,
  }
}
