import { NextResponse } from 'next/server';
import { getTokens } from '@/lib/googleFit';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  try {
    const tokens = await getTokens(code);

    if (tokens.error) {
      console.error('OAuth error:', tokens);
      return NextResponse.redirect(new URL('/?error=oauth_failed', request.url));
    }

    // Store tokens in cookie (encrypted in production!)
    const response = NextResponse.redirect(new URL('/', request.url));
    
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
    return NextResponse.redirect(new URL('/?error=token_failed', request.url));
  }
}
