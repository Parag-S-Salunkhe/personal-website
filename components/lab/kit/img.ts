// Same-origin image URL for TMDB posters (via the Next image optimizer), so WebGL textures load
// without CORS trouble. Allowed widths: 256, 384, 640, 750, 828, 1080. Quality is fixed at 75.
const TMDB = 'https://image.tmdb.org/'

export function labImg(url: string | null | undefined, w: 256 | 384 | 640 | 750 | 828 | 1080 = 640): string | null {
  if (!url) return null
  if (url.startsWith(TMDB)) return `/_next/image?url=${encodeURIComponent(url)}&w=${w}&q=75`
  return url
}
