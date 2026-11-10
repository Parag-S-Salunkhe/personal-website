// Canvas 2D drawing for "Further in". Five nested levels (street, room, table, plate, film), each in a 1000x1000
// design square centred on (0,0); the next level sits in the centre portal scaled by 1/K. Level 5 is the street again,
// at night (the seam). Real site content is drawn into each level.
export const K = 3.6
export const Q = 1000 / K
export const N = 5

export const P = { brick: '#B5533C', teal: '#1F4E4A', lamp: '#F3C969', plum: '#6E2340', mint: '#9CC3B0', plate: '#F4EBDD', ink: '#2A1E1A' }

export type Poster = { img: HTMLImageElement | null; title: string; rating: number; date: string }
export type DishInfo = { id: string; name: string; category: string; rating: number; ingredients: string[] }
export type Env = { wide: boolean; B: number; t: number; z: number; posters: Poster[]; dishes: DishInfo[]; notes: string[]; posts: string[]; brick: CanvasPattern | null; cloth: CanvasPattern | null; fd: string; fs: string }
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

/** Word-wrap into at most maxLines lines of width maxW at the current font; the last line gets an ellipsis. */
function wrap(c: Ctx, text: string, maxW: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean); const lines: string[] = []; let cur = ''
  for (let i = 0; i < words.length; i++) {
    const t = cur ? cur + ' ' + words[i] : words[i]
    if (c.measureText(t).width <= maxW || !cur) { cur = t; continue }
    lines.push(cur); cur = words[i]
    if (lines.length === maxLines - 1) { cur = words.slice(i).join(' '); break }
  }
  if (cur) lines.push(cur)
  const last = lines.length - 1
  if (last >= 0 && c.measureText(lines[last]).width > maxW) { let s = lines[last]; while (s.length > 1 && c.measureText(s + '…').width > maxW) s = s.slice(0, -1); lines[last] = s.trimEnd() + '…' }
  return lines
}
function text(c: Ctx, lines: string[], x: number, y: number, lh: number, align: CanvasTextAlign = 'left') {
  c.textAlign = align; c.textBaseline = 'alphabetic'; lines.forEach((l, i) => c.fillText(l, x, y + i * lh)); c.textAlign = 'left'
}

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
    g.fillStyle = '#a24a35'; g.fillRect(0, 0, 256, 128)
    for (let row = 0; row < 4; row++) for (let col = -1; col < 4; col++) {
      const x = col * 64 + (row % 2 ? 32 : 0); g.fillStyle = `rgba(${r() < 0.5 ? '255,200,160' : '60,15,10'},${0.04 + r() * 0.1})`; g.fillRect(x + 2, row * 32 + 2, 60, 28)
    }
    g.strokeStyle = 'rgba(244,235,221,.5)'; g.lineWidth = 3
    for (let row = 0; row <= 4; row++) { g.beginPath(); g.moveTo(0, row * 32); g.lineTo(256, row * 32); g.stroke() }
    for (let row = 0; row < 4; row++) for (let col = 0; col < 5; col++) { const x = col * 64 + (row % 2 ? 32 : 0); g.beginPath(); g.moveTo(x, row * 32); g.lineTo(x, row * 32 + 32); g.stroke() }
  }, 0.25)
  // brick-red tablecloth with a woven check
  const cloth = mk(96, 96, (g) => {
    g.fillStyle = P.brick; g.fillRect(0, 0, 96, 96)
    g.fillStyle = 'rgba(244,235,221,.16)'; for (let i = 0; i < 96; i += 48) { g.fillRect(i, 0, 16, 96); g.fillRect(0, i, 96, 16) }
    g.fillStyle = 'rgba(244,235,221,.1)'; g.fillRect(0, 0, 96, 3)
  }, 0.5)
  return { brick, cloth }
}

