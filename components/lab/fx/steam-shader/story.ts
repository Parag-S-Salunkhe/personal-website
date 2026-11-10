// The scroll story as a pure function of progress: where each plate is, how hot it is, how low the candle burns.
export type Plate = { x: number; lift: number; ry: number; rz: number; grow: number; heat: number; vis: boolean; cap: number }
export type Sim = { t: number; p: number; intro: number; level: number; heat: number; flick: number; plates: Plate[] }

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
export const smooth = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t) }
const W = 0.07
export const swapAt = (k: number) => 0.18 + (k - 1) * 0.18 // k = 1..n-1: progress at which dish k replaces dish k-1

export function makeSim(n: number): Sim {
  return { t: 0, p: 0, intro: 0, level: 1, heat: 1, flick: 1, plates: Array.from({ length: n }, () => ({ x: 0, lift: 0, ry: 0, rz: 0, grow: 0, heat: 1, vis: false, cap: 0 })) }
}

export function evalStory(sim: Sim) {
  const { p, intro } = sim
  const n = sim.plates.length
  const introE = 1 - Math.pow(1 - clamp01(intro), 3)
  for (let i = 0; i < n; i++) {
    const pl = sim.plates[i]
    const uIn = i === 0 ? 1 : smooth(swapAt(i) - W, swapAt(i) + W, p)
    const uOut = i === n - 1 ? 0 : smooth(swapAt(i + 1) - W, swapAt(i + 1) + W, p)
    const arrive = i === 0 ? introE : 1
    pl.x = (1 - uIn) * 6.2 - uOut * 6.2 + (1 - arrive) * 5.5
    pl.ry = (1 - uIn) * -2.4 + uOut * 2.4 + (1 - arrive) * -1.2
    pl.lift = 0.35 * (Math.sin(Math.PI * uIn) * (i === 0 ? 0 : 1) + Math.sin(Math.PI * uOut)) + (1 - arrive) * 0.1
    pl.rz = (1 - uIn) * 0.12 - uOut * 0.12
    pl.heat = i === n - 1 ? 1 - smooth(0.7, 0.97, p) * 0.94 : 1
    pl.grow = (i === 0 ? smooth(0.15, 1, introE) : smooth(0.3, 1, uIn)) * (1 - smooth(0, 0.55, uOut)) * (0.3 + 0.7 * pl.heat)
    pl.vis = uIn > 0.001 && uOut < 0.999
    pl.cap = (i === 0 ? smooth(0.5, 1, introE) : smooth(0.55, 1, uIn)) * (1 - smooth(0, 0.45, uOut))
  }
  sim.level = 1 - smooth(0.7, 1, p) * 0.72
  sim.heat = sim.plates[n - 1]?.heat ?? 1
}
