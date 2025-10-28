import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStepsAndCalories, refreshAccessToken } from '@/lib/googleFit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🕐 Cron job started at:', new Date().toISOString());

    // Get OAuth tokens from database
    const oauthData = await prisma.oAuthToken.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!oauthData) {
      console.error('❌ No OAuth tokens found');
      return NextResponse.json({ error: 'No OAuth tokens' }, { status: 400 });
    }

    let accessToken = oauthData.accessToken;
    const refreshToken = oauthData.refreshToken;

    // Check if token is expired (expires in ~1 hour)
    const tokenAge = Date.now() - new Date(oauthData.createdAt).getTime();
    const oneHour = 60 * 60 * 1000;

    if (tokenAge > oneHour) {
      console.log('🔄 Access token expired, refreshing...');
      try {
        const newTokens = await refreshAccessToken(refreshToken);
        accessToken = newTokens.access_token;
        
        // Update tokens in database
        await prisma.oAuthToken.update({
          where: { id: oauthData.id },
          data: {
            accessToken: newTokens.access_token,
            createdAt: new Date(),
          },
        });
        console.log('✅ Token refreshed successfully');
      } catch (refreshError) {
        console.error('❌ Failed to refresh token:', refreshError);
        return NextResponse.json({ error: 'Token refresh failed' }, { status: 500 });
      }
    }

    // Fetch today's data
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('📊 Fetching health data for:', today.toDateString());

    const { steps, calories } = await getStepsAndCalories(accessToken, today);

    console.log(`📈 Fetched: ${steps} steps, ${calories} calories`);

    // Check if entry already exists for today
    const existingEntry = await prisma.healthData.findFirst({
      where: {
        date: today,
      },
    });

    if (existingEntry) {
      // Update existing entry
      await prisma.healthData.update({
        where: { id: existingEntry.id },
        data: { steps, calories },
      });
      console.log('✅ Updated existing entry');
    } else {
      // Create new entry
      await prisma.healthData.create({
        data: {
          date: today,
          steps,
          calories,
        },
      });
      console.log('✅ Created new entry');
    }

    return NextResponse.json({ 
      success: true, 
      steps, 
      calories,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Cron job failed:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
