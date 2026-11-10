// Evening time model shared by the home story, the pinned clock/candle and the inner page.
// T is the hour of the evening on a 24h+ scale: 19 = 7pm, 22.5 = 10:30pm, 25 = 1am.
export const T0 = 19
export const T1 = 25
export const TURN = 22.5
export const FEATURE_A = 23
export const FEATURE_B = 24.5

export const PAL = { dusk: '#E9A66B', blue: '#3B4F7A', night: '#0F1A2E', candle: '#F6B94F', beam: '#FFF3D6', claret: '#7C2236', cloth: '#17352A' } as const

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))
export const sm = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t) }
/** 0 outside [a,b], fades in over `f` hours at the start and out over `f` at the end. */
export const win = (T: number, a: number, b: number, f = 0.12) => sm(a, a + f, T) * (1 - sm(b - f, b, T))

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
export const mix = (a: string, b: string, t: number) => {
  const A = hex(a), B = hex(b)
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('')
}

/** How far the room has gone from dusk (0) through blue hour (1) to night (2). */
export const gradeAt = (T: number) => sm(19.4, 21.6, T) + sm(21.8, 23.2, T)

/** Palette tokens for the page chrome at time T (CSS variables). */
export function tokens(T: number) {
  const g = gradeAt(T)
  const sky = g < 1 ? mix(PAL.dusk, PAL.blue, g) : mix(PAL.blue, PAL.night, g - 1)
  const page = g < 1 ? mix('#2A2234', '#1B2640', g) : mix('#1B2640', PAL.night, g - 1)
  return { '--eve-sky': sky, '--eve-page': page, '--eve-glow': mix(PAL.candle, PAL.beam, sm(22.5, 24, T)) } as Record<string, string>
}

export function fmtTime(T: number) {
  const mins = Math.round(T * 60)
  const h24 = Math.floor(mins / 60) % 24, m = mins % 60
  const h = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h}:${String(m).padStart(2, '0')} ${h24 >= 12 ? 'pm' : 'am'}`
}

export const BEATS: { t: number; stamp: string }[] = [
  { t: 19, stamp: 'Seven. Everyone arrives.' },
  { t: 19.9, stamp: 'Eight. The starter.' },
  { t: 20.9, stamp: 'Nine. The main.' },
  { t: 21.9, stamp: 'Ten. Dessert.' },
  { t: 22.4, stamp: 'Ten thirty. The room turns.' },
  { t: 23, stamp: 'Eleven. The feature.' },
  { t: 24.55, stamp: 'Half past twelve. Credits.' },
  { t: 24.85, stamp: 'One. The door.' },
]
export const beatIndex = (T: number) => { let k = 0; BEATS.forEach((b, i) => { if (T >= b.t) k = i }); return k }

/** Tiny pub/sub holding the current evening time; the pinned clock publishes, the 3D scene and overlays read. */
type Fn = (T: number) => void
const subs = new Set<Fn>()
export const evening = {
  t: T0,
  set(T: number) { this.t = T; subs.forEach((f) => f(T)) },
  sub(f: Fn) { subs.add(f); f(this.t); return () => { subs.delete(f) } },
}

export type Film = { id: string; title: string; rating: number; watchDate: string; posterUrl: string }
export type Dish = { id: string; name: string; category: string; rating: number; review: string; cookDate: string }
export type Toast = { title: string; date: string; kind: string }
export type PlaceNote = { title: string; category: string }
export type StoryData = {
  films: Film[]
  dishes: Dish[]
  toasts: Toast[]
  notes: PlaceNote[]
  door: { message: string; date: string } | null
  moviesCount: number
}
