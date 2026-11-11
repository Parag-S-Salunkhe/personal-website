import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound, permanentRedirect } from 'next/navigation'
import { Play } from 'lucide-react'
import { getPostBySlug, getPosts } from '@/lib/content'
import { fmtLongDate, paragraphs, readingMinutes } from '@/lib/format'
import { safeHttpUrl, isOptimizable } from '@/lib/url'
import BackLink from '@/components/site/BackLink'
import Prose from '@/components/site/Prose'
import RiseTitle from '@/components/site/writing/RiseTitle'
import Envelope from '@/components/site/writing/Envelope'
import { isVideo } from '@/components/site/writing/isVideo'
import { JsonLd, abs, author, breadcrumbs } from '@/lib/jsonld'
import { ogBase } from '@/lib/site'

export const revalidate = 3600
export const generateStaticParams = async () => [] as { slug: string }[]

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug((await params).slug)
  if (!post) return { title: 'Post not found', robots: { index: false } }
  return {
    title: post.title,
    description: post.excerpt.slice(0, 160),
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      ...ogBase,
      type: 'article',
      url: `/blog/${post.slug}`,
      publishedTime: post.publishDate,
      modifiedTime: post.updatedAt,
      authors: ['Parag Salunkhe'],
    },
  }
}

// Read mode: the letter. Old /blog/<id> links land here too (the id is the slug's last segment)
// and get a permanent redirect to the full slug.
export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()
  if (slug !== post.slug) permanentRedirect(`/blog/${post.slug}`)

  const posts = await getPosts()
  const idx = posts.findIndex((p) => p.id === post.id)
  const newer = idx > 0 ? posts[idx - 1] : null
  const older = idx >= 0 && idx < posts.length - 1 ? posts[idx + 1] : null
  const image = safeHttpUrl(post.imageUrl)
  const body = paragraphs(post.content)

  return (
    <article aria-labelledby="post-title">
      <JsonLd data={{ '@graph': [
        {
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          url: abs(`/blog/${post.slug}`),
          mainEntityOfPage: abs(`/blog/${post.slug}`),
          datePublished: post.publishDate,
          dateModified: post.updatedAt,
          author,
          publisher: author,
          image: image || undefined,
          articleSection: post.blogType || undefined,
          inLanguage: 'en-IE',
        },
        breadcrumbs([['Home', '/'], ['Blog', '/blog'], [post.title, `/blog/${post.slug}`]]),
      ] }} />
      <header>
        <div className="mx-auto max-w-4xl px-4 pb-10 pt-8 sm:px-6 md:pb-12">
          <BackLink href="/blog">All the posts</BackLink>
          <p className="ev-meta mt-6 text-base text-[var(--sage)]">
            <time dateTime={post.publishDate}>{fmtLongDate(post.publishDate)}</time>
            <span>, {readingMinutes(post.content)} min read</span>
          </p>
          <h1 id="post-title" className="ev-h1 mt-3 text-[var(--wax)] [overflow-wrap:anywhere]">
            <RiseTitle text={post.title} />
          </h1>
          {post.blogType && (
            <p className="ev-label mt-5 inline-flex min-h-[32px] items-center gap-1.5 rounded-[3px] border border-[var(--candle)] px-3 text-[var(--candle)]">
              {isVideo(post) && <Play className="h-4 w-4" aria-hidden="true" />} {post.blogType}
            </p>
          )}
        </div>
      </header>

      {image && (
        <figure className="mx-auto mb-8 max-w-3xl px-4 sm:px-6">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[3px] outline outline-1 -outline-offset-1 outline-[var(--brass)]">
            <Image unoptimized={!isOptimizable(image)} src={image} alt="" fill priority sizes="(min-width: 768px) 720px, 92vw" className="object-cover" />
          </div>
        </figure>
      )}

      <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 md:pb-16">
        <Prose paragraphs={body} lead empty="This page is still blank." />
        <p className="mx-auto mt-10 max-w-[68ch] text-right text-xl text-[var(--wax)]">
          Thanks for reading, <span className="ev-name align-middle text-5xl text-[var(--candle)]">P.</span>
        </p>
      </div>

      {(newer || older) && (
        <nav aria-label="More posts" className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 sm:px-6 md:grid-cols-2">
          {older ? <Envelope href={`/blog/${older.slug}`} kicker="Older post" title={older.title} date={older.publishDate} /> : <span className="hidden md:block" />}
          {newer && <Envelope href={`/blog/${newer.slug}`} kicker="Newer post" title={newer.title} date={newer.publishDate} align="right" />}
        </nav>
      )}
    </article>
  )
}
