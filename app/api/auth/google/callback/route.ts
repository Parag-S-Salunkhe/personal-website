import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getTokens } from '@/lib/googleFit';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const OAUTH_STATE_COOKIE = 'google-oauth-state';

function sameState(a: string, b: string): boolean {
  const da = crypto.createHash('sha256').update(a).digest();
  const db = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(da, db);
}

export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const expectedState = (await cookies()).get(OAUTH_STATE_COOKIE)?.value;

  if (!state || !expectedState || !sameState(state, expectedState)) {
    const res = NextResponse.redirect(new URL('/admin/health?error=oauth_state', request.url));
    res.cookies.set(OAUTH_STATE_COOKIE, '', { maxAge: 0, path: '/api/auth/google' });
    return res;
  }

  if (!code) {
    return NextResponse.redirect(new URL('/admin/health?error=no_code', request.url));
  }

  try {
    const tokens = await getTokens(code);

    if (tokens.error) {
      console.error('OAuth error:', tokens.error);
      return NextResponse.redirect(new URL('/admin/health?error=oauth_failed', request.url));
    }

    // Store tokens in cookie (encrypted in production!)
    const response = NextResponse.redirect(new URL('/admin/health', request.url));
    response.cookies.set(OAUTH_STATE_COOKIE, '', { maxAge: 0, path: '/api/auth/google' });
    
    response.cookies.set('google_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in,
    });

    if (tokens.refresh_token) {
      response.cookies.set('google_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    return response;
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.redirect(new URL('/admin/health?error=token_failed', request.url));
  }
}
