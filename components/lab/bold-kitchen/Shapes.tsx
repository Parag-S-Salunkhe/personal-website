// Hand-authored enamel-kitchen SVG illustrations. Colours come from the wrapper's CSS variables.
import s from './styles.module.css'

export function Mug({ body = 'var(--tomato)', rim = 'var(--ink)', className = '' }: { body?: string; rim?: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="46" cy="52" r="34" fill={body} />
      <circle cx="46" cy="52" r="26" fill="none" stroke={rim} strokeWidth="4" />
      <path d="M78 40 a16 16 0 0 1 0 26" fill="none" stroke={body} strokeWidth="9" strokeLinecap="round" />
      <circle cx="46" cy="52" r="6" fill={rim} />
    </svg>
  )
}

export function HalfDisc({ fill = 'var(--pea)', className = '' }: { fill?: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <path d="M0 100 A50 50 0 0 1 100 100 Z" fill={fill} transform="translate(0 -10)" />
      <circle cx="50" cy="28" r="12" fill="var(--ink)" />
    </svg>
  )
}

export function Quarter({ fill = 'var(--cobalt)', className = '' }: { fill?: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <path d="M0 100 L0 0 A100 100 0 0 1 100 100 Z" fill={fill} />
      <circle cx="68" cy="68" r="10" fill="var(--tile)" />
    </svg>
  )
}

export function Stripes({ a = 'var(--ink)', className = '' }: { a?: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x="0" y={6 + i * 20} width="100" height="10" rx="5" fill={a} />
      ))}
    </svg>
  )
}

/** Enamel pot with a lid, steam and handles: the no-photo dish state. */
export function Pot({ body = 'var(--tomato)', className = '', steam = true }: { body?: string; className?: string; steam?: boolean }) {
  return (
    <svg viewBox="0 0 240 160" className={className} role="img" aria-label="An enamel pot, no photo yet">
      <rect width="240" height="160" rx="24" fill="var(--grout)" />
      {steam && (
        <g fill="none" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round">
          <path className={s.steam} d="M98 52 q-8 -10 0 -18 q8 -8 0 -16" />
          <path className={s.steam} style={{ animationDelay: '-1.3s' }} d="M122 50 q-8 -10 0 -18 q8 -8 0 -16" />
          <path className={s.steam} style={{ animationDelay: '-2.6s' }} d="M146 52 q-8 -10 0 -18 q8 -8 0 -16" />
        </g>
      )}
      <rect x="40" y="76" width="22" height="12" rx="6" fill="var(--ink)" />
      <rect x="178" y="76" width="22" height="12" rx="6" fill="var(--ink)" />
      <path d="M58 70 h124 v46 a26 26 0 0 1 -26 26 h-72 a26 26 0 0 1 -26 -26 Z" fill={body} />
      <rect x="52" y="60" width="136" height="16" rx="8" fill="var(--ink)" />
      <circle cx="120" cy="54" r="8" fill="var(--ink)" />
      <path d="M72 92 v22" stroke="var(--tile)" strokeWidth="6" strokeLinecap="round" opacity=".7" />
      <rect x="40" y="146" width="160" height="6" rx="3" fill="var(--ink)" opacity=".15" />
    </svg>
  )
}

/** Film reel on a cobalt field: the no-poster movie state. */
export function Reel({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 300" className={className} role="img" aria-label="A film reel, no poster yet" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="300" fill="var(--ink)" opacity=".28" />
      <circle cx="100" cy="150" r="70" fill="var(--tile)" />
      <circle cx="100" cy="150" r="14" fill="var(--cobalt)" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle key={a} cx={100 + 40 * Math.cos((a * Math.PI) / 180)} cy={150 + 40 * Math.sin((a * Math.PI) / 180)} r="12" fill="var(--cobalt)" />
      ))}
      <rect x="0" y="236" width="200" height="14" fill="var(--tile)" opacity=".9" />
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={i} x={6 + i * 20} y="239" width="8" height="8" rx="2" fill="var(--cobalt)" />
      ))}
    </svg>
  )
}

/** Poster block circle motif for posts. */
export function Plate({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="48" fill="var(--mustard)" />
      <circle cx="50" cy="50" r="32" fill="none" stroke="var(--ink)" strokeWidth="3" />
      <circle cx="50" cy="50" r="10" fill="var(--ink)" />
    </svg>
  )
}
