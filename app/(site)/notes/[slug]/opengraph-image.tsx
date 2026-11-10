import { getNoteBySlug } from '@/lib/content'
import { fmtDate } from '@/lib/format'
import { ogContentType, ogSize, zineImage } from '@/lib/og'

export const alt = 'A note from Parag\'s zine'
export const size = ogSize
export const contentType = ogContentType

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const note = await getNoteBySlug((await params).slug)
  if (!note) return zineImage({ kicker: 'Notes', title: 'Scraps from my pockets' })
  return zineImage({ kicker: `${note.category ? `${note.category}, ` : ''}${fmtDate(note.createdAt)}`, title: note.title, scribble: 'a note off the fridge' })
}
