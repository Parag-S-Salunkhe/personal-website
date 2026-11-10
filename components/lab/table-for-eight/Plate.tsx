// Hand-authored plate illustrations: the designed "no photo" state for dishes, posters and posts.
type Props = { variant?: number; kind?: 'dish' | 'film' | 'empty'; className?: string }

export function Plate({ variant = 0, kind = 'dish', className }: Props) {
  const v = Math.abs(variant) % 3
  const id = `pl${kind}${v}`
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${id}-w`} cx="40%" cy="35%" r="75%">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#DCD7CA" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="68" rx="52" ry="50" fill="#0B1C15" opacity=".35" />
      <circle cx="60" cy="60" r="54" fill="#F1EEE6" />
      <circle cx="60" cy="60" r="54" fill="none" stroke="#C9C3B2" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="44" fill={`url(#${id}-w)`} stroke="#CFC9BB" strokeWidth="1" />
      <circle cx="60" cy="60" r="49" fill="none" stroke="#7C2236" strokeWidth=".8" strokeDasharray="2 4" opacity=".55" />
      {kind === 'dish' && v === 0 && (
        <g>
          <path d="M34 66c10-20 38-26 56-10-14 4-22 18-56 10z" fill="#7C2236" opacity=".85" />
          <circle cx="62" cy="58" r="9" fill="#F6B94F" />
          <path d="M60 46c-3-9 3-14 9-15-1 7-3 12-9 15z M60 46c-8-4-9-11-6-16 6 3 8 9 6 16z" fill="#2F6B4B" />
        </g>
      )}
      {kind === 'dish' && v === 1 && (
        <g>
          <path d="M30 60a30 30 0 0 1 60 0z" fill="#F6B94F" />
          <path d="M30 60a30 30 0 0 1 60 0" fill="none" stroke="#B8802A" strokeWidth="2" />
          <path d="M42 70c8 6 28 6 36 0" stroke="#7C2236" strokeWidth="4" strokeLinecap="round" fill="none" />
          <circle cx="50" cy="48" r="2" fill="#FFF8EA" /><circle cx="64" cy="42" r="2" fill="#FFF8EA" /><circle cx="74" cy="52" r="2" fill="#FFF8EA" />
        </g>
      )}
      {kind === 'dish' && v === 2 && (
        <g fill="none" strokeLinecap="round">
          <path d="M36 54c8-8 14 8 22 0s14 8 22 0" stroke="#F6B94F" strokeWidth="5" />
          <path d="M36 66c8-8 14 8 22 0s14 8 22 0" stroke="#F6B94F" strokeWidth="5" />
          <path d="M44 78c6-5 10 5 16 0s10 5 16 0" stroke="#7C2236" strokeWidth="3" />
          <circle cx="78" cy="42" r="4" fill="#2F6B4B" stroke="none" />
        </g>
      )}
      {kind === 'film' && (
        <g>
          <circle cx="60" cy="60" r="26" fill="#17352A" />
          <circle cx="60" cy="60" r="26" fill="none" stroke="#F6B94F" strokeWidth="1.5" />
          <path d="M53 49l20 11-20 11z" fill="#F6B94F" />
        </g>
      )}
      {kind === 'empty' && (
        <circle cx="60" cy="60" r="30" fill="none" stroke="#7C2236" strokeWidth="1.5" strokeDasharray="3 5" opacity=".6" />
      )}
    </svg>
  )
}
