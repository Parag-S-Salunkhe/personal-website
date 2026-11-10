// Server-side admin guard for route handlers (Node runtime).
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/auth-token'

export async function isAdmin(): Promise<boolean> {
  return verifyAdminToken(cookies().get(ADMIN_COOKIE)?.value)
}

/**
 * Returns a 401 response when the caller is not a signed-in admin, otherwise null.
 * Usage at the top of a handler:
 *   const denied = await requireAdmin()
 *   if (denied) return denied
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAdmin()) return null
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
