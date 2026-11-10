export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

/** Rating as a row of filled squares. */
export function Rating({ value, on = 'currentColor', max = 5 }: { value: number; on?: string; max?: number }) {
  const v = Math.max(0, Math.min(max, Math.round(value)))
  return (
    <span role="img" aria-label={`Rated ${v} out of ${max}`} className="inline-flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="h-3 w-3 rounded-[3px] border-2"
          style={{ borderColor: on, background: i < v ? on : 'transparent' }}
        />
      ))}
    </span>
  )
}

export function isTmdb(url: string | null): url is string {
  if (!url) return false
  try {
    return new URL(url).hostname === 'image.tmdb.org'
  } catch {
    return false
  }
}
