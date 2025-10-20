import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log('🔷 Middleware checking:', pathname)
  
  // Only protect /admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin-token')?.value
    
    console.log('🔷 Token exists:', !!token)
    
    if (!token) {
      console.log('🔷 No token found, redirecting to login')
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
    
    try {
      // Use jose library for edge runtime compatibility
      const secret = new TextEncoder().encode(JWT_SECRET)
      await jwtVerify(token, secret)
      
      console.log('🔷 Token verified successfully')
      return NextResponse.next()
    } catch (error) {
      console.error('🔷 Token verification failed:', error)
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
