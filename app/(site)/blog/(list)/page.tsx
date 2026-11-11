import type { Metadata } from 'next'
import { getPosts } from '@/lib/content'
import Candle from '@/components/site/writing/Candle'
import BlogContent from './BlogContent'
import { JsonLd, collection } from '@/lib/jsonld'
import { ogBase } from '@/lib/site'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Longer pieces from Parag: hosting, cooking, movie nights and whatever else needed more than a note.',
  alternates: { canonical: '/blog' },
  openGraph: { ...ogBase, url: '/blog' },
}

export default async function BlogPage() {
  const posts = await getPosts()
  return (
    <>
      <JsonLd data={collection('Blog', '/blog', metadata.description as string, posts.map((p) => ({ name: p.title, path: `/blog/${p.slug}` })))} />
      <section aria-labelledby="blog-title" className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:pt-14">
        <div className="mb-10 flex items-end gap-4 sm:gap-6">
          <Candle className="h-24 w-12 shrink-0 sm:h-32 sm:w-16" />
          <div>
            <h1 id="blog-title" className="ev-display text-[var(--wax)]">Blog</h1>
            <p className="mt-3 max-w-[48ch] text-lg text-[var(--sage)]">The longer things I wrote down: hosting, cooking, movie nights.</p>
          </div>
        </div>
        <BlogContent posts={posts} />
      </section>
    </>
  )
}
