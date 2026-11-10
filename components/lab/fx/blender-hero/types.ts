export type Film = { id: number | string; title: string; rating: number; watchDate: string; posterUrl: string }

/** Shared, mutable story state (written by ScrollTrigger, read in useFrame). */
export const bh = { p: 0, pointerX: 0, pointerY: 0, idx: 0 }

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
export const smooth = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t) }
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3)
export const easeOutBack = (t: number, c = 1.7) => { const x = clamp01(t) - 1; return 1 + (c + 1) * x * x * x + c * x * x }
export const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s) }

export const BEAM_START = 0.5
export const PART_CAPTIONS = [
  { n: '01', t: 'Lens barrel', d: 'Slides forward on its mount' },
  { n: '02', t: 'Reels', d: 'Rise on their arms' },
  { n: '03', t: 'Lamp house', d: 'Lifts clear of the body' },
  { n: '04', t: 'Vent fins', d: 'Fan out in brass' },
  { n: '05', t: 'Crank and gate', d: 'Step out to the sides' },
]
