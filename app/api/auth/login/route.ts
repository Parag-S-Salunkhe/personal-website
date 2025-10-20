import { NextResponse } from 'next/server'
import { SignJWT } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

export async function POST(request: Request) {
  console.log('🟢 Login API called')
  
  try {
    const { password } = await request.json()
    
    console.log('🟢 Password check:', password === ADMIN_PASSWORD)
    
    if (password === ADMIN_PASSWORD) {
      // Create JWT token using jose
      const secret = new TextEncoder().encode(JWT_SECRET)
      const token = await new SignJWT({ authenticated: true })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secret)
      
      console.log('🟢 Token created successfully')
      
      const response = NextResponse.json({ success: true })
      
      // Set cookie
      response.cookies.set('admin-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })
      
      console.log('🟢 Cookie set')
      return response
    } else {
      console.log('🟢 Invalid password')
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('🟢 Login error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
