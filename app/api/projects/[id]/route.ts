import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { optionalHttpUrl } from '@/lib/url'
import { revalidateSection } from '@/lib/revalidate'

// GET single project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: (await params).id },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
}

// UPDATE project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const project = await prisma.project.update({
      where: { id: (await params).id },
      data: {
        title,
        description,
        techStack,
        projectUrl: projectUrl.value,
        githubUrl: githubUrl.value,
        imageUrl: imageUrl.value,
      },
    })
    revalidateSection('projects')

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

// DELETE project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    await prisma.project.delete({
      where: { id: (await params).id },
    })
    revalidateSection('projects')

    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}
