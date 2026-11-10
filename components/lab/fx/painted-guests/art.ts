// Original painted guests, dishes, candles and the room. All painting uses p5.brush through Pen.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { C, Pen, dark, light, mix, oval, rrect, smoothPts, type Pt } from './paint'
import { GUEST_X, LW, SHOULDER_Y, TABLE, type CourseKind } from './layout'

export type GuestSpec = {
  x: number; skin: string; hair: string; hairStyle: 'bun' | 'curly' | 'crop' | 'long' | 'wavy' | 'bald' | 'bob'
  glasses: null | 'round' | 'square'; beard: null | 'full' | 'mous'; top: string; garment: 'cardigan' | 'scarf' | 'collar' | 'dress'
  inner: string; scarf?: string; rx: number; ry: number; sw: number; armSide: -1 | 0 | 1; hand: 'open' | 'fist'; earrings?: string; chair: string; beardCol?: string
}

export const GUESTS: GuestSpec[] = [
  { x: GUEST_X[0], skin: '#E9BC98', hair: '#3A271F', hairStyle: 'bun', glasses: null, beard: null, top: '#F1EEE6', garment: 'scarf', inner: '#F1EEE6', scarf: '#A9C3AE', rx: 70, ry: 88, sw: 142, armSide: 0, hand: 'fist', earrings: '#F6B94F', chair: '#6B4A33' },
  { x: GUEST_X[1], skin: '#8E5B3C', hair: '#1C1511', hairStyle: 'curly', glasses: null, beard: null, top: '#E2A640', garment: 'cardigan', inner: '#F1EEE6', rx: 74, ry: 90, sw: 158, armSide: 0, hand: 'fist', chair: '#4D3626' },
  { x: GUEST_X[2], skin: '#F0CDAD', hair: '#C8C4BC', hairStyle: 'crop', glasses: 'round', beard: 'full', top: '#7FA08A', garment: 'cardigan', inner: '#FFF8EA', rx: 78, ry: 94, sw: 168, armSide: 0, hand: 'fist', chair: '#7A5638', beardCol: '#D9D5CD' },
  { x: GUEST_X[3], skin: '#D8A27C', hair: '#583522', hairStyle: 'long', glasses: null, beard: null, top: '#FFF8EA', garment: 'dress', inner: '#FFF8EA', rx: 72, ry: 90, sw: 150, armSide: 0, hand: 'fist', earrings: '#7C2236', chair: '#5E4130' },
  { x: GUEST_X[4], skin: '#C98B62', hair: '#2A1D18', hairStyle: 'wavy', glasses: 'round', beard: null, top: '#A9C3AE', garment: 'cardigan', inner: '#F1EEE6', scarf: '#7C2236', rx: 74, ry: 90, sw: 158, armSide: 1, hand: 'open', chair: '#6B4A33' },
  { x: GUEST_X[5], skin: '#F3D3BA', hair: '#8F8C86', hairStyle: 'bald', glasses: 'square', beard: 'mous', top: '#7C2236', garment: 'cardigan', inner: '#F1EEE6', rx: 82, ry: 96, sw: 172, armSide: -1, hand: 'fist', chair: '#4D3626', beardCol: '#9A968F' },
  { x: GUEST_X[6], skin: '#B07651', hair: '#4A2F25', hairStyle: 'bob', glasses: null, beard: null, top: '#F6B94F', garment: 'collar', inner: '#F1EEE6', rx: 70, ry: 88, sw: 146, armSide: 0, hand: 'fist', earrings: '#F1EEE6', chair: '#7A5638' },
]

export const HEAD = { w: 300, h: 330, cx: 150, cy: 175, pivotY: 262 }
export const BODY = { w: 420, h: 170, nx: 210 }
export const ARM = { uw: 70, uh: 112, ux: 35, uy: 14, UL: 92, fw: 90, fh: 126, fx: 45, fy: 14, FL: 84 }
export const GLASS = { w: 56, h: 110, px: 28, py: 56 }
export const EYES = { w: 170, h: 60 }
export const MOUTH = { w: 110, h: 64 }
export const FLAME = { w: 56, h: 100, px: 28, py: 94 }
export const CANDLE = { w: 60, h: 200, px: 30, py: 196 }
export const GLOW = { s: 480 }
export const DISH = { w: 300, h: 190, px: 150, py: 128 }
export const STEAM = { w: 90, h: 150 }

const INK = C.ink
const faceHalf = (s: GuestSpec, a: number) => {
  const x = Math.cos(a) * s.rx * (1 - 0.14 * Math.pow(Math.max(0, Math.sin(a)), 2))
  const y = Math.sin(a) * s.ry
  return [x, y] as Pt
}

function facePts(s: GuestSpec, n = 22): Pt[] {
  const o: Pt[] = []
  for (let i = 0; i < n; i++) { const [x, y] = faceHalf(s, (i / n) * Math.PI * 2); o.push([HEAD.cx + x, HEAD.cy + y]) }
  return o
}

