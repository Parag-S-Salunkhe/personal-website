import type { MetadataRoute } from 'next'
import { getDishes, getMovies, getNotes, getPosts, getProjects } from '@/lib/content'
import { siteUrl } from '@/lib/site'

export const revalidate = 3600

const latest = (dates: string[]) => (dates.length ? new Date(dates.sort().at(-1)!) : undefined)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [movies, dishes, posts, notes, projects] = await Promise.all([getMovies(), getDishes(), getPosts(), getNotes(), getProjects()])
    const all = [...movies.map((m) => m.watchDate), ...dishes.map((d) => d.cookDate), ...posts.map((p) => p.updatedAt), ...notes.map((n) => n.updatedAt)]
    return [
      { url: `${siteUrl}/`, lastModified: latest(all) },
      { url: `${siteUrl}/movies`, lastModified: latest(movies.map((m) => m.watchDate)) },
      { url: `${siteUrl}/cooking`, lastModified: latest(dishes.map((d) => d.cookDate)) },
      { url: `${siteUrl}/blog`, lastModified: latest(posts.map((p) => p.updatedAt)) },
      { url: `${siteUrl}/notes`, lastModified: latest(notes.map((n) => n.updatedAt)) },
      { url: `${siteUrl}/projects`, lastModified: latest(projects.map((p) => p.createdAt)) },
      ...movies.map((m) => ({ url: `${siteUrl}/movies/${m.slug}`, lastModified: new Date(m.watchDate) })),
      ...dishes.map((d) => ({ url: `${siteUrl}/cooking/${d.slug}`, lastModified: new Date(d.cookDate) })),
      ...posts.map((p) => ({ url: `${siteUrl}/blog/${p.slug}`, lastModified: new Date(p.updatedAt) })),
      ...notes.map((n) => ({ url: `${siteUrl}/notes/${n.slug}`, lastModified: new Date(n.updatedAt) })),
    ]
  } catch {
    // No database at build time (e.g. a preview without DATABASE_URL): ship the static routes.
    return ['', '/movies', '/cooking', '/blog', '/notes', '/projects'].map((p) => ({ url: `${siteUrl}${p || '/'}` }))
  }
}
