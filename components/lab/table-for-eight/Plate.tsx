import { hash } from './content'

const FOODS = [['#C4361F', '#E8A33D', '#6E8F5A'], ['#E8C46A', '#B8742F', '#A9C3AE'], ['#7C2236', '#F1EEE6', '#6E8F5A'], ['#D98B4B', '#6E8F5A', '#F6B94F']]

/** A drawn plate from above. Dishes have no photos, so each gets a deterministic painted plate. */
export default function Plate({ name, className = '' }: { name: string; className?: string }) {
  const h = hash(name)
  const pal = FOODS[h % FOODS.length]
  const blobs = Array.from({ length: 7 }, (_, i) => {
    const a = ((h >> (i * 3)) & 63) / 63 * Math.PI * 2 + i, r = 8 + ((h >> (i + 5)) & 15)
    return { x: 60 + Math.cos(a) * r, y: 60 + Math.sin(a) * r, s: 7 + ((h >> (i + 2)) & 7), c: pal[i % 3] }
  })
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <defs><filter id={`pl-${h}`} x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="2" seed={h % 50} /><feDisplacementMap in="SourceGraphic" scale="4" /></filter></defs>
      <circle cx="60" cy="60" r="57" fill="#b98c47" /><circle cx="60" cy="60" r="52" fill="#F4F1EA" /><circle cx="60" cy="60" r="36" fill="none" stroke="#E4DFD2" strokeWidth="1.5" />
      <g filter={`url(#pl-${h})`}>{blobs.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r={b.s} fill={b.c} opacity=".92" />)}</g>
    </svg>
  )
}
