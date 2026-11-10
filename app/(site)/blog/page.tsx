import { prisma } from '@/lib/prisma'
import BlogContent from './BlogContent'

export default async function BlogPage() {
  const blogs = await prisma.blog.findMany({
    orderBy: { publishDate: 'desc' },
    select: {
      id: true,
      title: true,
      content: true,
      imageUrl: true,
      blogType: true,
      publishDate: true,
    },
  })

  const serialized = blogs.map(blog => ({
    ...blog,
    publishDate: blog.publishDate.toISOString(),
  }))

  return <BlogContent blogs={serialized} />
}
