import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'

// Search and AI-citation bots are allowed. The AI *training* bot policy
// (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot, Bytespider)
// is Parag's call; everything is allowed until he decides.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/login', '/lab', '/api/'] }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
