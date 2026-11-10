import type { Metadata } from 'next'
import { getPosts } from '@/lib/content'
import PrintTitle from '@/components/zine/PrintTitle'
import BlogContent from './BlogContent'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Longer pieces from Parag: hosting, cooking, movie nights and whatever else needed more than a note.',
  alternates: { canonical: '/blog' },
  openGraph: { url: '/blog' },
}

export default async function BlogPage() {
  const posts = await getPosts()
  return (
    <section aria-labelledby="blog-title" className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 lg:pt-14">
      <div className="mb-8">
        <PrintTitle id="blog-title" lines="Blog" className="text-[clamp(3rem,13vw,6rem)]" />
        <p className="t-hand mt-2 -rotate-1 text-3xl sm:text-4xl">the longer things I wrote down</p>
      </div>
      <BlogContent posts={posts} />
    </section>
  )
}
