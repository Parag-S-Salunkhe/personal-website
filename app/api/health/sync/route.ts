import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getStepsAndCalories, refreshAccessToken } from '@/lib/googleFit';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = cookies();
    let accessToken = cookieStore.get('google_access_token')?.value;
    const refreshToken = cookieStore.get('google_refresh_token')?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.json(
        { error: 'Not authenticated. Please connect Google Fit.' },
        { status: 401 }
      );
    }

    // Refresh token if needed
    if (!accessToken && refreshToken) {
      const tokens = await refreshAccessToken(refreshToken);
      accessToken = tokens.access_token;

      // Update cookie (will be set in the final response)
      // Note: Cookie update happens at the end of the function
    }

    // Fetch today's data
    const { steps, calories } = await getStepsAndCalories(accessToken!);

    // Save to database
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if entry exists for today
    const existing = await prisma.healthData.findFirst({
      where: {
        date: today,
      },
    });

    if (existing) {
      // Update existing entry
      await prisma.healthData.update({
        where: { id: existing.id },
        data: { steps, calories },
      });
    } else {
      // Create new entry
      await prisma.healthData.create({
        data: {
          date: today,
          steps,
          calories,
        },
      });
    }

    return NextResponse.json({ steps, calories, synced: true });
  } catch (error) {
    console.error('Health sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync health data' },
      { status: 500 }
    );
  }
}