/* ---------------------------------------------------------------- level 0 (and 5): the street */
function streetBg(c: Ctx, e: Env, _S: number, idx: number) {
  const night = Math.floor(idx / N) % 2 === 1
  const sky = c.createLinearGradient(0, -800, 0, 380)
  if (night) { sky.addColorStop(0, '#08171c'); sky.addColorStop(0.6, '#0f2f33'); sky.addColorStop(1, '#1F4E4A') }
  else { sky.addColorStop(0, '#1b4443'); sky.addColorStop(0.55, '#7a6d78'); sky.addColorStop(1, '#eb9a5c') }
  c.fillStyle = sky; c.fillRect(-4000, -4000, 8000, 8400)
  const r = rng(7); c.fillStyle = 'rgba(244,235,221,.85)'
  for (let i = 0; i < (night ? 90 : 40); i++) { const x = (r() - 0.5) * 1200, y = -330 - r() * 450; c.beginPath(); c.arc(x, y, 1 + r() * 1.6, 0, TAU); c.fill() }
  glow(c, 180, -440, night ? 170 : 120, '#F4EBDD', night ? 0.5 : 0.3); c.fillStyle = '#F4EBDD'; c.beginPath(); c.arc(180, -440, 34, 0, TAU); c.fill()
  c.fillStyle = night ? '#0f2f33' : '#2c5654'; c.beginPath(); c.arc(194, -450, 30, 0, TAU); c.fill()
  const hw = e.wide ? 235 : 300
  const win = (wx: number, wy: number, w: number, h: number, lit: boolean) => {
    c.fillStyle = '#e4d9c3'; c.fillRect(wx - w / 2 - 8, wy - 8, w + 16, h + 16)
    c.fillStyle = lit ? P.lamp : '#1a3b44'; c.fillRect(wx - w / 2, wy, w, h)
    if (lit) { glow(c, wx, wy + h / 2, w * 1.6, P.lamp, night ? 0.42 : 0.28); c.fillStyle = 'rgba(42,30,26,.5)'; c.fillRect(wx - 2, wy, 4, h); c.fillRect(wx - w / 2, wy + h * 0.45, w, 4) }
  }
  const house = (x0: number, x1: number, top: number, col: string, winX: number) => {
    c.fillStyle = col; c.fillRect(x0, top, x1 - x0, 600 - top)
    if (e.brick) { c.globalAlpha = 0.5; c.fillStyle = e.brick; c.fillRect(x0, top, x1 - x0, 600 - top); c.globalAlpha = 1 }
    c.fillStyle = 'rgba(20,10,20,.2)'; c.fillRect(x0, top, x1 - x0, 14)
    win(winX, top + 70, 104, 150, night); win(winX, top + 290, 104, 150, true)
    if (night) { c.fillStyle = 'rgba(8,20,25,.35)'; c.fillRect(x0, top, x1 - x0, 600 - top) }
  }
  house(-1000, -hw - 2, -150, '#8a3f36', -hw - 170); house(hw + 2, 1000, -70, '#a85a38', hw + 170)
  c.fillStyle = P.brick; c.fillRect(-hw, -240, hw * 2, 900)
  if (e.brick) { c.globalAlpha = 0.55; c.fillStyle = e.brick; c.fillRect(-hw, -240, hw * 2, 900); c.globalAlpha = 1 }
  const sh = c.createLinearGradient(0, -240, 0, 380); sh.addColorStop(0, 'rgba(255,190,120,0)'); sh.addColorStop(1, 'rgba(30,10,20,.35)'); c.fillStyle = sh; c.fillRect(-hw, -240, hw * 2, 900)
  if (night) { c.fillStyle = 'rgba(8,20,25,.22)'; c.fillRect(-hw, -240, hw * 2, 900) }
  c.fillStyle = '#e4d9c3'; c.fillRect(-hw - 10, -254, hw * 2 + 20, 16); c.fillRect(-hw, -205, hw * 2, 9)
  for (const cx of [-215, 175]) { c.fillStyle = '#7a3a2c'; c.fillRect(cx, -330, 50, 90); c.fillStyle = '#e4d9c3'; c.fillRect(cx - 5, -336, 60, 10); c.fillStyle = '#a54f36'; c.fillRect(cx + 8, -362, 14, 28); c.fillRect(cx + 28, -358, 14, 24) }
  // small side windows beside the big one
  for (const sx of [-1, 1]) win(sx * 205, -130, 40, 64, night)
  // door
  c.fillStyle = '#e4d9c3'; rr(c, -78, 196, 156, 200, 8); c.fill()
  if (night) {
    const dg = c.createLinearGradient(0, 222, 0, 396); dg.addColorStop(0, '#FBE3A0'); dg.addColorStop(1, P.lamp); c.fillStyle = dg; rr(c, -64, 222, 128, 174, 4); c.fill()
    glow(c, 0, 410, 300, P.lamp, 0.55)
    c.fillStyle = P.teal; c.beginPath(); c.moveTo(-64, 222); c.lineTo(-18, 236); c.lineTo(-18, 384); c.lineTo(-64, 396); c.fill()
    c.fillStyle = 'rgba(42,30,26,.5)'; c.fillRect(-14, 380, 78, 16)
  } else {
    c.fillStyle = P.teal; rr(c, -64, 222, 128, 174, 4); c.fill()
    c.fillStyle = '#0f2f2d'; for (const [dx, dy] of [[-52, 232], [8, 232], [-52, 310], [8, 310]]) c.fillRect(dx, dy, 44, 66)
    c.fillStyle = P.lamp; c.beginPath(); c.arc(40, 330, 5, 0, TAU); c.fill()
  }
  c.fillStyle = P.lamp; c.globalAlpha = 0.9; rr(c, -58, 204, 116, 14, 7); c.fill(); c.globalAlpha = 1
  c.fillStyle = '#2A1E1A'; c.font = `700 11px ${e.fs}`; c.textAlign = 'center'; c.fillText('14', 0, 214); c.textAlign = 'left'
  c.fillStyle = '#c9bfa8'; c.fillRect(-100, 396, 200, 14); c.fillRect(-120, 410, 240, 14)
  const pv = c.createLinearGradient(0, 424, 0, 700); pv.addColorStop(0, night ? '#2a3a40' : '#4b4a58'); pv.addColorStop(1, '#1d2127'); c.fillStyle = pv; c.fillRect(-4000, 424, 8000, 1200)
  glow(c, 0, 440, 240, P.lamp, night ? 0.5 : 0.26)
  c.fillStyle = 'rgba(255,255,255,.08)'; for (let x = -1000; x < 1000; x += 120) c.fillRect(x, 424, 3, 400)
}
function streetFrame(c: Ctx, e: Env, _S: number, a: number) {
  c.save(); c.globalAlpha = a
  const h = Q / 2
  c.fillStyle = '#e4d9c3'; c.fillRect(-h - 36, -h - 46, Q + 72, 26)
  c.fillStyle = P.plate; c.beginPath(); c.rect(-h - 18, -h - 18, Q + 36, Q + 36); c.rect(-h, -h, Q, Q); c.fill('evenodd')
  c.strokeStyle = P.plate; c.lineWidth = 5
  for (const k of [-Q / 6, Q / 6]) { c.beginPath(); c.moveTo(k, -h); c.lineTo(k, h); c.moveTo(-h, k); c.lineTo(h, k); c.stroke() }
  c.fillStyle = 'rgba(255,255,255,.07)'; c.beginPath(); c.moveTo(-h, h * 0.2); c.lineTo(-h * 0.1, h); c.lineTo(h * 0.35, h); c.lineTo(-h, -h * 0.3); c.fill()
  c.fillStyle = '#d3c9b4'; c.fillRect(-h - 40, h + 18, Q + 80, 16); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-h - 40, h + 34, Q + 80, 8)
  c.fillStyle = '#5a3a2a'; c.fillRect(-h - 22, h + 4, Q + 44, 18)
  const r = rng(3)
  for (let i = 0; i < 14; i++) { c.fillStyle = [P.lamp, P.plum, P.plate, P.mint][i % 4]; c.beginPath(); c.arc(-h - 14 + i * ((Q + 28) / 13), h - 6 - r() * 10, 6 + r() * 4, 0, TAU); c.fill() }
  void e
  c.restore()
}
function streetFg(c: Ctx, e: Env, _S: number, idx: number) {
  const night = Math.floor(idx / N) % 2 === 1
  const lx = e.wide ? -430 : -205
  c.fillStyle = '#16262a'; c.fillRect(lx - 5, -240, 10, 900); c.fillRect(lx - 14, 420, 28, 40)
  const fl = 0.85 + 0.1 * Math.sin(e.t * 9) * (night ? 0.3 : 1) + 0.05 * Math.sin(e.t * 23)
  glow(c, lx, -270, 220, '#F3C969', (night ? 0.6 : 0.5) * fl)
  c.fillStyle = '#16262a'; c.fillRect(lx - 26, -300, 52, 10); c.beginPath(); c.moveTo(lx - 24, -290); c.lineTo(lx + 24, -290); c.lineTo(lx + 16, -250); c.lineTo(lx - 16, -250); c.fill()
  c.fillStyle = '#FFF3D6'; c.fillRect(lx - 14, -288, 28, 36)
}

