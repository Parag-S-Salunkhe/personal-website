// Edge-safe helpers for the admin session token (used by middleware and route handlers).
import { jwtVerify, SignJWT } from 'jose'

export const ADMIN_COOKIE = 'admin-token'

/**
 * Returns the JWT signing key. Throws when JWT_SECRET is missing so the app
 * fails closed. Only call this inside a request handler, never at module
 * scope, so builds without the env var still succeed.
 */
export function getJwtSecret(): Uint8Array {
  const value = process.env.JWT_SECRET
  if (!value) {
    throw new Error('JWT_SECRET is not set')
  }
  return new TextEncoder().encode(value)
}

/** True when the token is a valid, unexpired admin session token. */
export async function verifyAdminToken(token: string | undefined): Promise<boolean> {
  if (!token) return false
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), { algorithms: ['HS256'] })
    return payload.authenticated === true
  } catch {
    return false
  }
}

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret())
}
