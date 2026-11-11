import Link from 'next/link'
import { Play } from 'lucide-react'
import type { Post } from '@/lib/content'
import { fmtDate, readingMinutes } from '@/lib/format'
import { isVideo } from './isVideo'
import './writing.css'

/** The claret envelope flap on a card (opens on hover/focus of the .wr-inv parent). */
export function Flap() {
  return (
    <span className="wr-flap" aria-hidden="true">
      <span className="wr-flap-face wr-flap-front" />
      <span className="wr-flap-face wr-flap-back" />
      <span className="wr-seal" />
    </span>
  )
}

/** An invitation: envelope flap, date, reading time, kind, title link, excerpt. */
export default function InviteCard({ post }: { post: Post }) {
  const video = isVideo(post)
  return (
    <article className="wr-inv ev-card relative flex h-full flex-col px-6 pb-6 pt-[calc(var(--flap)+1.25rem)] sm:px-8 sm:pb-8">
      <Flap />
      <p className="ev-meta ev-soft flex flex-wrap items-center gap-x-4 gap-y-1">
        <span>{fmtDate(post.publishDate)}</span>
        <span>{readingMinutes(post.content)} min read</span>
        {post.blogType && (
          <span className="inline-flex items-center gap-1 font-semibold">
            {video && <Play className="h-3.5 w-3.5" aria-hidden="true" />} {post.blogType}
          </span>
        )}
      </p>
      <h2 className="ev-title mt-3 [overflow-wrap:anywhere]">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:content-[''] hover:underline hover:decoration-2 hover:underline-offset-4">
          {post.title}
        </Link>
      </h2>
      <p className="mt-3 line-clamp-4 text-base">{post.excerpt.replace(/(^|\s)#{1,6}\s+/g, '$1').replace(/\s-\s/g, ', ')}</p>
      <p className="ev-label mt-auto pt-5 text-[var(--claret)]">Read the post</p>
    </article>
  )
}
