import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/auth-token'

export const dynamic = 'force-dynamic'

export async function GET() {
  const token = cookies().get(ADMIN_COOKIE)?.value
  if (!(await verifyAdminToken(token))) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
  return NextResponse.json({ authenticated: true })
}
