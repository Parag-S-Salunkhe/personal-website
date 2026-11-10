// Ornate deco title-card border drawn in SVG. Decorative; the card text sits in HTML above it.
const INK = '#E6D9BC'

function corner(cx: number, cy: number, sx: number, sy: number, key: string) {
  const px = cx + sx * 20
  const py = cy + sy * 20
  const lines = Array.from({ length: 7 }, (_, k) => {
    const a = (k * 90) / 6 * (Math.PI / 180)
    const x2 = px + sx * 30 * Math.cos(a)
    const y2 = py + sy * 30 * Math.sin(a)
    return <line key={k} x1={px} y1={py} x2={x2.toFixed(1)} y2={y2.toFixed(1)} />
  })
  return (
    <g key={key} stroke={INK} strokeWidth={1.2} fill="none">
      {lines}
      <path d={`M ${px + sx * 30} ${py} A 30 30 0 0 ${sx * sy > 0 ? 1 : 0} ${px} ${py + sy * 30}`} strokeWidth={2} />
      <path d={`M ${px + sx * 38} ${py} L ${px + sx * 38} ${py + sy * 8} L ${px + sx * 46} ${py + sy * 8} L ${px + sx * 46} ${py + sy * 16}`} />
      <rect x={Math.min(cx + sx * 12, cx + sx * 18)} y={Math.min(cy + sy * 12, cy + sy * 18)} width={6} height={6} fill={INK} stroke="none" />
    </g>
  )
}

function diamond(x: number, y: number, r: number, key: string) {
  return <path key={key} d={`M ${x - r * 2} ${y} L ${x} ${y - r} L ${x + r * 2} ${y} L ${x} ${y + r} Z`} fill={INK} />
}

export default function Border({ w, h, className }: { w: number; h: number; className?: string }) {
  return (
    <svg className={className} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" focusable="false" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <rect x={8} y={8} width={w - 16} height={h - 16} fill="none" stroke={INK} strokeWidth={3.5} />
      <rect x={17} y={17} width={w - 34} height={h - 34} fill="none" stroke={INK} strokeWidth={1} />
      {corner(8, 8, 1, 1, 'a')}
      {corner(w - 8, 8, -1, 1, 'b')}
      {corner(8, h - 8, 1, -1, 'c')}
      {corner(w - 8, h - 8, -1, -1, 'd')}
      {diamond(w / 2, 12.5, 5, 't')}
      {diamond(w / 2, h - 12.5, 5, 'u')}
      {diamond(12.5, h / 2, 5, 'l')}
      {diamond(w - 12.5, h / 2, 5, 'r')}
    </svg>
  )
}

/** Both orientations: portrait on phones, landscape from md up. */
export function ResponsiveBorder() {
  return (
    <>
      <Border w={360} h={480} className="md:hidden" />
      <Border w={640} h={480} className="hidden md:block" />
    </>
  )
}
