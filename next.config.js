/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
  { key: 'X-Frame-Options', value: 'DENY' },
  // Enforced: framing only. The full policy below runs Report-Only until Parag switches it on.
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
  { key: 'Content-Security-Policy-Report-Only', value: cspReportOnly() },
]

// Next inlines its bootstrap scripts and next/font + framer-motion set inline styles, so
// 'unsafe-inline' stays until pages move to nonces (which would end static/ISR rendering).
// Images: TMDB through the optimizer, other https hosts shown directly (unoptimized).
function cspReportOnly() {
  const dev = process.env.NODE_ENV !== 'production'
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    `connect-src 'self'${dev ? ' ws: wss:' : ''}`,
    "media-src 'self'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}

const nextConfig = {
  poweredByHeader: false,
  async headers() {
    const noindex = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]
    return [
      { source: '/:path*', headers: securityHeaders },
      // Private and prototype pages stay out of search even if a link to them leaks.
      { source: '/admin/:path*', headers: noindex },
      { source: '/admin', headers: noindex },
      { source: '/login', headers: noindex },
      { source: '/lab/:path*', headers: noindex },
      { source: '/lab', headers: noindex },
    ]
  },
  images: {
    // Only TMDB posters go through the optimizer (no open image proxy). Other hosts render
    // with `unoptimized` (see lib/url.ts isOptimizable), so unknown prod hosts can't break a page.
    remotePatterns: [{ protocol: 'https', hostname: 'image.tmdb.org', pathname: '/t/p/**' }],
  },
}

module.exports = nextConfig
