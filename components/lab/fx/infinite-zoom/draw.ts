// Canvas 2D drawing for the infinite zoom. Five nested levels, each drawn in a 1000x1000 design square
// centred on (0,0). The next level sits in the centre portal, scaled by 1/K.
export const K = 3.6
export const Q = 1000 / K
export const N = 5

export type Poster = { img: HTMLImageElement | null; title: string }
export type DishInfo = { id: string; name: string; ingredients: string[] }
export type Env = { wide: boolean; B: number; t: number; posters: Poster[]; dish: DishInfo; brick: CanvasPattern | null; cloth: CanvasPattern | null }
type Ctx = CanvasRenderingContext2D

const TAU = Math.PI * 2
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

function rng(seed: number) {
  let s = seed | 0
  return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
function hash(str: string) { let h = 2166136261; for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619); return h >>> 0 }
function rgba(hex: string, a: number) { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})` }
function glow(c: Ctx, x: number, y: number, r: number, col: string, a: number) {
  const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2)
}
function rr(c: Ctx, x: number, y: number, w: number, h: number, r: number) { c.beginPath(); c.roundRect(x, y, w, h, r) }
function leaf(c: Ctx, x: number, y: number, len: number, ang: number, col: string) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, len, len * 0.38, ang, 0, TAU); c.fill() }

export function makePatterns(): { brick: CanvasPattern | null; cloth: CanvasPattern | null } {
  const mk = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, scale: number) => {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h
    const g = cv.getContext('2d'); if (!g) return null
    draw(g)
    const p = g.createPattern(cv, 'repeat'); if (p) p.setTransform(new DOMMatrix().scale(scale))
    return p
  }
  const r = rng(11)
  const brick = mk(256, 128, (g) => {
    g.fillStyle = '#8f4636'; g.fillRect(0, 0, 256, 128)
    for (let row = 0; row < 4; row++) for (let col = -1; col < 4; col++) {
      const x = col * 64 + (row % 2 ? 32 : 0); g.fillStyle = `rgba(${r() < 0.5 ? '255,200,160' : '40,10,10'},${0.04 + r() * 0.1})`; g.fillRect(x + 2, row * 32 + 2, 60, 28)
    }
    g.strokeStyle = 'rgba(236,208,190,.55)'; g.lineWidth = 3
    for (let row = 0; row <= 4; row++) { g.beginPath(); g.moveTo(0, row * 32); g.lineTo(256, row * 32); g.stroke() }
    for (let row = 0; row < 4; row++) for (let col = 0; col < 5; col++) { const x = col * 64 + (row % 2 ? 32 : 0); g.beginPath(); g.moveTo(x, row * 32); g.lineTo(x, row * 32 + 32); g.stroke() }
  }, 0.25)
  const cloth = mk(64, 64, (g) => {
    g.fillStyle = '#17352A'; g.fillRect(0, 0, 64, 64); g.strokeStyle = 'rgba(241,238,230,.06)'; g.lineWidth = 1
    for (let i = 0; i < 64; i += 4) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(64, i); g.stroke() }
  }, 0.5)
  return { brick, cloth }
}

/* ---------------------------------------------------------------- level 0: street */
function streetBg(c: Ctx, e: Env) {
  const sky = c.createLinearGradient(0, -800, 0, 380)
  sky.addColorStop(0, '#27495a'); sky.addColorStop(0.55, '#6c7088'); sky.addColorStop(1, '#f0a566')
  c.fillStyle = sky; c.fillRect(-4000, -4000, 8000, 8400)
  const r = rng(7); c.fillStyle = 'rgba(255,248,234,.8)'
  for (let i = 0; i < 40; i++) { const x = (r() - 0.5) * 1200, y = -330 - r() * 450; c.beginPath(); c.arc(x, y, 1 + r() * 1.6, 0, TAU); c.fill() }
  glow(c, 180, -440, 120, '#FFF8EA', 0.35); c.fillStyle = '#FFF8EA'; c.beginPath(); c.arc(180, -440, 34, 0, TAU); c.fill()
  c.fillStyle = '#27495a'; c.beginPath(); c.arc(194, -450, 30, 0, TAU); c.fill()
  // neighbours
  const house = (x0: number, x1: number, top: number, col: string, winX: number) => {
    c.fillStyle = col; c.fillRect(x0, top, x1 - x0, 600 - top)
    if (e.brick) { c.globalAlpha = 0.5; c.fillStyle = e.brick; c.fillRect(x0, top, x1 - x0, 600 - top); c.globalAlpha = 1 }
    c.fillStyle = 'rgba(20,10,20,.18)'; c.fillRect(x0, top, x1 - x0, 14)
    for (const wy of [top + 70, top + 270]) { c.fillStyle = '#d9d1c0'; c.fillRect(winX - 62, wy - 6, 124, 12 + 150); c.fillStyle = wy > 100 ? '#e9a25a' : '#1b2f45'; c.fillRect(winX - 52, wy + 4, 104, 150) }
  }
  const hw = e.wide ? 235 : 300
  house(-1000, -hw - 2, -150, '#7b4f55', -hw - 170); house(hw + 2, 1000, -70, '#a0643f', hw + 170)
  // centre house
  c.fillStyle = '#8f4636'; c.fillRect(-hw, -240, hw * 2, 900)
  if (e.brick) { c.globalAlpha = 0.55; c.fillStyle = e.brick; c.fillRect(-hw, -240, hw * 2, 900); c.globalAlpha = 1 }
  const sh = c.createLinearGradient(0, -240, 0, 380); sh.addColorStop(0, 'rgba(255,190,120,.0)'); sh.addColorStop(1, 'rgba(30,10,20,.35)'); c.fillStyle = sh; c.fillRect(-hw, -240, hw * 2, 900)
  c.fillStyle = '#d9d1c0'; c.fillRect(-hw - 10, -254, hw * 2 + 20, 16); c.fillRect(-hw, -205, hw * 2, 9)
  for (const cx of [-215, 175]) { c.fillStyle = '#7a3a2c'; c.fillRect(cx, -330, 50, 90); c.fillStyle = '#d9d1c0'; c.fillRect(cx - 5, -336, 60, 10); c.fillStyle = '#b4623a'; c.fillRect(cx + 8, -362, 14, 28); c.fillRect(cx + 28, -358, 14, 24) }
  // door
  c.fillStyle = '#d9d1c0'; rr(c, -78, 196, 156, 200, 8); c.fill()
  c.fillStyle = '#1F5C5A'; rr(c, -64, 222, 128, 174, 4); c.fill()
  c.fillStyle = '#0d2e2d'; for (const [dx, dy] of [[-52, 232], [8, 232], [-52, 310], [8, 310]]) c.fillRect(dx, dy, 44, 66)
  c.fillStyle = '#F6B94F'; c.globalAlpha = 0.9; rr(c, -58, 204, 116, 14, 7); c.fill(); c.globalAlpha = 1
  c.fillStyle = '#D8A84E'; c.beginPath(); c.arc(40, 330, 5, 0, TAU); c.fill()
  // steps + pavement
  c.fillStyle = '#b9b1a1'; c.fillRect(-100, 396, 200, 14); c.fillRect(-120, 410, 240, 14)
  const pv = c.createLinearGradient(0, 424, 0, 700); pv.addColorStop(0, '#4b4a58'); pv.addColorStop(1, '#2a2b38'); c.fillStyle = pv; c.fillRect(-4000, 424, 8000, 1200)
  glow(c, 0, 440, 240, '#F6B94F', 0.28)
  c.fillStyle = 'rgba(255,255,255,.08)'; for (let x = -1000; x < 1000; x += 120) c.fillRect(x, 424, 3, 400)
}
function streetFrame(c: Ctx, _e: Env, _S: number, a: number) {
  c.save(); c.globalAlpha = a
  const h = Q / 2
  c.fillStyle = '#d9d1c0'; c.fillRect(-h - 36, -h - 46, Q + 72, 26)
  c.fillStyle = '#F1EEE6'; c.beginPath(); c.rect(-h - 18, -h - 18, Q + 36, Q + 36); c.rect(-h, -h, Q, Q); c.fill('evenodd')
  c.strokeStyle = '#F1EEE6'; c.lineWidth = 5
  for (const k of [-Q / 6, Q / 6]) { c.beginPath(); c.moveTo(k, -h); c.lineTo(k, h); c.moveTo(-h, k); c.lineTo(h, k); c.stroke() }
  c.fillStyle = 'rgba(255,255,255,.07)'; c.beginPath(); c.moveTo(-h, h * 0.2); c.lineTo(-h * 0.1, h); c.lineTo(h * 0.35, h); c.lineTo(-h, -h * 0.3); c.fill()
  c.fillStyle = '#cfc7b8'; c.fillRect(-h - 40, h + 18, Q + 80, 16); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-h - 40, h + 34, Q + 80, 8)
  c.fillStyle = '#5a3a2a'; c.fillRect(-h - 22, h + 4, Q + 44, 18)
  const r = rng(3)
  for (let i = 0; i < 14; i++) { c.fillStyle = ['#F6B94F', '#7C2236', '#FFF8EA', '#A9C3AE'][i % 4]; c.beginPath(); c.arc(-h - 14 + i * ((Q + 28) / 13), h - 6 - r() * 10, 6 + r() * 4, 0, TAU); c.fill() }
  c.restore()
}
function streetFg(c: Ctx, e: Env) {
  const lx = e.wide ? -430 : -205
  c.fillStyle = '#1b2a2a'; c.fillRect(lx - 5, -240, 10, 900); c.fillRect(lx - 14, 420, 28, 40)
  glow(c, lx, -270, 220, '#FF9F43', 0.5)
  c.fillStyle = '#1b2a2a'; c.fillRect(lx - 26, -300, 52, 10); c.beginPath(); c.moveTo(lx - 24, -290); c.lineTo(lx + 24, -290); c.lineTo(lx + 16, -250); c.lineTo(lx - 16, -250); c.fill()
  c.fillStyle = '#FFF3D6'; c.fillRect(lx - 14, -288, 28, 36)
}

/* ---------------------------------------------------------------- level 1: lit room behind the glass */
function roomBg(c: Ctx, e: Env) {
  const w = c.createLinearGradient(0, -600, 0, 380); w.addColorStop(0, '#6f9783'); w.addColorStop(1, '#a9c3ae')
  c.fillStyle = w; c.fillRect(-4000, -4000, 8000, 4400)
  c.fillStyle = 'rgba(255,255,255,.07)'; for (let x = -1200; x < 1200; x += 60) c.fillRect(x, -1000, 26, 1400)
  c.fillStyle = '#2a5a47'; c.fillRect(-4000, 150, 8000, 240); c.fillStyle = '#d9d1c0'; c.fillRect(-4000, 144, 8000, 10)
  c.fillStyle = 'rgba(0,0,0,.12)'; for (let x = -1200; x < 1200; x += 130) c.fillRect(x, 170, 90, 190)
  const fl = c.createLinearGradient(0, 380, 0, 700); fl.addColorStop(0, '#6b4a35'); fl.addColorStop(1, '#2e1f18'); c.fillStyle = fl; c.fillRect(-4000, 380, 8000, 1000)
  c.fillStyle = 'rgba(124,34,54,.55)'; c.fillRect(-340, 400, 680, 300)
  const frames: Array<[number, number, number, number]> = e.wide ? [[-380, -90, 110, 150], [390, -70, 100, 130], [-190, -300, 60, 80]] : [[-150, -330, 70, 95], [140, -300, 60, 80]]
  for (const [fx, fy, fw, fh] of frames) {
    c.fillStyle = '#D8A84E'; rr(c, fx - fw / 2 - 6, fy - fh / 2 - 6, fw + 12, fh + 12, 3); c.fill()
    const g = c.createLinearGradient(fx, fy - fh / 2, fx, fy + fh / 2); g.addColorStop(0, '#e9c58a'); g.addColorStop(1, '#a15a3a'); c.fillStyle = g; c.fillRect(fx - fw / 2, fy - fh / 2, fw, fh)
    c.fillStyle = 'rgba(23,53,42,.7)'; c.beginPath(); c.moveTo(fx - fw / 2, fy + fh / 2); c.lineTo(fx - fw * 0.1, fy); c.lineTo(fx + fw * 0.2, fy + fh * 0.2); c.lineTo(fx + fw / 2, fy - fh * 0.1); c.lineTo(fx + fw / 2, fy + fh / 2); c.fill()
  }
  for (const sx of [-1, 1]) { // chairs
    const cx = sx * 215; c.fillStyle = '#7C2236'; rr(c, cx - 38, -60, 76, 170, 24); c.fill(); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, cx - 28, -48, 56, 140, 18); c.fill()
    c.fillStyle = '#3a2418'; c.fillRect(cx - 34, 110, 10, 270); c.fillRect(cx + 24, 110, 10, 270)
  }
  // table
  c.fillStyle = '#0f241c'; c.beginPath(); c.moveTo(-161, 160); c.lineTo(161, 160); c.lineTo(235, 390); c.lineTo(-235, 390); c.fill()
  const sk = c.createLinearGradient(-235, 0, 235, 0); sk.addColorStop(0, 'rgba(0,0,0,.35)'); sk.addColorStop(0.5, 'rgba(255,255,255,.05)'); sk.addColorStop(1, 'rgba(0,0,0,.35)'); c.fillStyle = sk
  c.beginPath(); c.moveTo(-161, 160); c.lineTo(161, 160); c.lineTo(235, 390); c.lineTo(-235, 390); c.fill()
  c.strokeStyle = 'rgba(241,238,230,.12)'; c.lineWidth = 2
  for (let i = -5; i <= 5; i++) { c.beginPath(); c.moveTo(i * 28, 165); c.lineTo(i * 41, 388); c.stroke() }
  c.fillStyle = '#D8A84E'; c.beginPath(); c.moveTo(-232, 380); c.lineTo(232, 380); c.lineTo(235, 390); c.lineTo(-235, 390); c.fill()
  c.fillStyle = '#17352A'; rr(c, -Q / 2 - 24, -Q / 2 - 24, Q + 48, Q + 48, 10); c.fill()
  // pendant lamp
  c.strokeStyle = '#2a1a14'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -1200); c.lineTo(0, -345); c.stroke()
  glow(c, 0, -230, 420, '#F6B94F', 0.5)
  c.fillStyle = '#D8A84E'; c.beginPath(); c.moveTo(-62, -290); c.lineTo(62, -290); c.lineTo(30, -348); c.lineTo(-30, -348); c.fill()
  c.fillStyle = '#FFF3D6'; c.fillRect(-48, -294, 96, 6)
}
function roomFrame(c: Ctx, _e: Env, _S: number, a: number) {
  c.save(); c.globalAlpha = a; const h = Q / 2 + 24
  c.fillStyle = '#17352A'; c.beginPath(); c.roundRect(-h, -h, h * 2, h * 2, 10); c.roundRect(-Q / 2, -Q / 2, Q, Q, 3); c.fill('evenodd')
  c.strokeStyle = '#F1EEE6'; c.lineWidth = 3; c.strokeRect(-Q / 2 - 5, -Q / 2 - 5, Q + 10, Q + 10)
  c.restore()
}
function roomFg(c: Ctx, e: Env) {
  const edge = e.wide ? 340 : 190
  for (const s of [-1, 1]) {
    c.save(); c.scale(s, 1)
    const g = c.createLinearGradient(edge, 0, edge + 400, 0); g.addColorStop(0, '#9a2d46'); g.addColorStop(0.35, '#7C2236'); g.addColorStop(1, '#4d1424')
    c.fillStyle = g; c.beginPath(); c.moveTo(edge, -700); c.bezierCurveTo(edge + 40, -200, edge - 30, 250, edge + 24, 700); c.lineTo(edge + 900, 700); c.lineTo(edge + 900, -700); c.fill()
    for (let i = 0; i < 12; i++) { const x = edge + 18 + i * 30; c.strokeStyle = i % 2 ? 'rgba(255,200,210,.12)' : 'rgba(0,0,0,.2)'; c.lineWidth = 6; c.beginPath(); c.moveTo(x, -700); c.lineTo(x + (i % 3) * 3, 700); c.stroke() }
    c.fillStyle = '#D8A84E'; c.beginPath(); c.moveTo(edge - 8, 140); c.quadraticCurveTo(edge + 60, 120, edge + 120, 150); c.lineTo(edge + 120, 170); c.quadraticCurveTo(edge + 60, 145, edge - 8, 165); c.fill()
    c.restore()
  }
  c.fillStyle = '#6b1a2b'; c.fillRect(-1400, -900, 2800, 410)
  c.fillStyle = '#D8A84E'; c.fillRect(-1400, -494, 2800, 7)
  c.fillStyle = '#6b1a2b'; for (let x = -1400; x < 1400; x += 70) { c.beginPath(); c.arc(x + 35, -490, 35, 0, Math.PI); c.fill() }
}

/* ---------------------------------------------------------------- level 2: table top */
function tableBg(c: Ctx, e: Env) {
  c.fillStyle = '#17352A'; c.fillRect(-4000, -4000, 8000, 8000)
  if (e.cloth) { c.fillStyle = e.cloth; c.fillRect(-1500, -1500, 3000, 3000) }
  const vg = c.createRadialGradient(0, 0, 200, 0, 0, 900); vg.addColorStop(0, 'rgba(246,185,79,.12)'); vg.addColorStop(1, 'rgba(8,20,15,.5)'); c.fillStyle = vg; c.fillRect(-1500, -1500, 3000, 3000)
  for (const sx of [-1, 1]) { c.fillStyle = '#F1EEE6'; c.beginPath(); c.arc(sx * 650, 0, 170, 0, TAU); c.fill(); c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 6; c.beginPath(); c.arc(sx * 650, 0, 130, 0, TAU); c.stroke() }
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -208, -190, 424, 400, 14); c.fill()
  c.fillStyle = '#F1EEE6'; rr(c, -215, -200, 430, 400, 12); c.fill()
  c.strokeStyle = 'rgba(124,34,54,.5)'; c.lineWidth = 3; rr(c, -203, -188, 406, 376, 8); c.stroke()
  // napkin
  c.save(); c.translate(0, 232); c.fillStyle = '#7C2236'; rr(c, -105, -26, 210, 52, 5); c.fill(); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(-105, -2, 210, 3); c.fillStyle = '#A9C3AE'; leaf(c, 20, -4, 26, -0.5, '#A9C3AE'); leaf(c, 40, 0, 22, 0.3, '#8fae96'); c.restore()
  // charger + plate rim
  c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.arc(4, 8, 178, 0, TAU); c.fill()
  const ch = c.createRadialGradient(-40, -40, 80, 0, 0, 178); ch.addColorStop(0, '#e6c06b'); ch.addColorStop(1, '#a9803a'); c.fillStyle = ch; c.beginPath(); c.arc(0, 0, 175, 0, TAU); c.fill()
  c.fillStyle = '#F7F4EC'; c.beginPath(); c.arc(0, 0, 156, 0, TAU); c.fill()
  c.strokeStyle = 'rgba(0,0,0,.1)'; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 146, 0, TAU); c.stroke()
  // cutlery
  c.fillStyle = '#c9ced1'; rr(c, -222, -120, 14, 210, 5); c.fill(); for (let i = 0; i < 3; i++) c.fillRect(-224 + i * 7, -150, 4, 44); c.fillRect(-224, -110, 18, 8)
  c.fillStyle = '#dfe3e5'; rr(c, 200, -110, 18, 220, 7); c.fill(); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(214, -110, 4, 220)
  // bread plate + glass
  c.fillStyle = '#F1EEE6'; c.beginPath(); c.arc(-150, -255, 54, 0, TAU); c.fill(); c.fillStyle = '#d4a05a'; c.beginPath(); c.ellipse(-150, -255, 32, 20, 0.4, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.ellipse(-158, -262, 14, 6, 0.4, 0, TAU); c.fill()
  const wg = c.createRadialGradient(150, -235, 2, 150, -235, 42); wg.addColorStop(0, '#9a2d46'); wg.addColorStop(1, '#5a1426'); c.fillStyle = wg; c.beginPath(); c.arc(150, -235, 40, 0, TAU); c.fill()
  c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 3; c.beginPath(); c.arc(150, -235, 40, 0, TAU); c.stroke(); c.beginPath(); c.arc(138, -246, 20, 3.4, 4.6); c.stroke()
  // candles
  const t = e.t; const cands: Array<[number, number]> = e.wide ? [[-330, -110], [330, 120]] : [[-165, 330], [170, -340]]
  cands.forEach(([x, y], i) => {
    const f = 0.8 + 0.12 * Math.sin(t * 8 + i * 2) + 0.08 * Math.sin(t * 19 + i)
    glow(c, x, y, 230, '#F6B94F', 0.42 * f); c.fillStyle = '#D8A84E'; c.beginPath(); c.arc(x, y, 24, 0, TAU); c.fill(); c.fillStyle = '#FFF8EA'; c.beginPath(); c.arc(x, y, 14, 0, TAU); c.fill(); c.fillStyle = '#F6B94F'; c.beginPath(); c.arc(x, y - 1, 6 * f, 0, TAU); c.fill()
  })
}
function tableFrame(c: Ctx, _e: Env, _S: number, a: number) {
  c.save(); c.globalAlpha = a; c.strokeStyle = '#E6E0D0'; c.lineWidth = 8; c.beginPath(); c.arc(0, 0, Q / 2 + 4, 0, TAU); c.stroke()
  c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, Q / 2 - 2, 0, TAU); c.stroke(); c.restore()
}
function tableFg(c: Ctx, e: Env) {
  const r = rng(21); const t = e.t
  for (let i = 0; i < 9; i++) {
    const ang = r() * TAU, rad = 430 + r() * 280, size = 40 + r() * 70
    const x = Math.cos(ang) * rad + Math.sin(t * 0.3 + i) * 12, y = Math.sin(ang) * rad + Math.cos(t * 0.27 + i) * 12
    glow(c, x, y, size, i % 3 ? '#F6B94F' : '#FFF8EA', 0.18 + 0.1 * r())
  }
}

/* ---------------------------------------------------------------- level 3: the plate and the dish */
const SAUCE = ['#7C2236', '#F6B94F', '#A9C3AE', '#c9562f', '#e8dcc0']
const BASE = ['#F1E1B8', '#d9a05b', '#b8c97c']
const PROT = ['#c98a55', '#e9b88c', '#8a4b34']
const VEG = ['#5f8a4a', '#d65a3a', '#e8b546']
function plateBg(c: Ctx, e: Env) {
  const g = c.createRadialGradient(0, 0, 60, 0, 0, 520); g.addColorStop(0, '#FBF8EF'); g.addColorStop(1, '#E4DECE')
  c.fillStyle = g; c.fillRect(-4000, -4000, 8000, 8000)
  c.strokeStyle = 'rgba(0,0,0,.06)'; c.lineWidth = 5; c.beginPath(); c.arc(0, 0, 440, 0, TAU); c.stroke()
  const h = hash(e.dish.id), r = rng(h)
  const sauce = SAUCE[h % SAUCE.length], base = BASE[(h >> 3) % BASE.length], prot = PROT[(h >> 5) % PROT.length], veg = VEG[(h >> 7) % VEG.length]
  const a0 = r() * TAU
  c.lineCap = 'round'
  c.strokeStyle = 'rgba(0,0,0,.1)'; c.lineWidth = 38; c.beginPath(); c.arc(3, 5, 205, a0, a0 + 2.5); c.stroke()
  c.strokeStyle = sauce; c.lineWidth = 36; c.beginPath(); c.arc(0, 0, 205, a0, a0 + 2.5); c.stroke()
  c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 7; c.beginPath(); c.arc(0, 0, 212, a0 + 0.1, a0 + 2.2); c.stroke()
  const a1 = a0 + 3.5; const bx = Math.cos(a1) * 215, by = Math.sin(a1) * 215
  c.fillStyle = 'rgba(0,0,0,.14)'; c.beginPath(); c.ellipse(bx + 4, by + 8, 62, 52, 0, 0, TAU); c.fill()
  const bg = c.createRadialGradient(bx - 14, by - 16, 6, bx, by, 62); bg.addColorStop(0, '#ffffff'); bg.addColorStop(0.15, base); bg.addColorStop(1, rgba('#6b4a20', 0.5)); c.fillStyle = bg; c.beginPath(); c.ellipse(bx, by, 60, 52, 0, 0, TAU); c.fill()
  for (let i = 0; i < 22; i++) { const aa = r() * TAU, rd = r() * 46; c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(bx + Math.cos(aa) * rd, by + Math.sin(aa) * rd * 0.8, 5, 2.4, aa, 0, TAU); c.fill() }
  const a2 = a0 + 4.8
  for (let i = -1; i <= 1; i++) {
    const aa = a2 + i * 0.3, px = Math.cos(aa) * (215 + Math.abs(i) * 6), py = Math.sin(aa) * (215 + Math.abs(i) * 6)
    c.save(); c.translate(px, py); c.rotate(aa + 1.57); c.fillStyle = 'rgba(0,0,0,.15)'; rr(c, -34, -16, 72, 38, 18); c.fill()
    c.fillStyle = prot; rr(c, -36, -20, 72, 38, 18); c.fill(); c.strokeStyle = 'rgba(60,25,10,.45)'; c.lineWidth = 3
    for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(k * 12 - 4, -14); c.lineTo(k * 12 + 4, 12); c.stroke() }
    c.fillStyle = 'rgba(255,255,255,.2)'; rr(c, -26, -16, 40, 8, 4); c.fill(); c.restore()
  }
  const n = Math.min(8, Math.max(4, e.dish.ingredients.length + 2))
  for (let i = 0; i < n; i++) { const aa = r() * TAU, rd = 175 + r() * 80, rad = 10 + r() * 11; const x = Math.cos(aa) * rd, y = Math.sin(aa) * rd; c.fillStyle = 'rgba(0,0,0,.14)'; c.beginPath(); c.arc(x + 2, y + 4, rad, 0, TAU); c.fill(); c.fillStyle = veg; c.beginPath(); c.arc(x, y, rad, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(x - rad * 0.3, y - rad * 0.3, rad * 0.3, 0, TAU); c.fill() }
  for (let i = 0; i < 18; i++) { const aa = r() * TAU, rd = 165 + r() * 150; leaf(c, Math.cos(aa) * rd, Math.sin(aa) * rd, 12 + r() * 8, r() * TAU, i % 3 ? '#4f7a3f' : '#7fa655') }
  for (let i = 0; i < 12; i++) { const aa = a0 + r() * 3, rd = 262 + r() * 22; c.fillStyle = sauce; c.beginPath(); c.arc(Math.cos(aa) * rd, Math.sin(aa) * rd, 3 + r() * 5, 0, TAU); c.fill() }
  c.lineCap = 'butt'
  // slide shadow + body
  c.fillStyle = 'rgba(0,0,0,.14)'; for (let i = 0; i < 3; i++) c.fillRect(-Q / 2 - 22 + i * 3, -Q / 2 - 12 + i * 6, Q + 44, Q + 44)
  c.fillStyle = '#17110f'; c.fillRect(-Q / 2 - 20, -Q / 2 - 20, Q + 40, Q + 40)
}
function plateFrame(c: Ctx, _e: Env, _S: number, a: number) {
  c.save(); c.globalAlpha = a; const h = Q / 2, o = h + 20
  c.fillStyle = '#17110f'; c.beginPath(); c.rect(-o, -o, o * 2, o * 2); c.rect(-h, -h, h * 2, h * 2); c.fill('evenodd')
  c.fillStyle = '#e9dfc9'; for (let x = -o + 14; x < o - 14; x += 26) { rr(c, x, -o + 4, 12, 11, 3); c.fill(); rr(c, x, h + 5, 12, 11, 3); c.fill() }
  c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 1.5; c.strokeRect(-h, -h, Q, Q)
  c.restore()
}

/* ---------------------------------------------------------------- level 4: home cinema */
function drawPoster(c: Ctx, p: Poster | undefined, cx: number, cy: number, w: number, h: number, t: number) {
  glow(c, cx, cy - h / 2 - 20, w * 1.2, '#FF9F43', 0.2)
  c.fillStyle = 'rgba(0,0,0,.4)'; rr(c, cx - w / 2 - 4, cy - h / 2 + 4, w + 18, h + 18, 5); c.fill()
  c.fillStyle = '#D8A84E'; rr(c, cx - w / 2 - 9, cy - h / 2 - 9, w + 18, h + 18, 5); c.fill()
  if (p?.img && p.img.complete && p.img.naturalWidth) c.drawImage(p.img, cx - w / 2, cy - h / 2, w, h)
  else { const g = c.createLinearGradient(cx, cy - h / 2, cx, cy + h / 2); g.addColorStop(0, '#FF9F43'); g.addColorStop(1, '#6B1A2B'); c.fillStyle = g; c.fillRect(cx - w / 2, cy - h / 2, w, h); c.fillStyle = '#FFF3D6'; c.font = `800 ${w * 0.13}px sans-serif`; c.textAlign = 'center'; c.fillText((p?.title ?? '').slice(0, 14), cx, cy); c.textAlign = 'start' }
  c.fillStyle = 'rgba(255,243,214,.08)'; c.beginPath(); c.moveTo(cx - w / 2, cy - h / 2); c.lineTo(cx - w * 0.1 + Math.sin(t) * 6, cy - h / 2); c.lineTo(cx - w / 2, cy + h * 0.1); c.fill()
}
function cinemaBg(c: Ctx, e: Env) {
  const g = c.createRadialGradient(0, 0, 80, 0, 0, 800); g.addColorStop(0, '#5a1a2c'); g.addColorStop(1, '#2B0B14'); c.fillStyle = g; c.fillRect(-4000, -4000, 8000, 8000)
  const edge = e.wide ? 300 : 178
  for (const s of [-1, 1]) {
    c.save(); c.scale(s, 1)
    const cg = c.createLinearGradient(edge, 0, edge + 500, 0); cg.addColorStop(0, '#8a2540'); cg.addColorStop(0.4, '#6B1A2B'); cg.addColorStop(1, '#3d0f1c'); c.fillStyle = cg
    c.beginPath(); c.moveTo(edge + 40, -700); c.bezierCurveTo(edge - 20, -250, edge + 50, 250, edge - 10, 700); c.lineTo(edge + 1200, 700); c.lineTo(edge + 1200, -700); c.fill()
    for (let i = 0; i < 16; i++) { const x = edge + 30 + i * 34; c.strokeStyle = i % 2 ? 'rgba(255,170,150,.1)' : 'rgba(0,0,0,.28)'; c.lineWidth = 8; c.beginPath(); c.moveTo(x, -700); c.lineTo(x - 4 + (i % 3) * 4, 700); c.stroke() }
    c.restore()
  }
  glow(c, 0, 0, 430, '#FFF3D6', 0.28 + 0.03 * Math.sin(e.t * 5))
  if (e.wide) { drawPoster(c, e.posters[0], -400, 0, 190, 285, e.t); drawPoster(c, e.posters[1], 400, 0, 190, 285, e.t) }
  else drawPoster(c, e.posters[0], 0, -330, 190, 285, e.t)
  c.fillStyle = '#fff3d6'; c.fillRect(-Q / 2 - 14, -Q / 2 - 14, Q + 28, Q + 28)
}
function cinemaFrame(c: Ctx, _e: Env, _S: number, a: number) {
  c.save(); c.globalAlpha = a; const h = Q / 2, o = h + 15
  const g = c.createLinearGradient(-o, -o, o, o); g.addColorStop(0, '#f0cf83'); g.addColorStop(0.5, '#D8A84E'); g.addColorStop(1, '#8e6a28')
  c.fillStyle = g; c.beginPath(); c.rect(-o, -o, o * 2, o * 2); c.rect(-h, -h, h * 2, h * 2); c.fill('evenodd')
  c.strokeStyle = 'rgba(30,10,10,.6)'; c.lineWidth = 2; c.strokeRect(-h, -h, Q, Q); c.restore()
}
function cinemaFg(c: Ctx, e: Env) {
  const r = rng(5)
  c.fillStyle = 'rgba(255,243,214,.55)'
  for (let i = 0; i < 34; i++) { const x = (r() - 0.5) * 900, y = (r() - 0.5) * 900 + Math.sin(e.t * 0.5 + i) * 10; c.beginPath(); c.arc(x, y, 1.5 + r() * 2.5, 0, TAU); c.fill() }
  for (let i = -6; i <= 6; i++) { const x = i * 150; c.fillStyle = '#1F5C5A'; rr(c, x - 62, 470, 124, 140, 30); c.fill(); c.fillStyle = 'rgba(255,255,255,.07)'; rr(c, x - 50, 478, 100, 20, 10); c.fill() }
}

type Level = { bg: (c: Ctx, e: Env, S: number) => void; frame: (c: Ctx, e: Env, S: number, a: number) => void; fg: (c: Ctx, e: Env, S: number) => void; round: boolean }
const LEVELS: Level[] = [
  { bg: streetBg, frame: streetFrame, fg: streetFg, round: false },
  { bg: roomBg, frame: roomFrame, fg: roomFg, round: false },
  { bg: tableBg, frame: tableFrame, fg: tableFg, round: true },
  { bg: plateBg, frame: plateFrame, fg: () => {}, round: false },
  { bg: cinemaBg, frame: cinemaFrame, fg: cinemaFg, round: false },
]

function renderLevel(c: Ctx, e: Env, idx: number, S: number, depth: number) {
  const L = LEVELS[((idx % N) + N) % N]
  c.save()
  L.bg(c, e, S)
  const u = Math.log(S) / Math.log(K), ex = smooth(0.72, 1, u)
  if (depth < 4 && S * e.B * Q > 6) {
    c.save()
    const half = (Q / 2) * (1 + 0.45 * ex)
    c.beginPath()
    if (L.round) c.arc(0, 0, half, 0, TAU); else c.roundRect(-half, -half, half * 2, half * 2, 4 * (1 - ex))
    c.clip()
    c.scale(1 / K, 1 / K)
    renderLevel(c, e, idx + 1, S / K, depth + 1)
    c.restore()
  }
  L.frame(c, e, S, 1 - ex)
  const g = Math.pow(S, 0.3)
  c.save(); c.scale(g, g); L.fg(c, e, S); c.restore()
  c.restore()
}

/** Render the nested stack at zoom position z (levels; fractional part = progress through one level). */
export function renderZoom(c: Ctx, e: Env, w: number, h: number, dpr: number, z: number) {
  const idx = Math.floor(z), f = z - idx
  c.setTransform(dpr, 0, 0, dpr, 0, 0)
  c.save(); c.translate(w / 2, h / 2)
  const S0 = Math.pow(K, f); c.scale(e.B * S0, e.B * S0)
  renderLevel(c, e, idx, S0, 0)
  c.restore()
}

export type Streaks = { a: number; r0: number; len: number; w: number; warm: boolean }[]
export function makeStreaks(): Streaks { const r = rng(99); return Array.from({ length: 90 }, () => ({ a: r() * TAU, r0: 0.16 + r() * 0.3, len: 0.18 + r() * 0.4, w: 1 + r() * 2.5, warm: r() < 0.5 })) }
export function drawStreaks(c: Ctx, s: Streaks, w: number, h: number, dpr: number, amt: number) {
  if (amt < 0.02) return
  c.setTransform(dpr, 0, 0, dpr, 0, 0); c.save(); c.translate(w / 2, h / 2)
  const R = Math.hypot(w, h) / 2
  const vg = c.createRadialGradient(0, 0, R * 0.35, 0, 0, R); vg.addColorStop(0, 'rgba(255,243,214,0)'); vg.addColorStop(1, `rgba(255,243,214,${amt * 0.22})`); c.fillStyle = vg; c.fillRect(-w, -h, w * 2, h * 2)
  c.lineCap = 'round'
  for (const k of s) { c.strokeStyle = k.warm ? `rgba(255,214,150,${amt * 0.55})` : `rgba(255,248,234,${amt * 0.45})`; c.lineWidth = k.w; const a = Math.cos(k.a), b = Math.sin(k.a), r0 = R * k.r0, r1 = r0 + R * k.len * (0.4 + amt); c.beginPath(); c.moveTo(a * r0, b * r0); c.lineTo(a * r1, b * r1); c.stroke() }
  c.restore()
}
export const smoothstep = smooth