/* ---------------------------------------------------------------- level 1: the room (notes and letters) */
const SCRAP = ['#F4EBDD', '#F8DDA0', '#CFE3D8', '#EFC9B8']
function scrap(c: Ctx, e: Env, x: number, y: number, w: number, h: number, rot: number, str: string, i: number) {
  c.save(); c.translate(x, y); c.rotate(rot)
  c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-w / 2 + 4, -h / 2 + 6, w, h)
  c.fillStyle = SCRAP[i % SCRAP.length]; c.fillRect(-w / 2, -h / 2, w, h)
  c.fillStyle = 'rgba(42,30,26,.12)'; for (let k = 1; k < 4; k++) c.fillRect(-w / 2 + 12, -h / 2 + 10 + k * (h - 20) / 4, w - 24, 1.5)
  c.fillStyle = P.ink; c.font = `700 ${Math.round(h * 0.2)}px ${e.fs}`
  const lines = wrap(c, str, w - 30, 3); text(c, lines, -w / 2 + 15, -h / 2 + h * 0.3, h * 0.24)
  c.fillStyle = P.brick; c.beginPath(); c.arc(0, -h / 2 + 7, 6, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.arc(-1.5, -h / 2 + 5.5, 2, 0, TAU); c.fill()
  c.restore()
}
function envelope(c: Ctx, e: Env, x: number, y: number, w: number, h: number, rot: number, str: string, i: number) {
  c.save(); c.translate(x, y); c.rotate(rot)
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-w / 2 + 3, -h / 2 + 5, w, h)
  c.fillStyle = i % 2 ? '#F4EBDD' : '#F8DDA0'; c.fillRect(-w / 2, -h / 2, w, h)
  c.strokeStyle = 'rgba(42,30,26,.3)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-w / 2, -h / 2); c.lineTo(0, 4); c.lineTo(w / 2, -h / 2); c.stroke()
  c.fillStyle = P.plum; c.beginPath(); c.arc(0, 2, 6, 0, TAU); c.fill()
  c.fillStyle = P.ink; c.font = `700 ${Math.round(h * 0.2)}px ${e.fs}`; text(c, wrap(c, str, w - 20, 2), -w / 2 + 10, h * 0.2 + 12, h * 0.23)
  c.restore()
}
function roomBg(c: Ctx, e: Env) {
  const w = c.createLinearGradient(0, -600, 0, 380); w.addColorStop(0, '#86ad99'); w.addColorStop(1, P.mint)
  c.fillStyle = w; c.fillRect(-4000, -4000, 8000, 4400)
  c.fillStyle = 'rgba(255,255,255,.08)'; for (let x = -1200; x < 1200; x += 60) c.fillRect(x, -1000, 26, 1400)
  c.fillStyle = P.teal; c.fillRect(-4000, 150, 8000, 240); c.fillStyle = '#e4d9c3'; c.fillRect(-4000, 144, 8000, 10)
  c.fillStyle = 'rgba(0,0,0,.12)'; for (let x = -1200; x < 1200; x += 130) c.fillRect(x, 170, 90, 190)
  const fl = c.createLinearGradient(0, 380, 0, 700); fl.addColorStop(0, '#7a4a35'); fl.addColorStop(1, '#2e1c16'); c.fillStyle = fl; c.fillRect(-4000, 380, 8000, 1000)
  c.fillStyle = 'rgba(110,35,64,.6)'; c.fillRect(-340, 400, 680, 300)
  // chairs
  for (const sx of [-1, 1]) {
    const cx = sx * (e.wide ? 190 : 200); c.fillStyle = P.plum; rr(c, cx - 34, -10, 68, 130, 22); c.fill(); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, cx - 25, 0, 50, 104, 16); c.fill()
    c.fillStyle = '#3a2418'; c.fillRect(cx - 30, 120, 9, 260); c.fillRect(cx + 21, 120, 9, 260)
  }
  // notes pinned on the wall
  const notes = e.notes.slice(0, e.wide ? 6 : 4)
  notes.forEach((n, i) => {
    const rot = ((i * 37) % 11 - 5) * 0.012
    if (e.wide) { const side = i % 2 ? 1 : -1, row = Math.floor(i / 2); scrap(c, e, side * 320, -255 + row * 118, 210, 100, rot, n, i) }
    else { const col = i % 2 ? 1 : -1, row = Math.floor(i / 2); scrap(c, e, col * 100, -410 + row * 140, 176, 112, rot, n, i) }
  })
  // sideboard with letters (wide); on a phone the letters lie on the table edge instead
  const posts = e.posts.slice(0, e.wide ? 4 : 2)
  if (e.wide) {
    for (const sx of [-1, 1]) { c.fillStyle = '#5a3322'; c.fillRect(sx > 0 ? 268 : -552, 168, 284, 200); c.fillStyle = '#7a4a35'; c.fillRect(sx > 0 ? 262 : -558, 160, 296, 14) }
    posts.forEach((p, i) => { const side = i % 2 ? 1 : -1, k = Math.floor(i / 2); envelope(c, e, side * 365 + (k ? side * -22 : side * 14), 112 - k * 4, 150, 100, ((i * 53) % 9 - 4) * 0.02, p, i) })
  }
  // table
  c.fillStyle = '#5a1f2c'; c.beginPath(); c.moveTo(-161, 160); c.lineTo(161, 160); c.lineTo(235, 390); c.lineTo(-235, 390); c.fill()
  c.strokeStyle = 'rgba(244,235,221,.14)'; c.lineWidth = 2
  for (let i = -5; i <= 5; i++) { c.beginPath(); c.moveTo(i * 28, 165); c.lineTo(i * 41, 388); c.stroke() }
  c.fillStyle = P.lamp; c.beginPath(); c.moveTo(-232, 380); c.lineTo(232, 380); c.lineTo(235, 390); c.lineTo(-235, 390); c.fill()
  c.fillStyle = P.brick; rr(c, -Q / 2 - 24, -Q / 2 - 24, Q + 48, Q + 48, 10); c.fill()
  if (!e.wide) e.posts.slice(0, 2).forEach((p, i) => envelope(c, e, (i ? 1 : -1) * 100, 262, 176, 96, (i ? 1 : -1) * 0.05, p, i))
  // pendant lamp
  c.strokeStyle = '#2a1a14'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -1200); c.lineTo(0, -345); c.stroke()
  glow(c, 0, -230, 420, P.lamp, 0.5)
  c.fillStyle = P.lamp; c.beginPath(); c.moveTo(-62, -290); c.lineTo(62, -290); c.lineTo(30, -348); c.lineTo(-30, -348); c.fill(); c.fillStyle = '#FFF3D6'; c.fillRect(-48, -294, 96, 6)
}
function roomFrame(c: Ctx, _e: Env, _S: number, a: number) {
  c.save(); c.globalAlpha = a; const h = Q / 2 + 24
  c.fillStyle = P.brick; c.beginPath(); c.roundRect(-h, -h, h * 2, h * 2, 10); c.roundRect(-Q / 2, -Q / 2, Q, Q, 3); c.fill('evenodd')
  c.strokeStyle = P.plate; c.lineWidth = 3; c.strokeRect(-Q / 2 - 5, -Q / 2 - 5, Q + 10, Q + 10)
  c.restore()
}
function roomFg(c: Ctx, e: Env) {
  const edge = e.wide ? 450 : 215
  for (const s of [-1, 1]) {
    c.save(); c.scale(s, 1)
    const g = c.createLinearGradient(edge, 0, edge + 400, 0); g.addColorStop(0, '#8f3358'); g.addColorStop(0.35, P.plum); g.addColorStop(1, '#431329')
    c.fillStyle = g; c.beginPath(); c.moveTo(edge, -700); c.bezierCurveTo(edge + 40, -200, edge - 30, 250, edge + 24, 700); c.lineTo(edge + 900, 700); c.lineTo(edge + 900, -700); c.fill()
    for (let i = 0; i < 12; i++) { const x = edge + 18 + i * 30; c.strokeStyle = i % 2 ? 'rgba(255,200,210,.12)' : 'rgba(0,0,0,.2)'; c.lineWidth = 6; c.beginPath(); c.moveTo(x, -700); c.lineTo(x + (i % 3) * 3, 700); c.stroke() }
    c.restore()
  }
  c.fillStyle = '#58182f'; c.fillRect(-1400, -900, 2800, 410)
  c.fillStyle = P.lamp; c.fillRect(-1400, -494, 2800, 7)
  c.fillStyle = '#58182f'; for (let x = -1400; x < 1400; x += 70) { c.beginPath(); c.arc(x + 35, -490, 35, 0, Math.PI); c.fill() }
}

