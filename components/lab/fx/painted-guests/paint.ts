// Painting helpers on top of p5.brush (untyped). Every sprite is painted ONCE into an atlas / scenery graphic.
/* eslint-disable @typescript-eslint/no-explicit-any */
export type Pt = [number, number]

export const C = {
  cloth: '#17352A', clothDeep: '#10281F', linen: '#F1EEE6', candle: '#F6B94F', claret: '#7C2236', sage: '#A9C3AE', wax: '#FFF8EA', ink: '#1A1512',
}

export function rng(seed: number) {
  let a = seed >>> 0
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
export function mix(a: string, b: string, k: number) {
  const A = hex(a), B = hex(b)
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('')
}
export const dark = (c: string, k = 0.25) => mix(c, '#120d0b', k)
export const light = (c: string, k = 0.25) => mix(c, '#fff4e0', k)

/** Catmull-Rom through points (smooth outline). */
export function smoothPts(pts: Pt[], closed = true, seg = 5): Pt[] {
  const n = pts.length
  const out: Pt[] = []
  const get = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))])
  const last = closed ? n : n - 1
  for (let i = 0; i < last; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2)
    for (let s = 0; s < seg; s++) {
      const t = s / seg, t2 = t * t, t3 = t2 * t
      out.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ])
    }
  }
  if (!closed) out.push(pts[n - 1])
  return out
}

export function oval(cx: number, cy: number, rx: number, ry: number, n = 20, rot = 0, r?: () => number, j = 0): Pt[] {
  const out: Pt[] = []
  const cr = Math.cos(rot), sr = Math.sin(rot)
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const k = 1 + (r ? (r() - 0.5) * j : 0)
    const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k
    out.push([cx + x * cr - y * sr, cy + x * sr + y * cr])
  }
  return out
}

export function rrect(x: number, y: number, w: number, h: number, rad: number): Pt[] {
  const r = Math.min(rad, w / 2, h / 2)
  const o: Pt[] = []
  const arc = (cx: number, cy: number, a0: number) => { for (let i = 0; i <= 4; i++) { const a = a0 + (i / 4) * (Math.PI / 2); o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]) } }
  arc(x + w - r, y + r, -Math.PI / 2); arc(x + w - r, y + h - r, 0); arc(x + r, y + h - r, Math.PI / 2); arc(x + r, y + r, Math.PI)
  return o
}

/** A pen bound to a brush module + graphics. All coordinates are sprite-local (logical px). */
export class Pen {
  B: any
  r: () => number
  constructor(B: any, r: () => number) { this.B = B; this.r = r }
  /** Flat wash + ink outline (characters, props). ink=null: hairline in the fill colour. */
  shape(pts: Pt[], col: string, o: { ink?: string | null; sw?: number; op?: number; sm?: boolean; closed?: boolean } = {}) {
    const B = this.B
    const p = o.sm === false ? pts : smoothPts(pts, true, 4)
    B.noFill()
    B.set('2B', o.ink === null ? col : o.ink ?? C.ink, o.ink === null ? 0.25 : o.sw ?? 1.1)
    B.wash(col, o.op ?? 255)
    B.polygon(p)
    B.noWash()
  }
  /** Soft watercolour fill with bleeding edge (rooms, shading). */
  wc(pts: Pt[], col: string, op = 110, bleed = 0.22, tex = 0.55) {
    const B = this.B
    B.noStroke()
    B.noWash()
    B.fill(col, op)
    B.fillBleed(bleed)
    B.fillTexture(tex, 0.4)
    B.polygon(smoothPts(pts, true, 3))
    B.noFill()
  }
  wcOval(cx: number, cy: number, rx: number, ry: number, col: string, op = 110, bleed = 0.22) {
    this.wc(oval(cx, cy, rx, ry, 14, 0, this.r, 0.12), col, op, bleed)
  }
  /** Open ink / pencil stroke through points. */
  line(pts: Pt[], col = C.ink, sw = 1.2, brush = '2B', curv = 0.5) {
    const B = this.B
    B.noFill(); B.noWash()
    B.set(brush, col, sw)
    if (pts.length === 2) B.line(pts[0][0], pts[0][1], pts[1][0], pts[1][1])
    else B.spline(pts, curv)
  }
  poly(pts: Pt[], col: string, op = 255) { this.shape(pts, col, { ink: null, op, sm: false }) }
}
