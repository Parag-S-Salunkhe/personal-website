import { prisma } from '@/lib/prisma'
import ProjectsContent from './ProjectsContent'

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      techStack: true,
      projectUrl: true,
      githubUrl: true,
      imageUrl: true,
    },
  })

  return <ProjectsContent projects={projects} />
}
