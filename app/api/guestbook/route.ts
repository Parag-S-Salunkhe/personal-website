import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getHashedClientIP } from '@/lib/rateLimit'
import { sanitizeMessage, validateMessage, containsProfanity } from '@/lib/security'
import { requireAdmin } from '@/lib/auth'
import { revalidateSection } from '@/lib/revalidate'

// GET - Fetch all guestbook messages
export async function GET() {
  try {
    const messages = await prisma.guestbookMessage.findMany({
      select: { id: true, message: true, emoji: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to most recent 50 messages
    })
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching guestbook messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch guestbook messages' },
      { status: 500 }
    )
  }
}

// POST - Create a new guestbook message
export async function POST(request: Request) {
  try {
    const body = await request.json()
    let { message, emoji } = body

    // Basic validation
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }

    // Validate message
    const validation = validateMessage(message)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid message' },
        { status: 400 }
      )
    }

    // Check for profanity
    if (containsProfanity(message)) {
      return NextResponse.json(
        { error: 'Message contains inappropriate content' },
        { status: 400 }
      )
    }

    // Sanitize message
    message = sanitizeMessage(message)

    // Get and hash IP for rate limiting
    const ipHash = getHashedClientIP()

    // Rate limiting: Check if user has posted in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const recentMessage = await prisma.guestbookMessage.findFirst({
      where: {
        ipHash,
        createdAt: {
          gte: fiveMinutesAgo,
        },
      },
    })

    if (recentMessage) {
      return NextResponse.json(
        { error: 'Please wait 5 minutes before posting another message' },
        { status: 429 }
      )
    }

    // Create the message
    const newMessage = await prisma.guestbookMessage.create({
      data: {
        message: message.trim(),
        emoji: emoji || null,
        ipHash,
      },
    })
    revalidateSection('guestbook')

    const { ipHash: _omit, ...publicMessage } = newMessage
    return NextResponse.json(publicMessage, { status: 201 })
  } catch (error) {
    console.error('Error creating guestbook message:', error)
    return NextResponse.json(
      { error: 'Failed to create guestbook message' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a guestbook message (optional, for admin use)
export async function DELETE(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      )
    }

    await prisma.guestbookMessage.delete({
      where: { id },
    })
    revalidateSection('guestbook')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting guestbook message:', error)
    return NextResponse.json(
      { error: 'Failed to delete guestbook message' },
      { status: 500 }
    )
  }
}