// ---------- heads ----------
export function paintHeadA(p: Pen, s: GuestSpec) {
  const { cx, cy } = HEAD
  const hairDk = dark(s.hair, 0.3)
  // behind-head hair
  if (s.hairStyle === 'bun') {
    p.shape(oval(cx + 6, cy - s.ry - 14, 34, 32, 14, 0, p.r, 0.1), s.hair, { sw: 1.3 })
    p.line([[cx - 18, cy - s.ry - 14], [cx + 4, cy - s.ry - 22], [cx + 26, cy - s.ry - 12]], hairDk, 0.9)
  }
  if (s.hairStyle === 'curly') {
    for (let i = 0; i < 17; i++) {
      const a = Math.PI * 1.0 + (i / 16) * Math.PI * 1.0 + (i % 2) * 0.03
      const rr = 1.22 + (i % 3) * 0.06
      p.shape(oval(cx + Math.cos(a) * s.rx * rr, cy - 10 + Math.sin(a) * s.ry * 1.05 * rr * 0.98, 30, 30, 10, 0, p.r, 0.12), i % 2 ? s.hair : dark(s.hair, 0.12), { sw: 1 })
    }
    for (let i = 0; i < 4; i++) { const sd = i < 2 ? -1 : 1; p.shape(oval(cx + sd * (s.rx + 20), cy + 20 + (i % 2) * 38, 28, 30, 10, 0, p.r, 0.12), s.hair, { sw: 1 }) }
  }
  if (s.hairStyle === 'long') {
    const L: Pt[] = [[cx - s.rx - 6, cy - 30], [cx - s.rx - 24, cy + 40], [cx - s.rx - 30, cy + 120], [cx - s.rx - 10, cy + 152], [cx - 40, cy + 120], [cx + 40, cy + 120], [cx + s.rx + 10, cy + 152], [cx + s.rx + 30, cy + 120], [cx + s.rx + 24, cy + 40], [cx + s.rx + 6, cy - 30], [cx, cy - s.ry - 14]]
    p.shape(L, s.hair, { sw: 1.3 })
    p.line([[cx - s.rx - 14, cy + 20], [cx - s.rx - 20, cy + 80], [cx - s.rx - 12, cy + 130]], hairDk, 0.9)
    p.line([[cx + s.rx + 14, cy + 20], [cx + s.rx + 20, cy + 80], [cx + s.rx + 12, cy + 130]], hairDk, 0.9)
  }
  if (s.hairStyle === 'bob') {
    const L: Pt[] = [[cx - s.rx - 8, cy - 40], [cx - s.rx - 18, cy + 20], [cx - s.rx - 10, cy + 74], [cx - s.rx + 22, cy + 82], [cx + s.rx - 22, cy + 82], [cx + s.rx + 10, cy + 74], [cx + s.rx + 18, cy + 20], [cx + s.rx + 8, cy - 40], [cx, cy - s.ry - 12]]
    p.shape(L, s.hair, { sw: 1.3 })
  }
  // ears
  for (const sd of [-1, 1]) p.shape(oval(cx + sd * (s.rx - 2), cy + 10, 12, 20, 10, 0, p.r), mix(s.skin, '#a0624a', 0.15), { sw: 1 })
  // face
  p.shape(facePts(s), s.skin, { sw: 1.4 })
  p.wcOval(cx - s.rx * 0.45, cy + 34, 22, 14, '#C8553E', 70, 0.35)
  p.wcOval(cx + s.rx * 0.45, cy + 34, 22, 14, '#C8553E', 70, 0.35)
  p.wcOval(cx + s.rx * 0.42, cy - 10, s.rx * 0.5, s.ry * 0.7, dark(s.skin, 0.22), 40, 0.3) // side shading
  // nose
  p.line([[cx + 1, cy - 2], [cx - 5, cy + 22], [cx + 4, cy + 30]], dark(s.skin, 0.55), 1.0)
  // beard
  if (s.beard === 'full') {
    const bc = s.beardCol ?? s.hair
    const pts: Pt[] = []
    for (let a = 0.05; a < Math.PI - 0.05; a += 0.28) { const [x, y] = faceHalf(s, a); pts.push([cx + x * 1.06, cy + y * 1.04 + 8]) }
    pts.push([cx - s.rx * 0.5, cy + 62]); pts.push([cx, cy + 52]); pts.push([cx + s.rx * 0.5, cy + 62])
    // outer contour (jaw) then inner cut-out around the mouth
    const outer: Pt[] = []
    for (let a = 0.12; a <= Math.PI - 0.12; a += 0.26) { const [x, y] = faceHalf(s, a); outer.push([cx + x * 1.08, cy + y * 1.05 + 10]) }
    outer.reverse()
    const inner: Pt[] = [[cx - s.rx * 0.95, cy + 8], [cx - s.rx * 0.62, cy + 34], [cx - 30, cy + 54], [cx, cy + 50], [cx + 30, cy + 54], [cx + s.rx * 0.62, cy + 34], [cx + s.rx * 0.95, cy + 8]]
    p.shape([...inner, ...outer], bc, { sw: 1.2 })
    p.line([[cx - 38, cy + 96], [cx - 14, cy + 104], [cx + 14, cy + 104]], dark(bc, 0.35), 0.9)
  }
}

