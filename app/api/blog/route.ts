import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
  try {
    const body = await request.json()
    const { title, content, imageUrl, blogType, publishDate } = body

    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        blogType: blogType || null,
        publishDate: new Date(publishDate),
      },
    })

    return NextResponse.json(blog, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 })
  }
}
