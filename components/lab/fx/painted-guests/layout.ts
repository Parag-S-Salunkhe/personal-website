// Shared scene geometry (logical 1600x900 space) used by the sketch and the HTML labels.
export const LW = 1600
export const LH = 900
export const TABLE = { far: 560, near: 690, drop: 842 }
export const SHOULDER_Y = 455
export const HEAD_Y = 340

export type Tier = 'full' | 'light'
export type CourseKind = 'starter' | 'main' | 'dessert' | 'bowl'
export type Course = { id: string; name: string; category: string; rating: number; kind: CourseKind }

export const GUEST_X = [160, 375, 590, 805, 1020, 1235, 1450]
export const REACTOR = 4 // the host's neighbour

export type Crop = { x: number; y: number; w: number; h: number }
export type Slot = { x: number; y: number }
export type Layout = { crop: Crop; guests: number[]; dishes: Slot[]; candles: Slot[]; lamps: number[] }

export function layoutFor(tier: Tier): Layout {
  if (tier === 'light') {
    return {
      crop: { x: 660, y: 0, w: 720, h: 900 },
      guests: [3, 4, 5],
      dishes: [{ x: 745, y: 652 }, { x: 930, y: 656 }, { x: 1115, y: 656 }, { x: 1300, y: 652 }],
      candles: [{ x: 700, y: 606 }, { x: 1020, y: 598 }, { x: 1345, y: 606 }],
      lamps: [790, 1250],
    }
  }
  return {
    crop: { x: 0, y: 0, w: LW, h: LH },
    guests: [0, 1, 2, 3, 4, 5, 6],
    dishes: [{ x: 330, y: 646 }, { x: 625, y: 650 }, { x: 990, y: 650 }, { x: 1290, y: 646 }, { x: 805, y: 668 }],
    candles: [{ x: 470, y: 606 }, { x: 805, y: 592 }, { x: 1140, y: 606 }],
    lamps: [400, 1200],
  }
}

// Scroll story (progress 0..1)
export const STORY = {
  candle: [0.0, 0.1, 0.22],
  course: [0.17, 0.31, 0.45, 0.59, 0.73],
  courseLen: 0.07,
  leanFrom: 0.72,
  leanTo: 0.88,
}
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
export const smooth = (a: number, b: number, v: number) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t) }
