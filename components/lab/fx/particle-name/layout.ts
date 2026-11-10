import { mulberry32 } from './rng'
import { sampleWord } from './sample'

export interface Layout {
  n: number
  viewW: number
  viewH: number
  cy: number
  /** kernel radius, world units */
  r: number
  /** xyz targets for word one and word two, x-sorted */
  t1: Float32Array
  t2: Float32Array
  /** xyz heap slots inside the bucket */
  slots: Float32Array
  floorY: number
  wallX: number
  bucket: { R: number; bh: number; cy: number; rimY: number; bottom: number }
  portrait: boolean
}

export const CAM = { fov: 35, z: 14 }

export function computeLayout(aspect: number, n: number, family: string): Layout {
  const viewH = 2 * Math.tan((CAM.fov * Math.PI) / 360) * CAM.z
  const viewW = viewH * aspect
  const portrait = aspect < 0.85
  const lines1 = portrait ? ['PA', 'RAG'] : ['PARAG']
  const lines2 = portrait ? ['MOV', 'IES'] : ['MOVIES']
  const maxW = viewW * (portrait ? 0.88 : 0.82)
  const maxH = viewH * (portrait ? 0.44 : 0.34)
  const cy = viewH * (portrait ? 0.07 : 0.1)
  const a = sampleWord(lines1, family, n, maxW, maxH, 11)
  const b = sampleWord(lines2, family, n, maxW, maxH, 23)
  const rnd = mulberry32(5)
  const r = ((a.spacing + b.spacing) / 2) * 0.95
  const t1 = new Float32Array(n * 3)
  const t2 = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    t1[i * 3] = a.xy[i * 2]
    t1[i * 3 + 1] = a.xy[i * 2 + 1] + cy
    t1[i * 3 + 2] = (rnd() - 0.5) * r * 1.6
    t2[i * 3] = b.xy[i * 2]
    t2[i * 3 + 1] = b.xy[i * 2 + 1] + cy
    t2[i * 3 + 2] = (rnd() - 0.5) * r * 1.6
  }
  // paper bucket at the bottom centre
  const R = Math.min(1.5, viewW * 0.3)
  const bh = R * 1.7
  const bottom = -viewH / 2 + 0.12
  const rimY = bottom + bh
  const domeH = R * 0.55
  const slab = R * 0.25
  const Rs = R * 0.9
  const slots = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    let rho = 0, yy = rimY
    for (let k = 0; k < 30; k++) {
      rho = Rs * Math.sqrt(rnd())
      yy = rimY - slab + (slab + domeH) * rnd()
      if (yy <= rimY + domeH * (1 - (rho / R) ** 2)) break
    }
    const th = rnd() * Math.PI * 2
    slots[i * 3] = rho * Math.cos(th)
    slots[i * 3 + 1] = yy
    slots[i * 3 + 2] = rho * Math.sin(th) * 0.9
  }
  return { n, viewW, viewH, cy, r, t1, t2, slots, floorY: -viewH / 2 + 0.1, wallX: viewW / 2 - 0.15, bucket: { R, bh, cy: bottom + bh / 2, rimY, bottom }, portrait }
}