/* ---------------------------------------------------------------- dishes drawn as plates */
const SAUCE = [P.plum, P.lamp, P.mint, '#c9562f', '#e8dcc0']
const BASE = ['#F1E1B8', '#d9a05b', '#b8c97c']
const PROT = ['#c98a55', '#e9b88c', '#8a4b34']
const VEG = ['#5f8a4a', '#d65a3a', '#e8b546']
/** The food, drawn in a ~300 radius space, scaled by sc. */
function dishArt(c: Ctx, d: DishInfo, sc: number) {
  c.save(); c.scale(sc, sc)
  const h = hash(d.id), r = rng(h)
  const sauce = SAUCE[h % SAUCE.length], base = BASE[(h >>> 3) % BASE.length], prot = PROT[(h >>> 5) % PROT.length], veg = VEG[(h >>> 7) % VEG.length]
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
  const n = Math.min(8, Math.max(4, d.ingredients.length + 2))
  for (let i = 0; i < n; i++) { const aa = r() * TAU, rd = 150 + r() * 100, rad = 10 + r() * 11; const x = Math.cos(aa) * rd, y = Math.sin(aa) * rd; c.fillStyle = 'rgba(0,0,0,.14)'; c.beginPath(); c.arc(x + 2, y + 4, rad, 0, TAU); c.fill(); c.fillStyle = veg; c.beginPath(); c.arc(x, y, rad, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(x - rad * 0.3, y - rad * 0.3, rad * 0.3, 0, TAU); c.fill() }
  for (let i = 0; i < 18; i++) { const aa = r() * TAU, rd = 150 + r() * 110; leaf(c, Math.cos(aa) * rd, Math.sin(aa) * rd, 12 + r() * 8, r() * TAU, i % 3 ? '#4f7a3f' : '#7fa655') }
  c.lineCap = 'butt'
  c.restore()
}
function nameCard(c: Ctx, e: Env, x: number, y: number, w: number, d: DishInfo, size: number) {
  c.save(); c.translate(x, y)
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-w / 2 + 3, 4, w, size * 2.5)
  c.fillStyle = P.plate; c.fillRect(-w / 2, 0, w, size * 2.5)
  c.fillStyle = P.brick; c.fillRect(-w / 2, 0, w, 4)
  c.fillStyle = P.ink; c.font = `800 ${size}px ${e.fd}`; text(c, wrap(c, d.name, w - 14, 1), 0, size * 1.15, 0, 'center')
  c.fillStyle = '#6a554b'; c.font = `600 ${Math.round(size * 0.72)}px ${e.fs}`; text(c, [`${d.category}, ${d.rating} of 5`], 0, size * 2.1, 0, 'center')
  c.restore()
}
function smallPlate(c: Ctx, e: Env, x: number, y: number, R: number, d: DishInfo) {
  c.save(); c.translate(x, y)
  c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.arc(4, 7, R, 0, TAU); c.fill()
  c.fillStyle = P.plate; c.beginPath(); c.arc(0, 0, R, 0, TAU); c.fill()
  c.strokeStyle = 'rgba(0,0,0,.1)'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, R * 0.86, 0, TAU); c.stroke()
  dishArt(c, d, (R * 0.84) / 300 * 1.1)
  c.restore()
  nameCard(c, e, x, y + R + 10, Math.max(150, R * 2), d, 17)
}