export function paintHeadB(p: Pen, s: GuestSpec) {
  const { cx, cy } = HEAD
  const hairDk = dark(s.hair, 0.3)
  const top = cy - s.ry
  if (s.hairStyle === 'bun' || s.hairStyle === 'crop' || s.hairStyle === 'bob') {
    const cap: Pt[] = [[cx - s.rx - 4, cy - 6], [cx - s.rx + 2, cy - 52], [cx - s.rx * 0.6, top + 8], [cx, top - 12], [cx + s.rx * 0.6, top + 8], [cx + s.rx - 2, cy - 52], [cx + s.rx + 4, cy - 6], [cx + s.rx - 10, cy - 38], [cx + s.rx * 0.5, cy - 56], [cx, cy - 66], [cx - s.rx * 0.5, cy - 58], [cx - s.rx + 10, cy - 38]]
    if (s.hairStyle === 'crop') { cap[10] = [cx - s.rx * 0.5, cy - 70]; cap[9] = [cx + 6, cy - 78]; cap[8] = [cx + s.rx * 0.55, cy - 68] }
    if (s.hairStyle === 'bob') { cap[9] = [cx + 8, cy - 58]; cap[10] = [cx - s.rx * 0.5, cy - 48]; cap[8] = [cx + s.rx * 0.5, cy - 44] }
    p.shape(cap, s.hair, { sw: 1.3 })
    p.line([[cx - 6, top - 6], [cx - 18, cy - 62]], hairDk, 0.9)
    p.line([[cx + 22, top - 2], [cx + 30, cy - 62]], hairDk, 0.8)
  }
  if (s.hairStyle === 'long') {
    const cap: Pt[] = [[cx - s.rx - 8, cy + 10], [cx - s.rx - 2, cy - 50], [cx - s.rx * 0.6, top + 6], [cx + 4, top - 12], [cx + s.rx * 0.7, top + 8], [cx + s.rx + 2, cy - 50], [cx + s.rx + 8, cy + 10], [cx + s.rx - 6, cy - 30], [cx + s.rx * 0.2, cy - 66], [cx - s.rx * 0.4, cy - 56], [cx - s.rx + 4, cy - 20]]
    p.shape(cap, s.hair, { sw: 1.3 })
    p.line([[cx + 10, top - 6], [cx - 10, cy - 60], [cx - 40, cy - 30]], hairDk, 0.9)
  }
  if (s.hairStyle === 'wavy') {
    const q: Pt[] = [[cx - s.rx - 6, cy - 4], [cx - s.rx - 10, cy - 50], [cx - s.rx * 0.7, top - 6], [cx - s.rx * 0.2, top - 30], [cx + s.rx * 0.3, top - 34], [cx + s.rx * 0.8, top - 8], [cx + s.rx + 8, cy - 50], [cx + s.rx + 4, cy - 4], [cx + s.rx - 12, cy - 40], [cx + s.rx * 0.4, cy - 62], [cx - s.rx * 0.1, cy - 76], [cx - s.rx * 0.6, cy - 60], [cx - s.rx + 12, cy - 36]]
    p.shape(q, s.hair, { sw: 1.3 })
    for (let i = 0; i < 3; i++) p.line([[cx - 40 + i * 40, top - 20], [cx - 30 + i * 40, top + 14], [cx - 44 + i * 40, cy - 50]], hairDk, 0.8)
  }
  if (s.hairStyle === 'curly') {
    for (let i = 0; i < 7; i++) p.shape(oval(cx - 66 + i * 22, cy - s.ry * 0.62 + Math.abs(i - 3) * 6 - (i % 2) * 10, 26, 24, 10, 0, p.r, 0.12), i % 2 ? s.hair : dark(s.hair, 0.1), { sw: 1 })
  }
  if (s.hairStyle === 'bald') {
    p.wcOval(cx - 14, top + 22, 34, 18, '#fff4e0', 80, 0.3) // shine
    for (const sd of [-1, 1]) p.shape(oval(cx + sd * (s.rx - 4), cy - 12, 16, 30, 8, 0, p.r), s.hair, { sw: 1 })
  }
  // moustache
  if (s.beard === 'mous') {
    const bc = s.beardCol ?? s.hair
    p.shape([[cx - 52, cy + 40], [cx - 30, cy + 28], [cx - 8, cy + 34], [cx, cy + 38], [cx + 8, cy + 34], [cx + 30, cy + 28], [cx + 52, cy + 40], [cx + 36, cy + 50], [cx + 12, cy + 44], [cx, cy + 46], [cx - 12, cy + 44], [cx - 36, cy + 50]], bc, { sw: 1.2 })
  }
  // brows
  const bc = s.hairStyle === 'bald' || s.hairStyle === 'crop' ? dark(s.beardCol ?? s.hair, 0.35) : hairDk
  for (const sd of [-1, 1]) p.line([[cx + sd * 54, cy - 34 + 2], [cx + sd * 36, cy - 40], [cx + sd * 18, cy - 34]], bc, 2.4, 'marker')
  // glasses
  if (s.glasses) {
    const gc = s.glasses === 'round' ? '#2B1E18' : '#7C2236'
    for (const sd of [-1, 1]) {
      const gx = cx + sd * 38, gy = cy - 6
      const lens = s.glasses === 'round' ? oval(gx, gy, 27, 26, 16, 0) : rrect(gx - 28, gy - 22, 56, 44, 10)
      p.wc(lens, '#CFE2DA', 55, 0.1, 0.2)
      p.line([...smoothPts(lens, true, 3), smoothPts(lens, true, 3)[0]], gc, 2.2, '2B', 0)
      p.line([[gx - sd * 12, gy - 14], [gx - sd * 4, gy - 18]], '#ffffff', 1.0, 'pen')
      p.line([[gx + sd * 27, gy - 4], [cx + sd * (s.rx + 4), cy - 10]], gc, 1.6)
    }
    p.line([[cx - 11, cy - 8], [cx, cy - 14], [cx + 11, cy - 8]], gc, 2)
  }
  if (s.earrings) for (const sd of [-1, 1]) p.shape(oval(cx + sd * (s.rx - 2), cy + 38, 6, 9, 8, 0, p.r), s.earrings, { sw: 0.8 })
}

// ---------- shared faces ----------
export function paintEyes(p: Pen, kind: 'open' | 'closed' | 'happy', look: number) {
  const cx = EYES.w / 2, cy = EYES.h / 2
  for (const sd of [-1, 1]) {
    const x = cx + sd * 38
    if (kind === 'open') {
      p.shape(oval(x, cy, 17, 11, 14, 0), C.wax, { sw: 1.1 })
      p.shape(oval(x + look * 7, cy + 1, 7.5, 8, 10, 0), '#2A1D18', { ink: null })
      p.line([[x + look * 7 - 3, cy - 3], [x + look * 7 - 1, cy - 4]], '#ffffff', 1.4, 'pen')
      p.line([[x - 18, cy - 4], [x - 8, cy - 11], [x + 8, cy - 11], [x + 18, cy - 4]], INK, 1.8)
    } else if (kind === 'closed') {
      p.line([[x - 17, cy - 2], [x, cy + 6], [x + 17, cy - 2]], INK, 2.2)
    } else {
      p.line([[x - 16, cy + 5], [x, cy - 7], [x + 16, cy + 5]], INK, 2.4)
    }
  }
}

