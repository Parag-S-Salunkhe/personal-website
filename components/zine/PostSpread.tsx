import Link from 'next/link'
import { Play } from 'lucide-react'
import type { Post } from '@/lib/content'
import { fmtDate, readingMinutes } from '@/lib/format'
import { Staple } from './Marks'

export const isVideo = (p: Pick<Post, 'blogType'>) => p.blogType?.toLowerCase() === 'video'

// A two-page spread: the blue left page carries the date and title, the right page the opening lines.
export default function PostSpread({ post, headingLevel = 'h3' }: { post: Post; headingLevel?: 'h2' | 'h3' }) {
  const H = headingLevel
  const video = isVideo(post)
  return (
    <article className="group relative grid bg-slip transition-transform duration-300 ease-zine hover:-translate-y-1 md:grid-cols-2">
      <div className="relative bg-riso-blue p-5 text-paper">
        <div className="halftone absolute inset-0 opacity-40" aria-hidden="true" />
        <p className="t-label nums relative text-lg">{fmtDate(post.publishDate)}</p>
        <H className="t-title relative mt-2 text-3xl [overflow-wrap:anywhere]">
          <Link href={`/blog/${post.slug}`} className="relative z-[2] group-hover:underline group-hover:decoration-riso-pink group-hover:decoration-[3px] group-hover:underline-offset-4">
            {post.title}
          </Link>
        </H>
        {video && (
          <p className="t-label relative mt-3 inline-flex items-center gap-1 bg-riso-yellow px-2 py-0.5 text-ink">
            <Play className="h-4 w-4" aria-hidden="true" /> Video
          </p>
        )}
      </div>
      <div className="flex flex-col p-5 text-ink">
        <p className="line-clamp-6 text-base">{post.excerpt}</p>
        <p className="t-label mt-auto pt-3 text-lg text-riso-blue">
          <span className="ink-link">Read the post</span>
          <span className="nums">, {readingMinutes(post.content)} min</span>
        </p>
      </div>
      {/* Makes the whole spread clickable; hidden from assistive tech because the title link is the real one. */}
      <Link href={`/blog/${post.slug}`} aria-hidden="true" tabIndex={-1} className="absolute inset-0 z-[1]" />
      <Staple className="left-8 top-[-2px] md:hidden" />
      <Staple className="left-1/2 top-8 hidden -translate-x-1/2 rotate-90 md:block" />
    </article>
  )
}
