import { prisma } from '@/lib/prisma'
import HomeContent from '@/components/home/HomeContent'

export default async function Home() {
  const [movie, cooking, blog, project, note] = await Promise.all([
    prisma.movie.findFirst({ orderBy: { createdAt: 'desc' } }),
    prisma.cooking.findFirst({ orderBy: { createdAt: 'desc' } }),
    prisma.blog.findFirst({ orderBy: { publishDate: 'desc' } }),
    prisma.project.findFirst({ orderBy: { createdAt: 'desc' } }),
    prisma.note.findFirst({ orderBy: { createdAt: 'desc' } }),
  ])

  return (
    <HomeContent
      movie={movie && {
        title: movie.title,
        type: movie.type,
        rating: movie.rating,
        review: movie.review,
        posterUrl: movie.posterUrl,
      }}
      cooking={cooking && {
        dishName: cooking.dishName,
        category: cooking.category,
        rating: cooking.rating,
        review: cooking.review,
        imageUrl: cooking.imageUrl,
      }}
      blog={blog && {
        id: blog.id,
        title: blog.title,
        content: blog.content.substring(0, 200),
        imageUrl: blog.imageUrl,
        blogType: blog.blogType,
        publishDate: blog.publishDate.toISOString(),
      }}
      project={project && {
        title: project.title,
        description: project.description,
        techStack: project.techStack,
      }}
      note={note && {
        title: note.title,
        content: note.content,
        category: note.category,
      }}
    />
  )
}
