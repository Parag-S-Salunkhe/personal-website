// Server-only data access for public pages. Dates are serialised to ISO strings
// so results can be passed straight to client components.
import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { idFromSlug, itemSlug } from '@/lib/slug'

export type Movie = { id: string; slug: string; title: string; type: 'MOVIE' | 'SERIES'; rating: number; review: string; watchDate: string; posterUrl: string | null }
export type Dish = { id: string; slug: string; dishName: string; category: string; rating: number; review: string; imageUrl: string | null; videoUrl: string | null; ingredients: string[]; cookDate: string }
export type Post = { id: string; slug: string; title: string; content: string; excerpt: string; blogType: string | null; imageUrl: string | null; publishDate: string; updatedAt: string }
export type Note = { id: string; slug: string; title: string; content: string; excerpt: string; category: string | null; createdAt: string; updatedAt: string }
export type Project = { id: string; title: string; description: string; techStack: string[]; projectUrl: string | null; githubUrl: string | null; imageUrl: string | null; createdAt: string }
export type GuestNote = { id: string; message: string; emoji: string | null; createdAt: string }

export function excerpt(text: string, n = 180): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > n ? flat.slice(0, n).replace(/\s+\S*$/, '') + '…' : flat
}

type MovieRow = Awaited<ReturnType<typeof prisma.movie.findFirst>> & {}
type DishRow = Awaited<ReturnType<typeof prisma.cooking.findFirst>> & {}
type PostRow = Awaited<ReturnType<typeof prisma.blog.findFirst>> & {}
type NoteRow = Awaited<ReturnType<typeof prisma.note.findFirst>> & {}

const toMovie = (m: MovieRow): Movie => ({ id: m.id, slug: itemSlug(m.title, m.id), title: m.title, type: m.type, rating: m.rating, review: m.review, watchDate: m.watchDate.toISOString(), posterUrl: m.posterUrl })
const toDish = (d: DishRow): Dish => ({ id: d.id, slug: itemSlug(d.dishName, d.id), dishName: d.dishName, category: d.category, rating: d.rating, review: d.review, imageUrl: d.imageUrl, videoUrl: d.videoUrl, ingredients: d.ingredients, cookDate: d.cookDate.toISOString() })
const toPost = (p: PostRow): Post => ({ id: p.id, slug: itemSlug(p.title, p.id), title: p.title, content: p.content, excerpt: excerpt(p.content), blogType: p.blogType, imageUrl: p.imageUrl, publishDate: p.publishDate.toISOString(), updatedAt: p.updatedAt.toISOString() })
const toNote = (n: NoteRow): Note => ({ id: n.id, slug: itemSlug(n.title, n.id), title: n.title, content: n.content, excerpt: excerpt(n.content, 140), category: n.category, createdAt: n.createdAt.toISOString(), updatedAt: n.updatedAt.toISOString() })

export const getMovies = cache(async () => (await prisma.movie.findMany({ orderBy: { watchDate: 'desc' } })).map(toMovie))
export const getDishes = cache(async () => (await prisma.cooking.findMany({ orderBy: { cookDate: 'desc' } })).map(toDish))
export const getPosts = cache(async () => (await prisma.blog.findMany({ orderBy: { publishDate: 'desc' } })).map(toPost))
export const getNotes = cache(async () => (await prisma.note.findMany({ orderBy: { createdAt: 'desc' } })).map(toNote))
export const getProjects = cache(async (): Promise<Project[]> =>
  (await prisma.project.findMany({ orderBy: { createdAt: 'desc' } })).map((p) => ({
    id: p.id, title: p.title, description: p.description, techStack: p.techStack,
    projectUrl: p.projectUrl, githubUrl: p.githubUrl, imageUrl: p.imageUrl, createdAt: p.createdAt.toISOString(),
  })))
export const getGuestNotes = cache(async (take = 12): Promise<GuestNote[]> =>
  (await prisma.guestbookMessage.findMany({ orderBy: { createdAt: 'desc' }, take, select: { id: true, message: true, emoji: true, createdAt: true } }))
    .map((g) => ({ ...g, createdAt: g.createdAt.toISOString() })))

async function byId<T>(slug: string, find: (id: string) => Promise<T | null>): Promise<T | null> {
  const id = idFromSlug(slug)
  if (!id) return null
  try {
    return await find(id)
  } catch {
    return null
  }
}

export const getMovieBySlug = cache(async (slug: string) => {
  const row = await byId(slug, (id) => prisma.movie.findUnique({ where: { id } }))
  return row ? toMovie(row) : null
})
export const getDishBySlug = cache(async (slug: string) => {
  const row = await byId(slug, (id) => prisma.cooking.findUnique({ where: { id } }))
  return row ? toDish(row) : null
})
export const getPostBySlug = cache(async (slug: string) => {
  const row = await byId(slug, (id) => prisma.blog.findUnique({ where: { id } }))
  return row ? toPost(row) : null
})
export const getNoteBySlug = cache(async (slug: string) => {
  const row = await byId(slug, (id) => prisma.note.findUnique({ where: { id } }))
  return row ? toNote(row) : null
})
/** Old blog URLs were /blog/<id>. */
export const getPostById = cache(async (id: string) => {
  try {
    const row = await prisma.blog.findUnique({ where: { id } })
    return row ? toPost(row) : null
  } catch {
    return null
  }
})
