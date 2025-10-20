import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getHashedClientIP } from '@/lib/rateLimit'

// Valid mood options
const VALID_MOODS = ['happy', 'fire', 'neutral', 'sad', 'sleepy'] as const
type Mood = typeof VALID_MOODS[number]

// GET - Fetch mood statistics
export async function GET() {
  try {
    // Get all mood votes
    const votes = await prisma.moodVote.findMany({
      select: {
        mood: true,
      },
    })

    // Calculate statistics
    const stats = VALID_MOODS.reduce((acc, mood) => {
      acc[mood] = votes.filter(v => v.mood === mood).length
      return acc
    }, {} as Record<Mood, number>)

    const total = votes.length
    const percentages = VALID_MOODS.reduce((acc, mood) => {
      acc[mood] = total > 0 ? Math.round((stats[mood] / total) * 100) : 0
      return acc
    }, {} as Record<Mood, number>)

    return NextResponse.json({
      stats,
      percentages,
      total,
    })
  } catch (error) {
    console.error('Error fetching mood statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mood statistics' },
      { status: 500 }
    )
  }
}

// POST - Submit a mood vote
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { mood } = body

    // Validation
    if (!mood || typeof mood !== 'string') {
      return NextResponse.json(
        { error: 'Mood is required and must be a string' },
        { status: 400 }
      )
    }

    if (!VALID_MOODS.includes(mood as Mood)) {
      return NextResponse.json(
        { error: `Invalid mood. Must be one of: ${VALID_MOODS.join(', ')}` },
        { status: 400 }
      )
    }

    // Get and hash IP for rate limiting
    const ipHash = getHashedClientIP()

    // Rate limiting: Check if user has voted in the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentVote = await prisma.moodVote.findFirst({
      where: {
        ipHash,
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
    })

    if (recentVote) {
      return NextResponse.json(
        { error: 'You can only vote once per day' },
        { status: 429 }
      )
    }

    // Create the vote
    const newVote = await prisma.moodVote.create({
      data: {
        mood,
        ipHash,
      },
    })

    // Get updated statistics
    const votes = await prisma.moodVote.findMany({
      select: {
        mood: true,
      },
    })

    const stats = VALID_MOODS.reduce((acc, m) => {
      acc[m] = votes.filter(v => v.mood === m).length
      return acc
    }, {} as Record<Mood, number>)

    const total = votes.length
    const percentages = VALID_MOODS.reduce((acc, m) => {
      acc[m] = total > 0 ? Math.round((stats[m] / total) * 100) : 0
      return acc
    }, {} as Record<Mood, number>)

    return NextResponse.json({
      vote: newVote,
      stats,
      percentages,
      total,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating mood vote:', error)
    return NextResponse.json(
      { error: 'Failed to create mood vote' },
      { status: 500 }
    )
  }
}
