import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { revalidateSection } from '@/lib/revalidate'
import { optionalHttpUrl } from '@/lib/url'

export async function GET() {
  try {
    const posts = await prisma.blog.findMany({
      orderBy: { publishDate: 'desc' },
    })
    return NextResponse.json({ posts })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const body = await request.json()
    const { title, content, imageUrl, blogType, publishDate } = body
    const imageUrlUrl = optionalHttpUrl(body.imageUrl)
    if (!imageUrlUrl.ok) {
      return NextResponse.json({ error: 'Links must start with http:// or https://' }, { status: 400 })
    }

    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        imageUrl: imageUrlUrl.value,
        blogType: blogType || null,
        publishDate: new Date(publishDate),
      },
    })
    revalidateSection('blog')

    return NextResponse.json(blog, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 })
  }
}