/* ---------------------------------------------------------------- level 2: the table */
function tableBg(c: Ctx, e: Env) {
  c.fillStyle = P.brick; c.fillRect(-4000, -4000, 8000, 8000)
  if (e.cloth) { c.fillStyle = e.cloth; c.fillRect(-1500, -1500, 3000, 3000) }
  const vg = c.createRadialGradient(0, 0, 200, 0, 0, 900); vg.addColorStop(0, 'rgba(243,201,105,.14)'); vg.addColorStop(1, 'rgba(42,14,12,.5)'); c.fillStyle = vg; c.fillRect(-1500, -1500, 3000, 3000)
  // the other dishes, drawn as plates with name cards
  const others = e.dishes.slice(1, e.wide ? 5 : 4)
  const pos: [number, number][] = e.wide ? [[-345, -150], [345, -150], [-345, 110], [345, 110]] : [[-110, -345], [110, -345], [-110, 345], [110, 345]]
  others.forEach((d, i) => smallPlate(c, e, pos[i][0], pos[i][1], e.wide ? 92 : 78, d))
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -208, -190, 424, 400, 14); c.fill()
  c.fillStyle = P.plate; rr(c, -215, -200, 430, 400, 12); c.fill()
  c.strokeStyle = 'rgba(110,35,64,.5)'; c.lineWidth = 3; rr(c, -203, -188, 406, 376, 8); c.stroke()
  // the latest dish's own name card
  const d0 = e.dishes[0]
  if (d0) nameCard(c, e, 0, 190, 300, d0, 26)
  c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.arc(4, 8, 178, 0, TAU); c.fill()
  const ch = c.createRadialGradient(-40, -40, 80, 0, 0, 178); ch.addColorStop(0, '#f6d27c'); ch.addColorStop(1, '#b58a35'); c.fillStyle = ch; c.beginPath(); c.arc(0, 0, 175, 0, TAU); c.fill()
  c.fillStyle = '#F7F1E4'; c.beginPath(); c.arc(0, 0, 156, 0, TAU); c.fill()
  c.strokeStyle = 'rgba(0,0,0,.1)'; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 146, 0, TAU); c.stroke()
  if (e.wide) {
    c.fillStyle = '#c9ced1'; rr(c, -222, -120, 14, 210, 5); c.fill(); for (let i = 0; i < 3; i++) c.fillRect(-224 + i * 7, -150, 4, 44)
    c.fillStyle = '#dfe3e5'; rr(c, 200, -110, 18, 220, 7); c.fill(); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(214, -110, 4, 220)
  }
  // glass
  const wg = c.createRadialGradient(150, -235, 2, 150, -235, 42); wg.addColorStop(0, '#9a2d56'); wg.addColorStop(1, '#4a1230'); c.fillStyle = wg; c.beginPath(); c.arc(150, -235, 40, 0, TAU); c.fill()
  c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 3; c.beginPath(); c.arc(150, -235, 40, 0, TAU); c.stroke(); c.beginPath(); c.arc(138, -246, 20, 3.4, 4.6); c.stroke()
  // candles
  const t = e.t; const cands: Array<[number, number]> = e.wide ? [[-470, -270], [470, 250]] : [[-190, 5], [190, 5]]
  cands.forEach(([x, y], i) => {
    const f = 0.8 + 0.12 * Math.sin(t * 8 + i * 2) + 0.08 * Math.sin(t * 19 + i)
    glow(c, x, y, 230, P.lamp, 0.42 * f); c.fillStyle = '#e4c26a'; c.beginPath(); c.arc(x, y, 24, 0, TAU); c.fill(); c.fillStyle = '#FFF8EA'; c.beginPath(); c.arc(x, y, 14, 0, TAU); c.fill(); c.fillStyle = P.lamp; c.beginPath(); c.arc(x, y - 1, 6 * f, 0, TAU); c.fill()
  })
}
function tableFrame(c: Ctx, _e: Env, _S: number, a: number) {
  c.save(); c.globalAlpha = a; c.strokeStyle = '#E8DEC8'; c.lineWidth = 8; c.beginPath(); c.arc(0, 0, Q / 2 + 4, 0, TAU); c.stroke()
  c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, Q / 2 - 2, 0, TAU); c.stroke(); c.restore()
}
function tableFg(c: Ctx, e: Env) {
  const r = rng(21); const t = e.t
  for (let i = 0; i < 9; i++) {
    const ang = r() * TAU, rad = 430 + r() * 280, size = 40 + r() * 70
    const x = Math.cos(ang) * rad + Math.sin(t * 0.3 + i) * 12, y = Math.sin(ang) * rad + Math.cos(t * 0.27 + i) * 12
    glow(c, x, y, size, i % 3 ? P.lamp : '#FFF8EA', 0.16 + 0.1 * r())
  }
}