export function paintMouth(p: Pen, kind: number) {
  const cx = MOUTH.w / 2, cy = MOUTH.h / 2
  const lip = '#A5473D'
  if (kind === 0) { p.line([[cx - 22, cy - 3], [cx - 8, cy + 6], [cx + 8, cy + 6], [cx + 22, cy - 3]], INK, 2.2) }
  else if (kind === 1) { p.line([[cx - 16, cy + 1], [cx, cy + 3], [cx + 16, cy + 1]], INK, 2.2) }
  else if (kind === 2) { p.shape(oval(cx, cy + 2, 9, 11, 12, 0), '#5B1E26', { sw: 1.4 }) }
  else if (kind === 3) {
    p.shape([[cx - 22, cy - 4], [cx, cy - 8], [cx + 22, cy - 4], [cx + 16, cy + 12], [cx, cy + 18], [cx - 16, cy + 12]], '#5B1E26', { sw: 1.5 })
    p.shape([[cx - 14, cy - 5], [cx, cy - 7], [cx + 14, cy - 5], [cx + 12, cy + 1], [cx - 12, cy + 1]], C.wax, { ink: null })
    p.wcOval(cx, cy + 12, 11, 5, lip, 180, 0.1)
  } else {
    p.shape([[cx - 30, cy - 8], [cx, cy - 4], [cx + 30, cy - 8], [cx + 24, cy + 14], [cx, cy + 24], [cx - 24, cy + 14]], '#5B1E26', { sw: 1.6 })
    p.shape([[cx - 26, cy - 7], [cx, cy - 3], [cx + 26, cy - 7], [cx + 24, cy + 3], [cx, cy + 4], [cx - 24, cy + 3]], C.wax, { ink: null })
    p.wcOval(cx, cy + 15, 14, 6, lip, 190, 0.1)
  }
}

// ---------- body ----------
export function paintBody(p: Pen, s: GuestSpec) {
  const nx = BODY.nx, sw = s.sw
  const side = (sd: number) => (s.armSide === sd ? 0.62 : 1)
  const L = sw * side(-1), R = sw * side(1)
  const torso: Pt[] = [
    [nx - L - 2, 160], [nx - L - 4, 84], [nx - L + 8, 46], [nx - sw * 0.55, 28], [nx - 38, 20], [nx + 38, 20], [nx + sw * 0.55, 28], [nx + R - 8, 46], [nx + R + 4, 84], [nx + R + 2, 160],
  ]
  // neck
  p.shape([[nx - 31, 0], [nx + 31, 0], [nx + 36, 36], [nx - 36, 36]], dark(s.skin, 0.12), { sw: 1.2 })
  p.wc([[nx - 31, 0], [nx + 31, 0], [nx + 30, 22], [nx - 30, 22]], dark(s.skin, 0.45), 90, 0.2)
  const col = s.top
  p.shape(torso, col, { sw: 1.6 })
  p.wc(oval(nx + sw * 0.55, 100, sw * 0.4, 70, 10, 0, p.r), dark(col, 0.28), 70, 0.3)
  p.wc(oval(nx - sw * 0.5, 70, sw * 0.35, 30, 10, 0, p.r), light(col, 0.4), 50, 0.3)
  if (s.garment === 'cardigan') {
    p.shape([[nx - 40, 18], [nx + 40, 18], [nx + 18, 62], [nx, 120], [nx - 18, 62]], s.inner, { sw: 1.3 })
    p.line([[nx - 40, 18], [nx - 4, 112]], INK, 1.5); p.line([[nx + 40, 18], [nx + 4, 112]], INK, 1.5)
    p.line([[nx, 116], [nx, 168]], INK, 1.3)
    for (let i = 0; i < 2; i++) p.shape(oval(nx + 6, 132 + i * 24, 5, 5, 8, 0), dark(col, 0.45), { sw: 0.8 })
    for (let i = 0; i < 7; i++) p.line([[nx - sw + 24 + i * 6, 70 + i * 3], [nx - sw + 24 + i * 6, 88 + i * 3]], dark(col, 0.2), 0.8, 'cpencil')
  } else if (s.garment === 'collar') {
    p.shape([[nx - 40, 16], [nx - 6, 44], [nx - 56, 64], [nx - 66, 30]], s.inner, { sw: 1.3 })
    p.shape([[nx + 40, 16], [nx + 6, 44], [nx + 56, 64], [nx + 66, 30]], s.inner, { sw: 1.3 })
    p.line([[nx, 44], [nx, 168]], INK, 1.2)
    for (let i = 0; i < 2; i++) p.shape(oval(nx, 92 + i * 30, 5, 5, 8, 0), C.wax, { sw: 0.8 })
  } else if (s.garment === 'dress') {
    p.shape([[nx - 52, 18], [nx + 52, 18], [nx + 34, 52], [nx, 70], [nx - 34, 52]], s.skin, { sw: 1.2 })
    for (let i = 0; i <= 8; i++) { const a = (i / 8) * Math.PI; p.shape(oval(nx + Math.cos(a) * 36, 56 + Math.sin(a) * 18 - 4, 4.5, 4.5, 8, 0), C.candle, { sw: 0.7 }) }
    p.wc(oval(nx - 60, 60, 38, 26, 10, 0, p.r), C.sage, 70, 0.4)
    p.line([[nx - sw + 30, 110], [nx - sw + 50, 150]], dark(col, 0.18), 1.2)
    p.line([[nx + sw - 36, 108], [nx + sw - 18, 152]], dark(col, 0.18), 1.2)
  }
  if (s.scarf) {
    const sc = s.scarf
    p.shape([[nx - 64, 12], [nx, 24], [nx + 64, 12], [nx + 58, 52], [nx + 10, 66], [nx - 56, 52]], sc, { sw: 1.5 })
    p.shape([[nx + 14, 50], [nx + 50, 54], [nx + 66, 150], [nx + 28, 156]], dark(sc, 0.12), { sw: 1.4 })
    for (let i = 0; i < 5; i++) p.line([[nx + 20 + i * 8, 62 + i * 18], [nx + 52 + i * 3, 66 + i * 18]], light(sc, 0.55), 1.2, 'cpencil')
    for (let i = 0; i < 4; i++) p.line([[nx - 56 + i * 24, 20 + i * 2], [nx - 50 + i * 24, 48]], light(sc, 0.5), 1.0, 'cpencil')
  }
}

