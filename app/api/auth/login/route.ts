import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { ADMIN_COOKIE, signAdminToken } from '@/lib/auth-token'
import { getClientIP } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

// Per-IP throttle for failed logins. In-memory, so it is per server instance
// (good enough to slow guessing; a shared store would be needed for a hard limit).
const MAX_FAILURES = 5
const WINDOW_MS = 15 * 60 * 1000
const failures = new Map<string, { count: number; first: number }>()

function isLocked(ip: string, now: number): boolean {
  const entry = failures.get(ip)
  if (!entry) return false
  if (now - entry.first > WINDOW_MS) {
    failures.delete(ip)
    return false
  }
  return entry.count >= MAX_FAILURES
}

function recordFailure(ip: string, now: number) {
  const entry = failures.get(ip)
  if (!entry || now - entry.first > WINDOW_MS) {
    failures.set(ip, { count: 1, first: now })
  } else {
    entry.count += 1
  }
  // Keep the map from growing without bound.
  if (failures.size > 5000) {
    for (const [key, value] of failures) {
      if (now - value.first > WINDOW_MS) failures.delete(key)
    }
  }
}

function passwordMatches(given: string, expected: string): boolean {
  const a = crypto.createHash('sha256').update(given).digest()
  const b = crypto.createHash('sha256').update(expected).digest()
  return crypto.timingSafeEqual(a, b)
}

export async function POST(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword || !process.env.JWT_SECRET) {
    console.error('Login misconfigured: ADMIN_PASSWORD or JWT_SECRET is not set')
    return NextResponse.json({ error: 'Login is not configured on the server' }, { status: 500 })
  }

  const ip = getClientIP()
  const now = Date.now()
  if (isLocked(ip, now)) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again in a few minutes.' },
      { status: 429 }
    )
  }

  let password: unknown
  try {
    ;({ password } = await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (typeof password !== 'string' || !passwordMatches(password, adminPassword)) {
    recordFailure(ip, now)
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  failures.delete(ip)

  try {
    const token = await signAdminToken()
    const response = NextResponse.json({ success: true })
    response.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    return response
  } catch {
    console.error('Login error: could not sign the session token')
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
