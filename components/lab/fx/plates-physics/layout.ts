export type Kind = 'plate' | 'bowl' | 'glass' | 'fork' | 'knife' | 'spoon'
export type Spec = { id: string; kind: Kind; x: number; z: number; rot: number; delay: number; dish?: number; wine?: boolean }
export type DishInfo = { name: string; category: string }
export type Layout = { W: number; D: number; spots: [number, number][]; initial: Spec[]; candles: [number, number][] }

/** Half sizes W (x) and D (z) of the table top; `compact` = portrait phone framing. */
export function makeLayout(compact: boolean, light: boolean): Layout {
  if (compact) {
    const initial: Spec[] = [
      { id: 'pl-a', kind: 'plate', x: -1.4, z: -3.0, rot: 0.3, delay: 0.05 },
      { id: 'pl-b', kind: 'plate', x: 1.4, z: -3.0, rot: 1.1, delay: 0.3 },
      { id: 'kn-a', kind: 'knife', x: 2.3, z: -2.8, rot: 0.08, delay: 0.7 },
      { id: 'fk-a', kind: 'fork', x: -2.3, z: -2.8, rot: -0.06, delay: 0.5 },
    ]
    if (!light) initial.push(
      { id: 'bw-a', kind: 'bowl', x: -2.0, z: 3.6, rot: 0, delay: 0.4 },
      { id: 'bw-b', kind: 'bowl', x: 2.0, z: 3.6, rot: 0, delay: 0.6 },
      { id: 'gl-a', kind: 'glass', x: 0, z: -3.2, rot: 0, delay: 0.9, wine: true },
      { id: 'sp-a', kind: 'spoon', x: 0.05, z: 3.4, rot: 0.2, delay: 1.0 },
    )
    return { W: 2.7, D: 4.7, spots: [[-1.15, -0.7], [1.15, -0.7], [-1.15, 1.5], [1.15, 1.5]], initial, candles: [[-1.0, -4.4], [1.0, -4.4]] }
  }
  const initial: Spec[] = [
    { id: 'pl-a', kind: 'plate', x: -4.2, z: -1.2, rot: 0.3, delay: 0.05 },
    { id: 'pl-b', kind: 'plate', x: 4.2, z: -1.2, rot: 1.1, delay: 0.3 },
    { id: 'gl-a', kind: 'glass', x: -2.4, z: -2.0, rot: 0, delay: 0.9, wine: true },
    { id: 'gl-b', kind: 'glass', x: 2.4, z: -2.0, rot: 0, delay: 1.0 },
    { id: 'fk-a', kind: 'fork', x: -5.1, z: -1.2, rot: -0.05, delay: 0.5 },
    { id: 'kn-a', kind: 'knife', x: -3.3, z: -1.2, rot: 0.06, delay: 0.7 },
    { id: 'kn-b', kind: 'knife', x: 3.3, z: -1.2, rot: -0.07, delay: 0.8 },
    { id: 'fk-b', kind: 'fork', x: 5.1, z: -1.2, rot: 0.05, delay: 0.6 },
  ]
  if (!light) initial.push(
    { id: 'gl-c', kind: 'glass', x: 0, z: -2.1, rot: 0, delay: 1.1, wine: true },
    { id: 'bw-a', kind: 'bowl', x: -4.4, z: 1.9, rot: 0, delay: 0.4 },
    { id: 'bw-b', kind: 'bowl', x: 4.4, z: 1.9, rot: 0, delay: 0.55 },
    { id: 'sp-a', kind: 'spoon', x: -3.6, z: 2.2, rot: 0.25, delay: 1.2 },
    { id: 'sp-b', kind: 'spoon', x: 3.6, z: 2.2, rot: -0.2, delay: 1.3 },
  )
  return { W: 5.6, D: 3.2, spots: [[-3.3, 0.6], [-1.1, 0.6], [1.1, 0.6], [3.3, 0.6]], initial, candles: [[-1.3, -2.95], [1.3, -2.95]] }
}

/** Deterministic PRNG so spawn jitter never differs between renders. */
export function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