// ---------- arms ----------
export function paintUpper(p: Pen, s: GuestSpec) {
  const x = ARM.ux
  p.shape([[x - 24, 6], [x + 24, 6], [x + 22, 98], [x - 22, 98]], s.top, { sw: 1.5 })
  p.wc([[x + 6, 8], [x + 24, 8], [x + 22, 96], [x + 6, 96]], dark(s.top, 0.3), 80, 0.2)
  p.line([[x - 20, 40], [x + 6, 46]], dark(s.top, 0.35), 0.9)
}
export function paintFore(p: Pen, s: GuestSpec) {
  const x = ARM.fx
  p.shape([[x - 22, 4], [x + 22, 4], [x + 18, 88], [x - 18, 88]], s.top, { sw: 1.5 })
  p.shape([[x - 20, 80], [x + 20, 80], [x + 19, 92], [x - 19, 92]], mix(s.top, s.inner, 0.7), { sw: 1.2 }) // cuff
  if (s.hand === 'open') {
    p.shape([[x - 16, 90], [x + 16, 90], [x + 24, 112], [x + 22, 126], [x + 10, 118], [x + 8, 126], [x - 2, 118], [x - 10, 127], [x - 12, 116], [x - 22, 120], [x - 24, 104]], s.skin, { sw: 1.3 })
    p.line([[x + 12, 108], [x + 10, 120]], dark(s.skin, 0.5), 0.8); p.line([[x - 2, 108], [x - 2, 118]], dark(s.skin, 0.5), 0.8)
  } else {
    p.shape(oval(x, 104, 19, 17, 12, 0, p.r), s.skin, { sw: 1.3 })
    p.line([[x - 10, 100], [x + 10, 100]], dark(s.skin, 0.5), 0.8)
  }
}

export function paintGlass(p: Pen, ox: number, oy: number, wine = true) {
  // origin (ox, oy) = where the hand grips the stem
  p.shape([[ox - 3, oy], [ox + 3, oy], [ox + 3, oy + 34], [ox - 3, oy + 34]], '#D7E5DC', { sw: 0.9 })
  p.shape(oval(ox, oy + 36, 18, 4.5, 12, 0), '#D7E5DC', { sw: 0.9 })
  const bowl: Pt[] = [[ox - 17, oy - 44], [ox + 17, oy - 44], [ox + 20, oy - 20], [ox + 12, oy - 4], [ox, oy + 2], [ox - 12, oy - 4], [ox - 20, oy - 20]]
  p.shape(bowl, '#DDE9E2', { sw: 1.1, op: 160 })
  if (wine) p.shape([[ox - 19, oy - 22], [ox + 19, oy - 22], [ox + 12, oy - 4], [ox, oy + 1], [ox - 12, oy - 4]], C.claret, { ink: null, op: 235 })
  p.line([[ox - 11, oy - 38], [ox - 14, oy - 18]], '#ffffff', 1.4, 'pen')
}

// ---------- props ----------
export function paintCandle(p: Pen, hue: string) {
  const cx = CANDLE.px
  p.shape([[cx - 24, 196], [cx + 24, 196], [cx + 16, 176], [cx + 7, 168], [cx - 7, 168], [cx - 16, 176]], hue, { sw: 1.4 }) // holder
  p.shape([[cx - 11, 170], [cx + 11, 170], [cx + 12, 66], [cx - 12, 66]], C.wax, { sw: 1.4 })
  p.wc([[cx + 3, 70], [cx + 12, 70], [cx + 12, 168], [cx + 3, 168]], '#E0C79A', 120, 0.2)
  p.shape([[cx - 12, 66], [cx + 12, 66], [cx + 12, 80], [cx + 8, 96], [cx + 5, 78], [cx - 3, 78], [cx - 6, 104], [cx - 10, 80]], C.wax, { ink: INK, sw: 1.1 })
  p.line([[cx, 66], [cx, 58]], INK, 1.4)
}
export function paintFlame(p: Pen, v: number) {
  const cx = FLAME.px, b = FLAME.py
  const lean = (v - 1) * 4
  p.shape([[cx - 11, b - 4], [cx - 13, b - 28], [cx - 5 + lean, b - 58], [cx + lean * 1.6, b - 84], [cx + 7 + lean, b - 56], [cx + 14, b - 28], [cx + 11, b - 4], [cx, b + 3]], C.candle, { ink: '#C8742A', sw: 0.8 })
  p.shape([[cx - 6, b - 4], [cx - 7, b - 22], [cx + lean * 0.4, b - 44], [cx + 7, b - 22], [cx + 6, b - 4], [cx, b]], '#FFF1C2', { ink: null })
  p.shape(oval(cx, b - 6, 5, 6, 8, 0), '#7FA7D8', { ink: null, op: 150 })
}
export function paintGlowNative(g: any, K: number) {
  g.noStroke()
  const N = 46
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1)
    g.fill(255, 232, 178, 7 + 4 * t * t)
    const r = (GLOW.s / 2) * (1 - t) * 0.98
    g.circle(GLOW.s / 2, GLOW.s / 2, r * 2)
  }
}

export function paintSteam(p: Pen, v: number) {
  const o = v * 14
  p.line([[30 + o, 140], [18 + o, 112], [40 + o, 86], [26 + o, 58], [42 + o, 18]], '#F4EEE2', 3.4, 'marker', 0.7)
  p.line([[58 - o, 140], [70 - o, 108], [50 - o, 78], [64 - o, 40]], '#F4EEE2', 2.6, 'marker', 0.7)
}

