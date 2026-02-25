import { prisma } from '@/lib/prisma'
import NotesContent from './NotesContent'

export default async function NotesPage() {
  const notes = await prisma.note.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      content: true,
      category: true,
      createdAt: true,
    },
  })

  const serialized = notes.map(note => ({
    ...note,
    createdAt: note.createdAt.toISOString(),
  }))

  return <NotesContent notes={serialized} />
}
