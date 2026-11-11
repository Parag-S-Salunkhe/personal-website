// Ported from components/lab/table-for-eight/ (run 2 home).
// Seat layout and shared types for the Table orbit experiment (no React, safe on server and client).
export type SeatKey = 'movies' | 'cooking' | 'writing' | 'notes' | 'projects' | 'guestbook' | 'you-a' | 'you-b'

export type SeatCard = {
  key: SeatKey
  /** Place-card name (Pinyon Script). */
  name: string
  /** The latest real item (Gilda Display). */
  headline: string
  /** One short line under it. */
  meta: string
  href: string | null
  /** The link line on the card. */
  cta?: string
}

export type Seat = { key: SeatKey; pos: [number, number, number]; dir: [number, number, number] }

export const TABLE_L = 6.6
export const TABLE_W = 1.5
export const TABLE_H = 0.76

/** Eight seats, going once round the table: left end, back row L-R, right end, front row R-L.
 *  pos = centre of the plate; dir = unit vector pointing from the diner towards the table centre. */
export const SEATS: Seat[] = [
  { key: 'movies', pos: [-2.9, TABLE_H, 0], dir: [1, 0, 0] },
  { key: 'cooking', pos: [-1.7, TABLE_H, -0.42], dir: [0, 0, 1] },
  { key: 'writing', pos: [0, TABLE_H, -0.42], dir: [0, 0, 1] },
  { key: 'notes', pos: [1.7, TABLE_H, -0.42], dir: [0, 0, 1] },
  { key: 'projects', pos: [2.9, TABLE_H, 0], dir: [-1, 0, 0] },
  { key: 'guestbook', pos: [1.7, TABLE_H, 0.42], dir: [0, 0, -1] },
  { key: 'you-a', pos: [0, TABLE_H, 0.42], dir: [0, 0, -1] },
  { key: 'you-b', pos: [-1.7, TABLE_H, 0.42], dir: [0, 0, -1] },
]

export const CANDLES: { x: number; z: number; h: number }[] = [
  { x: -2.3, z: 0.02, h: 0.34 },
  { x: -1.0, z: -0.05, h: 0.46 },
  { x: 0.35, z: 0.03, h: 0.38 },
  { x: 1.45, z: -0.04, h: 0.5 },
  { x: 2.4, z: 0.04, h: 0.3 },
]

export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
