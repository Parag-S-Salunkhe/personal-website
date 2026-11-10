import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { ArrowLeft, Play } from 'lucide-react'
import { getPostBySlug, getPosts } from '@/lib/content'
import { fmtDate, fmtLongDate, paragraphs, readingMinutes } from '@/lib/format'
import { safeHttpUrl } from '@/lib/url'
import PrintTitle from '@/components/zine/PrintTitle'
import { CutLine, Staple } from '@/components/zine/Marks'
import { isVideo } from '@/components/zine/PostSpread'

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
      type: 'article',
      url: `/blog/${post.slug}`,
      publishedTime: post.publishDate,
      modifiedTime: post.updatedAt,
      authors: ['Parag Salunkhe'],
    },
  }
}

// Read mode: the zine owns the frame, the column stays calm. Old /blog/<id> links land here
// too (the id is the slug's last segment) and get a permanent redirect to the full slug.
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
      <header className="relative bg-riso-blue text-paper">
        <div className="halftone absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl px-4 pb-12 pt-8 sm:px-6 md:pb-16">
          <Link href="/blog" className="t-label inline-flex min-h-[44px] items-center gap-2 text-lg underline decoration-riso-pink decoration-[3px] underline-offset-4 hover:text-riso-yellow">
            <ArrowLeft className="h-5 w-5" aria-hidden="true" /> All the posts
          </Link>
          <p className="t-label nums mt-6 text-xl">
            <time dateTime={post.publishDate}>{fmtLongDate(post.publishDate)}</time>
            <span>, {readingMinutes(post.content)} min read</span>
          </p>
          <h1 id="post-title" className="t-display mt-3 text-[clamp(2.25rem,8vw,4.5rem)] [overflow-wrap:anywhere]" style={{ textShadow: '3px 2px 0 var(--riso-pink)' }}>
            {post.title}
          </h1>
          {post.blogType && (
            <p className="t-label mt-5 inline-flex items-center gap-1 bg-riso-yellow px-2 py-0.5 text-lg text-ink">
              {isVideo(post) && <Play className="h-4 w-4" aria-hidden="true" />} {post.blogType}
            </p>
          )}
        </div>
        <Staple className="bottom-[-2px] left-1/2 -translate-x-1/2" />
      </header>

      {image && (
        <figure className="mx-auto -mt-6 max-w-3xl px-4 sm:px-6">
          <div className="relative aspect-[16/9] overflow-hidden border-4 border-slip">
            <Image src={image} alt="" fill priority sizes="(min-width: 768px) 720px, 92vw" className="object-cover" />
          </div>
        </figure>
      )}

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16">
        {body.length > 0 ? (
          <div className="prose-zine mx-auto">
            {body.map((p, i) => (
              <p key={i} className={`whitespace-pre-line ${i === 0 ? 'text-xl' : ''}`}>
                {p}
              </p>
            ))}
          </div>
        ) : (
          <p className="t-hand text-center text-3xl">this page is still blank</p>
        )}
        <p className="t-hand mx-auto mt-12 max-w-[68ch] -rotate-1 text-right text-3xl">thanks for reading, P.</p>
      </div>

      {(newer || older) && (
        <>
          <CutLine />
          <nav aria-label="More posts" className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-2">
            {older ? (
              <Link href={`/blog/${older.slug}`} className="group cut block bg-slip p-5 transition-transform duration-300 ease-zine hover:-translate-y-1">
                <span className="t-label text-lg">Older post</span>
                <span className="t-title mt-1 block text-2xl group-hover:underline group-hover:decoration-riso-pink group-hover:decoration-[3px] group-hover:underline-offset-4">{older.title}</span>
                <span className="nums mt-1 block text-sm">{fmtDate(older.publishDate)}</span>
              </Link>
            ) : <span className="hidden md:block" />}
            {newer && (
              <Link href={`/blog/${newer.slug}`} className="group cut block bg-slip p-5 text-right transition-transform duration-300 ease-zine hover:-translate-y-1">
                <span className="t-label text-lg">Newer post</span>
                <span className="t-title mt-1 block text-2xl group-hover:underline group-hover:decoration-riso-pink group-hover:decoration-[3px] group-hover:underline-offset-4">{newer.title}</span>
                <span className="nums mt-1 block text-sm">{fmtDate(newer.publishDate)}</span>
              </Link>
            )}
          </nav>
        </>
      )}
    </article>
  )
}
