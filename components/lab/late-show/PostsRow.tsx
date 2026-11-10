import Link from 'next/link'
import { Play } from 'lucide-react'
import type { LabPost } from '@/components/lab/data'
import s from './styles.module.css'
import SectionHead from './SectionHead'
import Empty from './Empty'
import Reveal from './Reveal'
import { fmtDate } from './fmt'

export default function PostsRow({ posts }: { posts: LabPost[] }) {
  return (
    <section aria-labelledby="blog-h" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
      <SectionHead id="blog-h" title="Programme notes" line="Longer thoughts, written after the credits." href="/blog" cta="Read the notes" />
      {posts.length === 0 ? (
        <Empty text="No programme notes printed yet." href="/blog" cta="Check the blog" />
      ) : (
        <Reveal>
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-2">
            {posts.slice(0, 4).map((p) => (
              <li key={p.id}>
                <Link href={`/blog/${p.id}`} className={`${s.lift} block h-full border-t-4 border-[var(--brass)] bg-[var(--curtain)] p-6 sm:p-8`}>
                  <div className="flex items-center justify-between gap-3 text-sm text-[var(--beam)]/85">
                    <time dateTime={p.publishDate} className="num">{fmtDate(p.publishDate)}</time>
                    {p.blogType === 'Video' && <span className="inline-flex items-center gap-1.5 text-[var(--tungsten)]"><Play size={14} aria-hidden /> Video</span>}
                  </div>
                  <h3 className={`${s.display} mt-3 break-words text-4xl sm:text-5xl`}>{p.title}</h3>
                  <p className="mt-4 line-clamp-4 max-w-prose text-base text-[var(--beam)]/85">{p.excerpt}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </section>
  )
}
