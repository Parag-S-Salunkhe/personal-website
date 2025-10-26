import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const daysParam = searchParams.get('days')

    let healthData

    if (daysParam && daysParam !== 'all') {
      const days = parseInt(daysParam)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      healthData = await prisma.healthData.findMany({
        where: {
          date: {
            gte: startDate,
          },
        },
        orderBy: { date: 'asc' },
      })
    } else {
      // Return all data or default 30 days
      healthData = await prisma.healthData.findMany({
        orderBy: { date: 'asc' },
        take: daysParam === 'all' ? undefined : 30,
      })
    }

    return NextResponse.json(healthData)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch health data' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { date, steps, calories } = body

    const healthData = await prisma.healthData.create({
      data: {
        date: new Date(date),
        steps,
        calories,
      },
    })

    return NextResponse.json(healthData, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create health data' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await prisma.healthData.delete({
      where: { id },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete health data' }, { status: 500 })
  }
}