export function paintDish(p: Pen, kind: CourseKind, seed: number) {
  const cx = DISH.px, cy = DISH.py
  const plate = (rx = 112, ry = 26) => {
    p.shape(oval(cx + 6, cy + 12, rx + 6, ry + 6, 22, 0), '#0B1A14', { ink: null, op: 90 })
    p.shape(oval(cx, cy, rx, ry, 26, 0), C.wax, { sw: 1.5 })
    p.shape(oval(cx, cy - 1, rx * 0.72, ry * 0.7, 24, 0), '#F4EBD7', { ink: '#CBB892', sw: 0.8 })
  }
  if (kind === 'bowl') {
    p.shape(oval(cx + 8, cy + 14, 98, 24, 22, 0), '#0B1A14', { ink: null, op: 90 })
    p.shape([[cx - 100, cy - 34], [cx + 100, cy - 34], [cx + 84, cy + 8], [cx + 30, cy + 26], [cx - 30, cy + 26], [cx - 84, cy + 8]], C.wax, { sw: 1.6 })
    p.shape(oval(cx, cy - 34, 100, 20, 24, 0), '#B8553A', { sw: 1.3 })
    p.wcOval(cx - 10, cy - 36, 56, 10, '#F4C27A', 150, 0.3)
    p.line([[cx - 30, cy - 36], [cx, cy - 42], [cx + 34, cy - 34]], C.wax, 2.5, 'marker')
    for (let i = 0; i < 5; i++) p.shape(oval(cx - 50 + i * 24, cy - 34 + (i % 2) * 4, 6, 4, 8, 0), '#6E8F52', { ink: null })
    p.wc([[cx + 36, cy - 14], [cx + 86, cy - 20], [cx + 70, cy + 10], [cx + 40, cy + 20]], dark(C.wax, 0.25), 70, 0.3)
    return
  }
  plate()
  if (kind === 'starter') {
    // charred leeks, a pool of red sauce and herbs
    p.shape(oval(cx - 4, cy - 2, 62, 14, 18, 0), '#A33A2B', { ink: null, op: 235 })
    p.wcOval(cx - 20, cy - 4, 40, 7, '#D4573F', 140, 0.3)
    for (let i = 0; i < 4; i++) {
      const x = cx - 60 + i * 34
      p.shape([[x - 12, cy - 12], [x + 54, cy - 28 - i * 2], [x + 62, cy - 20 - i * 2], [x - 4, cy - 2]], i % 2 ? '#3B3A26' : '#52502F', { sw: 1.2 })
      p.line([[x - 4, cy - 8], [x + 52, cy - 24 - i * 2]], '#2A271B', 1.0)
    }
    for (let i = 0; i < 7; i++) p.shape(oval(cx - 56 + i * 18, cy - 20 - (i % 3) * 5, 5, 3.5, 6, 0, p.r), '#7FA568', { ink: null })
  } else if (kind === 'main') {
    // a mound of pasta in a deep red ragu with a basil leaf
    p.shape([[cx - 74, cy - 4], [cx - 62, cy - 34], [cx - 28, cy - 54], [cx + 20, cy - 56], [cx + 62, cy - 34], [cx + 78, cy - 4], [cx + 30, cy + 8], [cx - 30, cy + 8]], '#E7B15E', { sw: 1.5 })
    for (let i = 0; i < 9; i++) p.line([[cx - 56 + i * 12, cy - 18 + (i % 3) * 3], [cx - 40 + i * 12, cy - 44 + (i % 2) * 8], [cx - 22 + i * 12, cy - 22]], '#C98B35', 1.1, 'cpencil')
    p.shape([[cx - 40, cy - 40], [cx - 8, cy - 62], [cx + 36, cy - 56], [cx + 54, cy - 34], [cx + 10, cy - 26], [cx - 28, cy - 24]], '#8A2B26', { sw: 1.3 })
    p.wcOval(cx + 10, cy - 46, 26, 9, '#C9543F', 140, 0.3)
    for (const [dx, dy, a] of [[-6, -64, -0.5], [14, -64, 0.6]] as [number, number, number][]) p.shape(oval(cx + dx, cy + dy + 10, 15, 8, 10, a), '#4E8A4E', { sw: 1 })
    p.shape(oval(cx + 78, cy + 6, 7, 5, 8, 0), C.wax, { ink: INK, sw: 0.8 })
  } else {
    // dessert: a dark custard dish with a burnt-sugar top and two berries
    p.shape([[cx - 62, cy - 24], [cx + 62, cy - 24], [cx + 56, cy + 2], [cx + 26, cy + 14], [cx - 26, cy + 14], [cx - 56, cy + 2]], '#F6B94F', { sw: 1.5, op: 255 })
    p.shape(oval(cx, cy - 26, 62, 15, 22, 0), '#C9762E', { sw: 1.3 })
    p.wcOval(cx - 12, cy - 28, 38, 7, '#F6B94F', 170, 0.3)
    for (let i = 0; i < 6; i++) p.line([[cx - 40 + i * 14, cy - 32], [cx - 28 + i * 14, cy - 22]], '#8A4A1D', 1.0, 'cpencil')
    p.shape(oval(cx - 22, cy - 40, 12, 12, 10, 0), C.claret, { sw: 1.2 })
    p.shape(oval(cx + 6, cy - 42, 11, 11, 10, 0), '#9A2A3E', { sw: 1.2 })
    p.shape([[cx + 6, cy - 54], [cx + 14, cy - 66], [cx + 8, cy - 50]], '#4E8A4E', { sw: 0.9 })
    p.line([[cx - 26, cy - 46], [cx - 22, cy - 42]], '#ffffff', 1.2, 'pen')
  }
  const r = p.r
  r()
  void seed
}

