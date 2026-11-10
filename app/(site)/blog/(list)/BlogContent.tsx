'use client'
import { useMemo, useState } from 'react'
import type { Post } from '@/lib/content'
import Filters from '@/components/zine/Filters'
import PostSpread from '@/components/zine/PostSpread'
import Settle from '@/components/zine/Settle'
import { Empty } from '@/components/zine/SectionHead'

export default function BlogContent({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('ALL')

  const chips = useMemo(() => {
    const types = Array.from(new Set(posts.map((p) => p.blogType).filter((t): t is string => !!t))).sort()
    return [{ value: 'ALL', label: 'Everything' }, ...types.map((t) => ({ value: t, label: t }))]
  }, [posts])

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter(
      (p) => (type === 'ALL' || p.blogType === type) && (!q || p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)),
    )
  }, [posts, query, type])

  if (posts.length === 0) {
    return <Empty title="No pages written yet" text="The first spread goes here." href="/" cta="Back to the front page" />
  }

  return (
    <>
      <Filters
        idPrefix="blog"
        query={query}
        onQuery={setQuery}
        searchLabel="Find a post"
        placeholder="A word from the title or the post"
        chips={chips}
        chip={type}
        onChip={setType}
        chipsLabel="Show a kind of post"
        count={shown.length}
        noun={['post', 'posts']}
      />
      {shown.length === 0 ? (
        <Empty title="Nothing matches that" text="Try a shorter search, or show everything again." />
      ) : (
        <ul className="grid gap-10 md:grid-cols-2">
          {shown.map((p, i) => (
            <li key={p.id}>
              <Settle rotate={i % 2 ? 0.6 : -0.6}>
                <PostSpread post={p} headingLevel="h2" />
              </Settle>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
