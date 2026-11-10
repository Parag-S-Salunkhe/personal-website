import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { optionalHttpUrl } from '@/lib/url'

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ projects })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const body = await request.json()
    const { title, description, techStack } = body
    const projectUrl = optionalHttpUrl(body.projectUrl)
    const githubUrl = optionalHttpUrl(body.githubUrl)
    const imageUrl = optionalHttpUrl(body.imageUrl)
    if (!projectUrl.ok || !githubUrl.ok || !imageUrl.ok) {
      return NextResponse.json({ error: 'Links must be http(s) URLs' }, { status: 400 })
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        techStack,
        projectUrl: projectUrl.value,
        githubUrl: githubUrl.value,
        imageUrl: imageUrl.value,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