/* ---------------------------------------------------------------- level 3: the plate, set like a menu */
function plateBg(c: Ctx, e: Env) {
  const g = c.createRadialGradient(0, 0, 60, 0, 0, 520); g.addColorStop(0, '#FBF6EA'); g.addColorStop(1, '#E6DCC8')
  c.fillStyle = g; c.fillRect(-4000, -4000, 8000, 8000)
  c.strokeStyle = 'rgba(0,0,0,.06)'; c.lineWidth = 5; c.beginPath(); c.arc(0, 0, 440, 0, TAU); c.stroke()
  const d = e.dishes[0]
  if (d) {
    dishArt(c, d, 0.84)
    c.fillStyle = P.ink
    if (e.wide) {
      c.font = `800 44px ${e.fd}`; const nl = wrap(c, d.name, 225, 3); text(c, nl, -490, -150, 46)
      let y = -150 + nl.length * 46 + 4
      c.font = `700 20px ${e.fs}`; c.fillStyle = P.brick; text(c, [d.category], -490, y, 24); y += 26
      c.fillStyle = P.plum; text(c, [`rated ${d.rating} of 5`], -490, y, 24)
      c.fillStyle = P.ink; c.font = `700 22px ${e.fs}`; text(c, ['On the plate'], 296, -150, 26)
      c.font = `600 21px ${e.fs}`; d.ingredients.slice(0, 7).forEach((ing, i) => { c.fillStyle = P.brick; c.beginPath(); c.arc(302, -112 + i * 33 - 6, 4, 0, TAU); c.fill(); c.fillStyle = P.ink; text(c, wrap(c, ing, 190, 1), 316, -112 + i * 33, 0) })
    } else {
      c.font = `800 38px ${e.fd}`; const nl = wrap(c, d.name, 420, 2); text(c, nl, 0, -396 - (nl.length - 1) * 40, 40, 'center')
      c.font = `700 20px ${e.fs}`; c.fillStyle = P.brick; text(c, [`${d.category}, rated ${d.rating} of 5`], 0, -310, 0, 'center')
      c.font = `600 20px ${e.fs}`; d.ingredients.slice(0, 6).forEach((ing, i) => { const cx = i % 2 ? 14 : -216, y = 300 + Math.floor(i / 2) * 34; c.fillStyle = P.brick; c.beginPath(); c.arc(cx + 5, y - 6, 4, 0, TAU); c.fill(); c.fillStyle = P.ink; text(c, wrap(c, ing, 190, 1), cx + 18, y, 0) })
    }
  }
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

/* ---------------------------------------------------------------- level 4: the film strip */
function posterAt(c: Ctx, e: Env, p: Poster | undefined, cx: number, cy: number, w: number, h: number) {
  c.fillStyle = 'rgba(0,0,0,.4)'; rr(c, cx - w / 2 - 3, cy - h / 2 + 4, w + 14, h + 14, 4); c.fill()
  c.fillStyle = P.lamp; rr(c, cx - w / 2 - 7, cy - h / 2 - 7, w + 14, h + 14, 4); c.fill()
  if (p?.img && p.img.complete && p.img.naturalWidth) c.drawImage(p.img, cx - w / 2, cy - h / 2, w, h)
  else { const g = c.createLinearGradient(cx, cy - h / 2, cx, cy + h / 2); g.addColorStop(0, P.brick); g.addColorStop(1, P.plum); c.fillStyle = g; c.fillRect(cx - w / 2, cy - h / 2, w, h); c.fillStyle = P.plate; c.font = `800 ${w * 0.13}px ${e.fd}`; text(c, wrap(c, p?.title ?? '', w - 16, 3), cx, cy, w * 0.15, 'center') }
}
function cinemaBg(c: Ctx, e: Env) {
  const g = c.createRadialGradient(0, 0, 80, 0, 0, 800); g.addColorStop(0, '#5c1b38'); g.addColorStop(1, '#2a0d1c'); c.fillStyle = g; c.fillRect(-4000, -4000, 8000, 8000)
  const edge = e.wide ? 440 : 215
  for (const s of [-1, 1]) {
    c.save(); c.scale(s, 1)
    const cg = c.createLinearGradient(edge, 0, edge + 500, 0); cg.addColorStop(0, '#8a2a52'); cg.addColorStop(0.4, P.plum); cg.addColorStop(1, '#3a1026'); c.fillStyle = cg
    c.beginPath(); c.moveTo(edge + 40, -700); c.bezierCurveTo(edge - 20, -250, edge + 50, 250, edge - 10, 700); c.lineTo(edge + 1200, 700); c.lineTo(edge + 1200, -700); c.fill()
    for (let i = 0; i < 16; i++) { const x = edge + 30 + i * 34; c.strokeStyle = i % 2 ? 'rgba(255,170,150,.1)' : 'rgba(0,0,0,.28)'; c.lineWidth = 8; c.beginPath(); c.moveTo(x, -700); c.lineTo(x - 4 + (i % 3) * 4, 700); c.stroke() }
    c.restore()
  }
  glow(c, 0, 0, 430, '#FFF3D6', 0.26 + 0.03 * Math.sin(e.t * 5))
  // the film strip: posters slide past the screen as you scroll
  const n = e.posters.length
  const cy = e.wide ? 0 : -350, bh = e.wide ? 172 : 108, pw = e.wide ? 190 : 130, ph = pw * 1.5, G = e.wide ? 300 : 195
  const off = e.z * (e.wide ? 340 : 220)
  c.fillStyle = '#1b1215'; c.fillRect(-1200, cy - bh, 2400, bh * 2)
  c.fillStyle = '#d8c9ad'
  const hs = e.wide ? 26 : 18
  for (let x = -1200 - (off % hs); x < 1200; x += hs) { rr(c, x, cy - bh + 6, hs * 0.5, 11, 2); c.fill(); rr(c, x, cy + bh - 17, hs * 0.5, 11, 2); c.fill() }
  if (n) {
    const base = Math.floor(off / G), frac = (off / G) - base
    for (let s = -4; s <= 4; s++) {
      const x = s * G - frac * G, i = (((base + s) % n) + n) % n, p = e.posters[i]
      if (Math.abs(x) > (e.wide ? 620 : 330)) continue
      posterAt(c, e, p, x, cy, pw, ph)
      c.fillStyle = P.plate; c.font = `800 ${e.wide ? 24 : 19}px ${e.fd}`; text(c, wrap(c, p.title, G - 26, 1), x, cy + bh + (e.wide ? 40 : 26), 0, 'center')
      c.fillStyle = P.lamp; c.font = `600 ${e.wide ? 18 : 15}px ${e.fs}`; text(c, [`${p.rating} of 5, ${p.date}`], x, cy + bh + (e.wide ? 66 : 46), 0, 'center')
    }
  }
  c.fillStyle = '#fff3d6'; c.fillRect(-Q / 2 - 14, -Q / 2 - 14, Q + 28, Q + 28)
}
function cinemaFrame(c: Ctx, _e: Env, _S: number, a: number) {
  c.save(); c.globalAlpha = a; const h = Q / 2, o = h + 15
  const g = c.createLinearGradient(-o, -o, o, o); g.addColorStop(0, '#f6dc94'); g.addColorStop(0.5, P.lamp); g.addColorStop(1, '#9a7428')
  c.fillStyle = g; c.beginPath(); c.rect(-o, -o, o * 2, o * 2); c.rect(-h, -h, h * 2, h * 2); c.fill('evenodd')
  c.strokeStyle = 'rgba(30,10,10,.6)'; c.lineWidth = 2; c.strokeRect(-h, -h, Q, Q); c.restore()
}
function cinemaFg(c: Ctx, e: Env) {
  const r = rng(5)
  c.fillStyle = 'rgba(255,243,214,.55)'
  for (let i = 0; i < 34; i++) { const x = (r() - 0.5) * 900, y = (r() - 0.5) * 900 + Math.sin(e.t * 0.5 + i) * 10; c.beginPath(); c.arc(x, y, 1.5 + r() * 2.5, 0, TAU); c.fill() }
  if (!e.wide) for (let i = -2; i <= 2; i++) { const x = i * 150; c.fillStyle = P.teal; rr(c, x - 62, 430, 124, 140, 30); c.fill(); c.fillStyle = 'rgba(255,255,255,.08)'; rr(c, x - 50, 438, 100, 20, 10); c.fill() }
}

type Level = { bg: (c: Ctx, e: Env, S: number, idx: number) => void; frame: (c: Ctx, e: Env, S: number, a: number) => void; fg: (c: Ctx, e: Env, S: number, idx: number) => void; round: boolean }
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
  L.bg(c, e, S, idx)
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
  c.save(); c.scale(g, g); L.fg(c, e, S, idx); c.restore()
  c.restore()
}

/** Render the nested stack at zoom position z (levels; fractional part = progress through one level). */
export function renderZoom(c: Ctx, e: Env, w: number, h: number, dpr: number, z: number) {
  const idx = Math.floor(z), f = z - idx
  c.setTransform(dpr, 0, 0, dpr, 0, 0)
  c.save(); c.translate(w / 2, h / 2)
  const S0 = Math.pow(K, f); c.scale(e.B * S0, e.B * S0)
  e.z = z
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
