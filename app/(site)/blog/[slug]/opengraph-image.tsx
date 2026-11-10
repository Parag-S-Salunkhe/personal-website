import { getPostBySlug } from '@/lib/content'
import { fmtDate, readingMinutes } from '@/lib/format'
import { ogContentType, ogSize, zineImage } from '@/lib/og'

export const alt = 'A post from Parag\'s blog'
export const size = ogSize
export const contentType = ogContentType

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPostBySlug((await params).slug)
  if (!post) return zineImage({ kicker: 'Blog', title: 'Things I wrote down' })
  return zineImage({ kicker: `${fmtDate(post.publishDate)}, ${readingMinutes(post.content)} min read`, title: post.title, scribble: 'from the blog' })
}
