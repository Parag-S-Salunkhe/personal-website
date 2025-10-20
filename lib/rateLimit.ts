import { headers } from 'next/headers'
import crypto from 'crypto'

/**
 * Hash an IP address for privacy and rate limiting
 */
export function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex')
}

/**
 * Get the client IP address from request headers
 */
export function getClientIP(): string {
  const headersList = headers()
  const forwarded = headersList.get('x-forwarded-for')
  const realIP = headersList.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  return 'unknown'
}

/**
 * Get hashed client IP for rate limiting
 */
export function getHashedClientIP(): string {
  const ip = getClientIP()
  return hashIP(ip)
}