// ---------- room ----------
export function paintWindow(p: Pen, ox: number, oy: number, w: number, h: number, night: boolean) {
  const sky = night ? '#0E1E2A' : '#8FA8A6'
  const arch: Pt[] = [[ox, oy + h], [ox, oy + w / 2], [ox + w * 0.14, oy + w * 0.13], [ox + w / 2, oy], [ox + w * 0.86, oy + w * 0.13], [ox + w, oy + w / 2], [ox + w, oy + h]]
  p.shape(arch, sky, { sw: 2.2 })
  if (!night) {
    p.wc([[ox + 8, oy + h - 8], [ox + w - 8, oy + h - 8], [ox + w - 8, oy + h * 0.6], [ox + 8, oy + h * 0.62]], '#F2B987', 120, 0.4)
    p.wc([[ox + 10, oy + h * 0.45], [ox + w - 10, oy + h * 0.5], [ox + w - 10, oy + h * 0.66], [ox + 10, oy + h * 0.62]], '#E58B6A', 90, 0.45)
    p.wc([[ox + 8, oy + 24], [ox + w - 8, oy + 24], [ox + w - 8, oy + h * 0.38], [ox + 8, oy + h * 0.38]], '#6F8EA2', 100, 0.45)
    p.shape([[ox + 10, oy + h - 8], [ox + 40, oy + h - 70], [ox + 70, oy + h - 40], [ox + 96, oy + h - 86], [ox + 128, oy + h - 52], [ox + 168, oy + h - 94], [ox + w - 8, oy + h - 40], [ox + w - 8, oy + h - 8]], '#1D3A32', { ink: null })
  } else {
    p.wc([[ox + 8, oy + h - 8], [ox + w - 8, oy + h - 8], [ox + w - 8, oy + h * 0.6], [ox + 8, oy + h * 0.62]], '#2A4455', 120, 0.4)
    p.shape([[ox + 10, oy + h - 8], [ox + 40, oy + h - 70], [ox + 70, oy + h - 40], [ox + 96, oy + h - 86], [ox + 128, oy + h - 52], [ox + 168, oy + h - 94], [ox + w - 8, oy + h - 40], [ox + w - 8, oy + h - 8]], '#0A1713', { ink: null })
    for (let i = 0; i < 16; i++) { const x = ox + 20 + p.r() * (w - 40), y = oy + 30 + p.r() * (h * 0.5); p.shape(oval(x, y, 2.4, 2.4, 6, 0), '#FFF8EA', { ink: null }) }
    p.shape(oval(ox + w * 0.72, oy + 64, 17, 17, 14, 0), '#FFF1C2', { ink: null })
  }
  // frame + mullions
  p.line([[ox + w / 2, oy + 4], [ox + w / 2, oy + h]], '#6B4A33', 4.5)
  p.line([[ox, oy + h * 0.52], [ox + w, oy + h * 0.52]], '#6B4A33', 4)
  p.line([...smoothPts(arch, false, 4)], '#6B4A33', 5)
  p.line([[ox - 8, oy + h + 6], [ox + w + 8, oy + h + 6]], '#8A6446', 7)
}

export function paintRoom(p: Pen, w: number, h: number, tier: 'full' | 'light') {
  const r = p.r
  const full = tier === 'full'
  // wall
  p.shape([[-20, -20], [w + 20, -20], [w + 20, TABLE.far + 10], [-20, TABLE.far + 10]], '#1E4636', { ink: null, sm: false })
  for (let i = 0; i < (full ? 26 : 12); i++) p.wcOval(r() * w, 20 + r() * 330, 90 + r() * 140, 40 + r() * 70, i % 3 ? '#2A5C48' : '#14302A', 70, 0.3)
  p.wc([[-20, -20], [w + 20, -20], [w + 20, 70], [-20, 70]], '#0C1F18', 120, 0.3)
  // wainscot
  p.shape([[-20, 388], [w + 20, 388], [w + 20, TABLE.far + 10], [-20, TABLE.far + 10]], '#3D1A22', { ink: null, sm: false })
  p.line([[-20, 388], [w + 20, 388]], '#C9A66B', 3.2)
  p.line([[-20, 396], [w + 20, 396]], '#0C1F18', 2)
  for (let x = 30; x < w; x += 205) p.wc([[x, 410], [x + 160, 410], [x + 160, 536], [x, 536]], '#4D2230', 90, 0.35)
  for (let x = 30; x < w; x += 205) p.line([[x, 410], [x + 160, 410], [x + 160, 536], [x, 536], [x, 410]], '#240F15', 1.3, '2B', 0)
  // dusk window
  paintWindow(p, 676, 66, 250, 330, false)
  p.line([[650, 66], [650, 360]], '#7C2236', 22)
  p.line([[952, 66], [952, 360]], '#7C2236', 22)
  p.line([[660, 100], [655, 330]], '#A33A4D', 5, 'cpencil'); p.line([[944, 100], [950, 330]], '#A33A4D', 5, 'cpencil')
  // framed pictures
  if (full) {
    p.shape(rrect(70, 90, 150, 190, 4), '#8A6446', { sw: 1.6 })
    p.shape(rrect(82, 102, 126, 166, 2), '#F1EEE6', { sw: 1 })
    p.wcOval(145, 190, 36, 50, '#A9C3AE', 150, 0.4); p.wcOval(150, 160, 20, 26, '#F6B94F', 160, 0.4); p.wc([[96, 250], [196, 232], [196, 258], [96, 258]], '#7C2236', 130, 0.4)
    p.shape(rrect(1370, 120, 170, 130, 4), '#8A6446', { sw: 1.6 })
    p.shape(rrect(1382, 132, 146, 106, 2), '#E9DFC8', { sw: 1 })
    p.wc([[1392, 220], [1440, 172], [1470, 204], [1500, 160], [1520, 220]], '#2F5A4B', 150, 0.4); p.wcOval(1488, 156, 12, 12, '#F6B94F', 170, 0.3)
  }
  // paper lamps
  for (const lx of full ? [400, 1200] : [790, 1250]) {
    p.line([[lx, -10], [lx, 150]], INK, 1.4)
    p.shape(oval(lx, 196, 46, 50, 22, 0, r, 0.04), '#F6E7C7', { sw: 1.5 })
    p.wc(oval(lx + 14, 206, 28, 36, 12, 0, r), '#E2A24A', 90, 0.4)
    for (let i = -1; i <= 1; i++) p.line([[lx + i * 20, 150], [lx + i * 24, 196], [lx + i * 14, 244]], '#B58C4E', 0.8, 'cpencil')
  }
}

