// Server-only data loader for /lab pages. Real rows from the local DB (sample rows are seeded by
// .claude/redesign-v3/tools/seed.mjs). Never hardcode seeded strings in components: read them here.
import { getDishes, getGuestNotes, getMovies, getNotes, getPosts, getProjects, type Dish, type GuestNote, type Movie, type Note, type Post, type Project } from '@/lib/content'

export type LabMovie = Movie
export type LabDish = Dish
export type LabPost = Omit<Post, 'content'>
export type LabNote = Omit<Note, 'content'>
export type LabProject = Project
export type LabGuestNote = GuestNote
export type LabData = { movies: LabMovie[]; dishes: LabDish[]; posts: LabPost[]; notes: LabNote[]; projects: LabProject[]; guestNotes: LabGuestNote[] }

export async function getLabData(): Promise<LabData> {
  const [movies, dishes, posts, notes, projects, guestNotes] = await Promise.all([getMovies(), getDishes(), getPosts(), getNotes(), getProjects(), getGuestNotes(8)])
  return {
    movies: movies.slice(0, 12),
    dishes: dishes.slice(0, 10),
    posts: posts.slice(0, 6).map(({ content: _c, ...p }) => p),
    notes: notes.slice(0, 8).map(({ content: _c, ...n }) => n),
    projects: projects.slice(0, 6),
    guestNotes,
  }
}

/** Movies that have a poster, for scenes that need images. */
export const withPosters = (movies: LabMovie[]) => movies.filter((m) => !!m.posterUrl)
