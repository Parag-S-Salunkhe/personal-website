// Ported from components/lab/fx/tilt-shift/ (run 2 home).
export type Film = { title: string; rating: number; posterUrl: string | null }
export type Dish = { name: string; category: string; rating: number }

/** Shared between the camera rig and the world (mutable, read in useFrame). */
export type Shared = { p: number; reduced: boolean }

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
export function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Palette
export const WARM = '#F6B94F'
export const HOUSE_W = 3
export const HOUSE_D = 2.4
export const N_HOUSES = 6
export const HOST = 4
export const houseX = (i: number) => -7.5 + HOUSE_W * i
export const DOOR_DX = 0.85
export const HOST_WIN_DX = -0.55
export const DOOR_X = houseX(HOST) + DOOR_DX

export const BRICKS = ['#C0453A', '#D79B3C', '#A63D3A', '#7FA6C9', '#C9593F', '#E3D3A3']
export const DOORS = ['#1F8A8A', '#7C2236', '#2C5DA8', '#3E9B5B', '#E0657A', '#F2B134']
export const HEIGHTS = [2.9, 3.15, 2.9, 3.05, 3.1, 2.95]

/** Story beats (progress 0..1 of the scroll wrapper). */
export const BEATS = { arrive: 0.1, doorsOpen: 0.5, dinner: 0.62, film: 0.8 }
