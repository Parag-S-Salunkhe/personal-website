import { NextResponse } from 'next/server';
import { getStepsAndCalories, refreshAccessToken } from '@/lib/googleFit';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Verify this is coming from Vercel Cron (security)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log('❌ Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Cron job started: Daily health sync at', new Date().toISOString());

    // Note: Cron jobs don't have access to user cookies
    // We need to store refresh token in environment variable
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    
    if (!refreshToken) {
      console.log('❌ No refresh token found in environment');
      return NextResponse.json(
        { error: 'Refresh token not configured. Add GOOGLE_REFRESH_TOKEN to environment variables.' },
        { status: 401 }
      );
    }

    // Refresh access token
    console.log('🔄 Refreshing access token');
    const tokens = await refreshAccessToken(refreshToken);
    const accessToken = tokens.access_token;

    // Fetch today's data
    console.log('📊 Fetching health data from Google Fit');
    const { steps, calories } = await getStepsAndCalories(accessToken);

    // Save to database
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.healthData.findFirst({
      where: { date: today },
    });

    if (existing) {
      await prisma.healthData.update({
        where: { id: existing.id },
        data: { steps, calories },
      });
      console.log('✅ Updated existing health data:', { steps, calories });
    } else {
      await prisma.healthData.create({
        data: { date: today, steps, calories },
      });
      console.log('✅ Created new health data:', { steps, calories });
    }

    return NextResponse.json({ 
      success: true, 
      steps, 
      calories,
      synced: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json(
      { error: 'Sync failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
