import './writing.css'

/** A single candle; the flame flickers with CSS keyframes (still under reduced motion). Decorative. */
export default function Candle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 120" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="wr-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#F6B94F" stopOpacity="0.55" />
          <stop offset="1" stopColor="#F6B94F" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle className="wr-glow" cx="30" cy="30" r="30" fill="url(#wr-halo)" />
      <rect x="20" y="52" width="20" height="62" rx="2" fill="#F1EEE6" />
      <rect x="20" y="52" width="20" height="62" rx="2" fill="#000" opacity=".08" />
      <ellipse cx="30" cy="52" rx="10" ry="2.5" fill="#fff8ea" />
      <path d="M30 52 v-8" stroke="#2a2118" strokeWidth="1.6" strokeLinecap="round" />
      <g className="wr-flame">
        <path d="M30 14 C37 24 39 33 30 44 C21 33 23 24 30 14 Z" fill="#F6B94F" />
        <path d="M30 28 C33 33 33 38 30 43 C27 38 27 33 30 28 Z" fill="#FFF8EA" />
      </g>
    </svg>
  )
}
