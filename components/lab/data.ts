// Shared, read-only data loader for the /lab prototypes (server only).
// Dates are serialised to ISO strings so results can go straight to client components.
import { prisma } from '@/lib/prisma'

export type LabMovie = { id: string; title: string; type: 'MOVIE' | 'SERIES'; rating: number; review: string; watchDate: string; posterUrl: string | null }
export type LabDish = { id: string; dishName: string; category: string; rating: number; review: string; imageUrl: string | null; ingredients: string[]; cookDate: string }
export type LabPost = { id: string; title: string; excerpt: string; blogType: string | null; imageUrl: string | null; publishDate: string }
export type LabNote = { id: string; title: string; excerpt: string; category: string | null; createdAt: string }
export type LabProject = { id: string; title: string; description: string; techStack: string[] }
export type LabGuestNote = { id: string; message: string; emoji: string | null; createdAt: string }
export type LabData = { movies: LabMovie[]; dishes: LabDish[]; posts: LabPost[]; notes: LabNote[]; projects: LabProject[]; guestbook: LabGuestNote[] }

const excerpt = (text: string, n = 180) => (text.length > n ? text.slice(0, n).replace(/\s+\S*$/, '') + '…' : text)

export async function getLabData(): Promise<LabData> {
  const [movies, dishes, posts, notes, projects, guestbook] = await Promise.all([
    prisma.movie.findMany({ orderBy: { watchDate: 'desc' }, take: 12 }),
    prisma.cooking.findMany({ orderBy: { cookDate: 'desc' }, take: 12 }),
    prisma.blog.findMany({ orderBy: { publishDate: 'desc' }, take: 6 }),
    prisma.note.findMany({ orderBy: { createdAt: 'desc' }, take: 6 }),
    prisma.project.findMany({ orderBy: { createdAt: 'desc' }, take: 6 }),
    prisma.guestbookMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 6, select: { id: true, message: true, emoji: true, createdAt: true } }),
  ])
  return {
    movies: movies.map((m) => ({ id: m.id, title: m.title, type: m.type, rating: m.rating, review: m.review, watchDate: m.watchDate.toISOString(), posterUrl: m.posterUrl })),
    dishes: dishes.map((d) => ({ id: d.id, dishName: d.dishName, category: d.category, rating: d.rating, review: d.review, imageUrl: d.imageUrl, ingredients: d.ingredients, cookDate: d.cookDate.toISOString() })),
    posts: posts.map((p) => ({ id: p.id, title: p.title, excerpt: excerpt(p.content), blogType: p.blogType, imageUrl: p.imageUrl, publishDate: p.publishDate.toISOString() })),
    notes: notes.map((n) => ({ id: n.id, title: n.title, excerpt: excerpt(n.content, 120), category: n.category, createdAt: n.createdAt.toISOString() })),
    projects: projects.map((p) => ({ id: p.id, title: p.title, description: p.description, techStack: p.techStack })),
    guestbook: guestbook.map((g) => ({ ...g, createdAt: g.createdAt.toISOString() })),
  }
}
