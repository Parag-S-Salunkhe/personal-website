// Same-origin image URL for TMDB posters (through the Next image optimizer), so WebGL textures load
// without CORS trouble. Allowed widths: 256, 384, 640, 750, 828, 1080 (quality 75). Other hosts pass
// through unchanged; only use those in <img>/next/image, not as WebGL textures.
// Copied from components/lab/kit/img.ts.
const TMDB = 'https://image.tmdb.org/'

export function siteImg(url: string | null | undefined, w: 256 | 384 | 640 | 750 | 828 | 1080 = 640): string | null {
  if (!url) return null
  if (url.startsWith(TMDB)) return `/_next/image?url=${encodeURIComponent(url)}&w=${w}&q=75`
  return url
}

/** true when the URL can be used as a WebGL texture (same-origin after siteImg). */
export const textureSafe = (url: string | null | undefined) => !!url && url.startsWith(TMDB)
