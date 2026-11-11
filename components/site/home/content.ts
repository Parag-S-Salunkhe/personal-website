// Server-safe helpers for the home story: map lib/content rows to what the 3D scenes and the seat cards need.
// Adapted from components/lab/table-for-eight/content.ts (run 2 home).
import type { Dish, GuestNote, Movie, Note, Post, Project } from '@/lib/content'
import { fmtDate, fmtRating } from '@/lib/format'
import { siteImg, textureSafe } from '@/components/site/img'
import type { SeatCard } from './seats'

export const shorten = (s: string, n = 110) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s)

export type HomeRows = { movies: Movie[]; dishes: Dish[]; posts: Post[]; notes: Note[]; projects: Project[]; guests: GuestNote[] }

export function buildCards(d: HomeRows): SeatCard[] {
  const m = d.movies[0], c = d.dishes[0], p = d.posts[0], n = d.notes[0], pr = d.projects[0], g = d.guests[0]
  return [
    { key: 'movies', name: 'Movies', headline: m?.title ?? 'Nothing watched yet', meta: m ? `Rated ${fmtRating(m.rating)} of 5, watched ${fmtDate(m.watchDate)}` : 'The first film goes here.', href: '/movies', cta: 'See the movies' },
    { key: 'cooking', name: 'Cooking', headline: c?.dishName ?? 'Nothing cooked yet', meta: c ? `${c.category}, rated ${fmtRating(c.rating)} of 5` : 'The first dish goes here.', href: '/cooking', cta: 'See the kitchen' },
    { key: 'writing', name: 'Writing', headline: p?.title ?? 'Nothing written yet', meta: p ? fmtDate(p.publishDate) : 'The first post goes here.', href: '/blog', cta: 'Read the blog' },
    { key: 'notes', name: 'Notes', headline: n?.title ?? 'No notes yet', meta: n ? `${n.category ?? 'Note'}, ${fmtDate(n.createdAt)}` : 'The first note goes here.', href: '/notes', cta: 'See the notes' },
    { key: 'projects', name: 'Projects', headline: pr?.title ?? 'The workbench', meta: pr ? shorten(pr.description, 80) : 'Nothing on the bench right now.', href: '/projects', cta: 'See the build sheets' },
    { key: 'guestbook', name: 'Guestbook', headline: g ? `“${shorten(g.message, 90)}”` : 'No notes left yet', meta: g ? `Left ${fmtDate(g.createdAt)}` : 'Be the first to leave one.', href: '#guest-note', cta: 'Read the guestbook' },
    { key: 'you-a', name: 'For you', headline: 'An empty chair', meta: 'Pull it out and stay a while.', href: '#guest-note', cta: 'Pull up a chair' },
    { key: 'you-b', name: 'For you', headline: 'Leave a note at the table', meta: 'The ninth place is yours.', href: '#guest-note', cta: 'Write a note' },
  ]
}

/** What the 3D props on the table need, all from real rows. */
export type StageData = {
  posterUrl: string | null
  movieTitle: string
  dishName: string
  dishCategory: string
  postTitle: string
  postExcerpt: string
  noteTitles: string[]
}

export function buildStage(d: HomeRows): StageData {
  const m = d.movies.find((x) => textureSafe(x.posterUrl)) ?? d.movies[0]
  const c = d.dishes[0], p = d.posts[0]
  return {
    posterUrl: m && textureSafe(m.posterUrl) ? siteImg(m.posterUrl, 640) : null,
    movieTitle: m?.title ?? '',
    dishName: c?.dishName ?? '',
    dishCategory: c?.category ?? '',
    postTitle: p?.title ?? '',
    postExcerpt: p ? shorten(p.excerpt, 120) : '',
    noteTitles: d.notes.slice(0, 5).map((n) => n.title),
  }
}

/** A film on the projector screen: the poster is a same-origin texture URL, or null for a warm blank frame. */
export type LateFilm = { title: string; rating: number; watched: string; posterUrl: string | null }

export function buildFilms(movies: Movie[]): LateFilm[] {
  const withPoster = movies.filter((m) => textureSafe(m.posterUrl)).slice(0, 6)
  const pick = withPoster.length ? withPoster : movies.slice(0, 6)
  return pick.map((m) => ({ title: m.title, rating: m.rating, watched: fmtDate(m.watchDate), posterUrl: textureSafe(m.posterUrl) ? siteImg(m.posterUrl, 640) : null }))
}

export type StageProps = { cards: SeatCard[]; stage: StageData; films: LateFilm[] }
