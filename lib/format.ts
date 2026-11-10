// Display helpers shared by the zine pages. Dates are stored as ISO strings by lib/content.ts.
export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

export const fmtLongDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

export const fmtRating = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1))

/** Plain-text content -> paragraphs (blank lines split paragraphs, single newlines stay as breaks). */
export const paragraphs = (text: string) =>
  text.replace(/\r\n/g, '\n').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)

export const readingMinutes = (text: string) => Math.max(1, Math.round(text.trim().split(/\s+/).length / 220))

/** Small deterministic tilt per item so paper objects sit a little crooked, the same way every render. */
const TILTS = [-2, 1.5, -1, 2.5, -1.5, 1, -2.5, 2]
export const tilt = (i: number, scale = 1) => TILTS[((i % TILTS.length) + TILTS.length) % TILTS.length] * scale
