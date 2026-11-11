/** The score as five candle flames: lit up to the score (rounded), the exact score in the label. */
import { fmtRating } from '@/lib/format'

export default function Rating({ n, size = 'md', className = '' }: { n: number; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const lit = Math.round(n)
  const h = size === 'lg' ? 'h-7' : size === 'sm' ? 'h-4' : 'h-5'
  return (
    <span role="img" aria-label={`Rated ${fmtRating(n)} of 5`} className={`inline-flex items-end gap-1 ${className}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 12 20" className={`${h} w-auto ${i < lit ? 'ev-glow' : ''}`} aria-hidden="true">
          <path d="M6 1 C9 6 10 10 6 14 C2 10 3 6 6 1 Z" fill={i < lit ? 'var(--candle)' : 'none'} stroke={i < lit ? 'none' : 'currentColor'} strokeOpacity=".55" strokeWidth="1" />
          <rect x="5.4" y="14" width="1.2" height="5" fill="currentColor" opacity=".5" />
        </svg>
      ))}
    </span>
  )
}
