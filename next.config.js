/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
  { key: 'X-Frame-Options', value: 'DENY' },
  // Only frame-ancestors for now; the full CSP comes later as Report-Only first.
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
]

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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
      {
        protocol: 'https',
        hostname: '**', // Allow all other HTTPS images
      },
    ],
  },
}

module.exports = nextConfig
