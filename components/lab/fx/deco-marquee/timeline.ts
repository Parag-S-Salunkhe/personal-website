export const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
export const smooth = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t) }
export type Story = { raw: number; p: number; t: number; still: boolean }

/** Which board text is up: -1 blank, 0..2 tonight's titles, 3 "Now showing". */
export function titleIndex(p: number): number {
  if (p < 0.22) return -1
  if (p < 0.38) return 0
  if (p < 0.5) return 1
  if (p < 0.78) return 2
  return 3
}

export type BulbDef = { x: number; y: number; z: number; g: 0 | 1 | 2; idx: number; n: number }

/** Bulb positions: canopy edge (g0), blade edges (g1), letter board frame (g2). idx is the chase order. */
export function makeBulbs(light: boolean): BulbDef[] {
  const sp = light ? 0.6 : 0.3
  const out: BulbDef[] = []
  // canopy: back-left -> front-left -> front-right -> back-right
  const z0 = 0.62, z1 = 3.44, hx = 3.84
  const L1 = z1 - z0, L2 = hx * 2, L3 = L1
  const cn = Math.round((L1 + L2 + L3) / sp)
  const rows = [3.27, 3.53]
  const at = (s: number): [number, number] => (s < L1 ? [-hx, z0 + s] : s < L1 + L2 ? [-hx + (s - L1), z1] : [hx, z1 - (s - L1 - L2)])
  // blade
  const bm = Math.round(5.7 / (sp * 1.1))
  // board frame
  const bw = 2.95, bh = 1.22, per = 2 * (bw + bh) * 2, bn = Math.round(per / (sp * 1.2))
  const total = cn + bm
  for (let i = 0; i < cn; i++) {
    const [x, z] = at((i / cn) * (L1 + L2 + L3))
    for (const y of rows) out.push({ x, y, z, g: 0, idx: i, n: total })
  }
  for (let k = 0; k < bm; k++) {
    const y = 4.5 + (k / (bm - 1)) * 5.6
    for (const x of [-4.2, -3.3]) out.push({ x, y, z: 1.64, g: 1, idx: cn + k, n: total })
  }
  for (let i = 0; i < bn; i++) {
    const s = (i / bn) * per, w = bw * 2, h = bh * 2
    let x: number, y: number
    if (s < w) { x = -bw + s; y = 6 + bh } else if (s < w + h) { x = bw; y = 6 + bh - (s - w) } else if (s < 2 * w + h) { x = bw - (s - w - h); y = 6 - bh } else { x = -bw; y = 6 - bh + (s - 2 * w - h) }
    out.push({ x, y, z: 0.76, g: 2, idx: i, n: bn })
  }
  return out
}

/** Brightness multiplier for one bulb: ignition overshoot, then a chase running round. */
export function bulbLevel(b: BulbDef, p: number, t: number, still: boolean): number {
  if (still) return 0.55 + (((b.idx % 6) < 3) ? 0.9 : 0)
  if (b.g === 2) {
    const s = smooth(0.2, 0.3, p) * (b.n + 6) - b.idx
    if (s <= 0) return 0.01
    const flash = 1 + 1.4 * Math.exp(-s * 0.9)
    return flash * (((b.idx + Math.floor(t * 3)) % 2) ? 0.75 : 0.5) + (s < 3 ? 0.6 : 0)
  }
  const s = smooth(0.05, 0.27, p) * (b.n + 8) - b.idx
  if (s <= 0) return 0.01
  const flash = 1 + 1.6 * Math.exp(-s * 0.8)
  const ph = (((b.idx - t * 14) % 8) + 8) % 8
  const chase = smooth(0.24, 0.32, p)
  const base = 0.62 + (ph < 3 ? 0.9 : 0) * chase
  return base * (s < 6 ? flash : 1)
}

export type BoardRows = string[]
export const COLS = 12
export const ROWS = 3

/** Wrap a title into up to 3 rows of 12 caps, centred. Returns ROWS*COLS characters. */
export function layoutTitle(title: string): string {
  const clean = title.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9&'!?.:\-, ]/g, ' ')
  const words = clean.split(/\s+/).filter(Boolean).map((w) => w.slice(0, COLS))
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    if (!cur) cur = w
    else if ((cur + ' ' + w).length <= COLS) cur += ' ' + w
    else { lines.push(cur); cur = w }
  }
  if (cur) lines.push(cur)
  const used = lines.slice(0, ROWS)
  if (lines.length > ROWS) used[ROWS - 1] = used[ROWS - 1].slice(0, COLS - 1) + '.'
  const start = Math.floor((ROWS - used.length) / 2)
  let out = ''
  for (let r = 0; r < ROWS; r++) {
    const l = used[r - start] ?? ''
    const pad = Math.floor((COLS - l.length) / 2)
    out += (' '.repeat(pad) + l).padEnd(COLS, ' ')
  }
  return out
}
