// Film leader: the no-poster state. Concentric rings, crosshair, countdown numeral.
export default function PosterFallback({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 200 300" role="img" aria-label={label} className="h-full w-full">
      <rect width="200" height="300" fill="#1a0610" />
      <g fill="none" stroke="#D8A84E" strokeWidth="2">
        <circle cx="100" cy="140" r="78" opacity="0.9" />
        <circle cx="100" cy="140" r="62" opacity="0.5" />
        <circle cx="100" cy="140" r="46" strokeDasharray="4 6" opacity="0.6" />
        <path d="M100 52v176M12 140h176" opacity="0.45" />
      </g>
      <path d="M100 140L100 62A78 78 0 0 1 178 140Z" fill="#6B1A2B" opacity="0.6" />
      <text x="100" y="168" textAnchor="middle" fontSize="88" fontWeight="900" fill="#FFF3D6" style={{ fontFamily: 'var(--font-display), Impact, sans-serif' }}>3</text>
      <text x="100" y="270" textAnchor="middle" fontSize="13" fill="#FFF3D6" opacity="0.8" style={{ fontFamily: 'var(--font-body), sans-serif' }}>Poster still in the projector</text>
    </svg>
  )
}
