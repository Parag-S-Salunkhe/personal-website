// URL helpers: only plain http(s) links may be stored or rendered as hrefs.

/** Returns the URL when it is an absolute http(s) URL, otherwise null. */
export function safeHttpUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  try {
    const url = new URL(trimmed)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

/**
 * For write handlers: empty values become null; non-empty values must be http(s).
 * Returns { ok: false } when a non-empty value is not a valid http(s) URL.
 */
export function optionalHttpUrl(value: unknown): { ok: true; value: string | null } | { ok: false } {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    return { ok: true, value: null }
  }
  const safe = safeHttpUrl(value)
  return safe ? { ok: true, value: safe } : { ok: false }
}
