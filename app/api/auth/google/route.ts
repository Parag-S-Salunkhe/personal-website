import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAuthUrl } from '@/lib/googleFit';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const OAUTH_STATE_COOKIE = 'google-oauth-state';

// Admin-only: starts the Google Fit OAuth flow with a CSRF `state` value.
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const state = crypto.randomBytes(32).toString('hex');
  const response = NextResponse.redirect(getAuthUrl(state));
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/api/auth/google',
  });
  return response;
}