export function paintChair(p: Pen, x: number, col: string) {
  const top = 300
  p.shape([[x - 98, TABLE.far], [x - 100, top + 20], [x - 90, top], [x + 90, top], [x + 100, top + 20], [x + 98, TABLE.far]], col, { sw: 1.6 })
  p.wc([[x - 82, top + 20], [x + 82, top + 20], [x + 82, top + 110], [x - 82, top + 110]], light(col, 0.18), 100, 0.3)
  for (let i = -3; i <= 3; i++) p.line([[x + i * 26, top + 22], [x + i * 26 + (i > 0 ? 2 : -2), top + 120]], dark(col, 0.35), 1.1, 'cpencil')
  p.line([[x - 90, top + 8], [x + 90, top + 8]], light(col, 0.3), 2.2, 'marker')
}

export function paintTable(p: Pen, guests: number[], tier: 'full' | 'light', x0: number, x1: number) {
  const r = p.r
  const { far, near, drop } = TABLE
  // cloth top
  const strip = (ya: number, yb: number, col: string) => { for (let xx = x0 - 20; xx < x1 + 20; xx += 160) p.shape([[xx, ya], [xx + 162, ya], [xx + 162, yb], [xx, yb]], col, { ink: null, sm: false }) }
  strip(far, near, C.cloth)
  for (let xx = x0 - 20; xx < x1 + 20; xx += 160) {
    p.shape([[xx, far + 6], [xx + 162, far + 6], [xx + 162, far + 22], [xx, far + 22]], '#0E2A20', { ink: null, sm: false, op: 170 })
    p.shape([[xx, near - 36], [xx + 162, near - 36], [xx + 162, near], [xx, near]], '#2A5442', { ink: null, sm: false, op: 110 })
  }
  // linen runner
  for (let xx = x0 - 20; xx < x1 + 20; xx += 160) {
    p.shape([[xx, far + 22], [xx + 162, far + 22], [xx + 162, far + 84], [xx, far + 84]], C.linen, { ink: null, sm: false })
    p.shape([[xx, far + 62], [xx + 162, far + 62], [xx + 162, far + 84], [xx, far + 84]], '#DCD5C3', { ink: null, sm: false, op: 200 })
  }
  p.line([[x0 - 20, far + 26], [x1 + 20, far + 26]], C.claret, 3)
  p.line([[x0 - 20, far + 78], [x1 + 20, far + 78]], C.claret, 3)
  p.line([[x0 - 20, far], [x1 + 20, far]], '#0A1913', 2.4)
  // front drop
  strip(near, drop, '#13302A')
  for (let i = 0; i < (tier === 'full' ? 22 : 12); i++) {
    const x = x0 + (i / (tier === 'full' ? 21 : 11)) * (x1 - x0)
    p.wc([[x - 26, near + 6], [x + 26, near + 6], [x + 22, drop], [x - 22, drop]], i % 2 ? '#1D4536' : '#0C201A', 110, 0.35)
    p.line([[x - 24 + r() * 6, near + 8], [x - 20 + r() * 10, drop - 6]], '#091812', 1.4, 'charcoal')
  }
  for (let xx = x0 - 20; xx < x1 + 20; xx += 160) p.shape([[xx, near], [xx + 162, near], [xx + 162, near + 12], [xx, near + 12]], C.linen, { ink: null, sm: false })
  p.line([[x0 - 20, near + 12], [x1 + 20, near + 12]], INK, 1.2)
  p.line([[x0 - 20, near + 6], [x1 + 20, near + 6]], C.claret, 1.6)
  // floor
  strip(drop, 960, '#2B1A14')
  for (let i = 0; i < 6; i++) p.line([[x0 - 20, drop + 14 + i * 16], [x1 + 20, drop + 12 + i * 16 + (i % 2) * 3]], '#150C09', 1.4, 'charcoal')
  // chunked: p5.brush's bleeding fill mis-renders one ~1600x30 polygon as a huge pale tent
  for (let xx = x0 - 20; xx < x1 + 20; xx += 160) p.wc([[xx, drop - 4], [xx + 162, drop - 4], [xx + 162, drop + 26], [xx, drop + 26]], '#0A0605', 150, 0.3)
  // place settings
  for (const gi of guests) {
    const x = GUEST_X[gi]
    const y = far + 64
    p.wcOval(x + 4, y + 10, 70, 14, '#06120D', 120, 0.3)
    p.shape(oval(x, y, 62, 14, 22, 0), C.wax, { sw: 1.3 })
    p.shape(oval(x, y, 38, 8, 18, 0), '#F1E6CF', { ink: '#C8B58C', sw: 0.8 })
    p.shape([[x - 118, y - 16], [x - 76, y - 12], [x - 72, y + 14], [x - 118, y + 18]], C.linen, { sw: 1.1 }) // napkin
    p.line([[x - 112, y - 6], [x - 82, y - 4]], '#CFC8B6', 0.9, 'cpencil')
    p.line([[x + 80, y - 14], [x + 82, y + 18]], '#C9CDCB', 2.2); p.line([[x + 92, y - 14], [x + 94, y + 18]], '#C9CDCB', 2.2)
    if (gi !== 5) paintGlass(p, x + 118, y - 6)
  }
}
void LW
void SHOULDER_Y
