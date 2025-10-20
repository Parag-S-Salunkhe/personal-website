import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch current page view count
export async function GET() {
  try {
    // Get the first (and should be only) PageView record
    let pageView = await prisma.pageView.findFirst()

    // If no record exists, create one
    if (!pageView) {
      pageView = await prisma.pageView.create({
        data: {
          count: 0,
        },
      })
    }

    return NextResponse.json({
      count: pageView.count,
      updatedAt: pageView.updatedAt,
    })
  } catch (error) {
    console.error('Error fetching page views:', error)
    return NextResponse.json(
      { error: 'Failed to fetch page views' },
      { status: 500 }
    )
  }
}

// POST - Increment page view count
export async function POST() {
  try {
    // Get the first PageView record
    let pageView = await prisma.pageView.findFirst()

    if (!pageView) {
      // Create if doesn't exist
      pageView = await prisma.pageView.create({
        data: {
          count: 1,
        },
      })
    } else {
      // Increment the count
      pageView = await prisma.pageView.update({
        where: { id: pageView.id },
        data: {
          count: {
            increment: 1,
          },
        },
      })
    }

    return NextResponse.json({
      count: pageView.count,
      updatedAt: pageView.updatedAt,
    })
  } catch (error) {
    console.error('Error incrementing page views:', error)
    return NextResponse.json(
      { error: 'Failed to increment page views' },
      { status: 500 }
    )
  }
}

// PUT - Reset page view count (admin only - you may want to add authentication)
export async function PUT() {
  try {
    const pageView = await prisma.pageView.findFirst()

    if (!pageView) {
      return NextResponse.json(
        { error: 'No page view record found' },
        { status: 404 }
      )
    }

    const updatedPageView = await prisma.pageView.update({
      where: { id: pageView.id },
      data: {
        count: 0,
      },
    })

    return NextResponse.json({
      count: updatedPageView.count,
      updatedAt: updatedPageView.updatedAt,
      message: 'Page view count reset to 0',
    })
  } catch (error) {
    console.error('Error resetting page views:', error)
    return NextResponse.json(
      { error: 'Failed to reset page views' },
      { status: 500 }
    )
  }
}
