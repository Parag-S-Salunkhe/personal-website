import { revalidatePath } from 'next/cache'

export type Section = 'movies' | 'cooking' | 'blog' | 'notes' | 'projects' | 'guestbook'

/** Refresh the cached pages that show a section after a write. */
export function revalidateSection(section: Section) {
  try {
    revalidatePath('/')
    revalidatePath('/sitemap.xml')
    if (section !== 'guestbook') {
      revalidatePath(`/${section}`)
      if (section !== 'projects') revalidatePath(`/${section}/[slug]`, 'page')
    }
  } catch (error) {
    // Revalidation failing must never fail the write itself.
    console.error('revalidate failed for', section)
  }
}
