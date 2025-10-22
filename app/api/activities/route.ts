export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all activities
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    let activities;
    
    if (date) {
      // Get activities for specific date
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      activities = await prisma.activity.findMany({
        where: {
          date: {
            gte: targetDate,
            lt: nextDay,
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Get all activities
      activities = await prisma.activity.findMany({
        orderBy: { date: 'desc' },
        take: 100,
      });
    }
    
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

// POST new activity
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, type, duration, distance, category, notes, caloriesBurned } = body;
    
    if (!date || !type || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const activity = await prisma.activity.create({
      data: {
        date: new Date(date),
        type,
        duration: parseInt(duration),
        distance: distance ? parseFloat(distance) : null,
        category,
        notes,
        caloriesBurned: caloriesBurned ? parseInt(caloriesBurned) : null,
      },
    });
    
    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}

// DELETE activity
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Activity ID required' },
        { status: 400 }
      );
    }
    
    await prisma.activity.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json(
      { error: 'Failed to delete activity' },
      { status: 500 }
    );
  }
}
