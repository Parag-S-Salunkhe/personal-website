import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { revalidateSection } from '@/lib/revalidate'
import { optionalHttpUrl } from '@/lib/url'

// GET single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const post = await prisma.blog.findUnique({
      where: { id: (await params).id },
    })

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 })
  }
}

// UPDATE blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const body = await request.json()
    const { title, content, imageUrl, blogType, publishDate } = body
    const imageUrlUrl = optionalHttpUrl(body.imageUrl)
    if (!imageUrlUrl.ok) {
      return NextResponse.json({ error: 'Links must start with http:// or https://' }, { status: 400 })
    }

    const post = await prisma.blog.update({
      where: { id: (await params).id },
      data: {
        title,
        content,
        imageUrl: imageUrlUrl.value,
        blogType: blogType || null,
        publishDate: new Date(publishDate),
      },
    })
    revalidateSection('blog')

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 })
  }
}

// DELETE blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    await prisma.blog.delete({
      where: { id: (await params).id },
    })
    revalidateSection('blog')

    return NextResponse.json({ message: 'Blog post deleted successfully' })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 })
  }
}
