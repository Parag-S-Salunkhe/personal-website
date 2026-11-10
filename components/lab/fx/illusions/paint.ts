import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import { rng } from './rng'

export type Fonts = { display: string; body: string }
type C = CanvasRenderingContext2D

export const COL = { cloth: '#17352A', deep: '#10281F', linen: '#F1EEE6', candle: '#F6B94F', claret: '#7C2236', sage: '#A9C3AE', wax: '#FFF8EA', brass: '#D8A84E', wood: '#3a2216' }

const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

function finish(cv: HTMLCanvasElement) {
  const t = new CanvasTexture(cv)
  t.colorSpace = SRGBColorSpace
  t.anisotropy = 4
  return t
}

/** A texture painted in WORLD units: origin at the centre, y up. */
function world(wu: number, hu: number, ppu: number, draw: (c: C) => void) {
  const cv = document.createElement('canvas')
  cv.width = Math.round(wu * ppu)
  cv.height = Math.round(hu * ppu)
  const c = cv.getContext('2d')!
  c.setTransform(ppu, 0, 0, -ppu, cv.width / 2, cv.height / 2)
  draw(c)
  return finish(cv)
}

function glow(c: C, x: number, y: number, r: number, hex: string, a: number) {
  const g = c.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, rgba(hex, a))
  g.addColorStop(0.4, rgba(hex, a * 0.35))
  g.addColorStop(1, rgba(hex, 0))
  c.save()
  c.globalCompositeOperation = 'lighter'
  c.fillStyle = g
  c.fillRect(x - r, y - r, r * 2, r * 2)
  c.restore()
}

function text(c: C, s: string, x: number, y: number, size: number, family: string, color: string, align: CanvasTextAlign = 'center', weight = '400') {
  const S = 200
  c.save()
  c.translate(x, y)
  c.scale(1 / S, -1 / S)
  c.font = `${weight} ${size * S}px ${family}`
  c.fillStyle = color
  c.textAlign = align
  c.textBaseline = 'middle'
  c.fillText(s, 0, 0)
  c.restore()
}
function measure(c: C, s: string, size: number, family: string, weight = '400') {
  const S = 200
  c.save()
  c.font = `${weight} ${size * S}px ${family}`
  const w = c.measureText(s).width / S
  c.restore()
  return w
}

function ellipse(c: C, x: number, y: number, rx: number, ry: number, fill: string | CanvasGradient) {
  c.beginPath()
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
  c.fillStyle = fill
  c.fill()
}
function rrect(c: C, x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient) {
  c.beginPath()
  c.roundRect(x, y, w, h, r)
  c.fillStyle = fill
  c.fill()
}

/* ---------- Illusion 1: the word ---------- */
export const WORD_AR = 3.1
export function wordTexture(word: string, fonts: Fonts) {
  const W = 2048, H = Math.round(W / WORD_AR)
  const cv = document.createElement('canvas')
  cv.width = W; cv.height = H
  const c = cv.getContext('2d')!
  c.fillStyle = COL.linen
  c.fillRect(0, 0, W, H)
  const r = rng(11)
  for (let i = 0; i < 2600; i++) { c.fillStyle = `rgba(120,100,70,${r() * 0.05})`; c.fillRect(r() * W, r() * H, 1 + r() * 3, 1 + r() * 2) }
  const warm = c.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, W * 0.6)
  warm.addColorStop(0, 'rgba(246,185,79,0.18)'); warm.addColorStop(1, 'rgba(124,34,54,0.1)')
  c.fillStyle = warm; c.fillRect(0, 0, W, H)
  c.strokeStyle = COL.claret; c.lineWidth = 7; c.strokeRect(34, 34, W - 68, H - 68)
  c.strokeStyle = '#C98F2E'; c.lineWidth = 3; c.strokeRect(54, 54, W - 108, H - 108)
  c.textAlign = 'center'; c.textBaseline = 'middle'
  c.font = `700px ${fonts.display}`
  const w0 = c.measureText(word).width || 1
  const size = Math.min(700 * (W * 0.8) / w0, H * 0.78)
  c.font = `${size}px ${fonts.display}`
  c.fillStyle = COL.claret
  c.fillText(word, W / 2, H / 2 + size * 0.04)
  return finish(cv)
}

export function glowTexture() {
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 128
  const c = cv.getContext('2d')!
  const g = c.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255,248,234,0.9)'); g.addColorStop(0.2, 'rgba(246,185,79,0.55)'); g.addColorStop(1, 'rgba(246,185,79,0)')
  c.fillStyle = g; c.fillRect(0, 0, 128, 128)
  return finish(cv)
}
export function flameTexture() {
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 192
  const c = cv.getContext('2d')!
  const g = c.createRadialGradient(64, 120, 0, 64, 120, 90)
  g.addColorStop(0, 'rgba(246,185,79,0.5)'); g.addColorStop(1, 'rgba(246,185,79,0)')
  c.fillStyle = g; c.fillRect(0, 0, 128, 192)
  c.beginPath(); c.moveTo(64, 28); c.bezierCurveTo(96, 80, 90, 130, 64, 150); c.bezierCurveTo(38, 130, 32, 80, 64, 28)
  const f = c.createLinearGradient(0, 28, 0, 150)
  f.addColorStop(0, '#FFE9A8'); f.addColorStop(0.6, '#F6B94F'); f.addColorStop(1, '#fff8ea')
  c.fillStyle = f; c.fill()
  return finish(cv)
}

/* ---------- Illusion 2: the room, back to front ---------- */
export function wallpaperTexture() {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256
  const c = cv.getContext('2d')!
  c.fillStyle = '#1b3b2f'; c.fillRect(0, 0, 256, 256)
  c.fillStyle = '#153227'; for (let x = 0; x < 256; x += 64) c.fillRect(x, 0, 28, 256)
  c.fillStyle = 'rgba(169,195,174,0.18)'
  for (const [x, y] of [[32, 40], [96, 168], [160, 40], [224, 168]]) { c.beginPath(); c.moveTo(x, y - 18); c.lineTo(x + 11, y); c.lineTo(x, y + 18); c.lineTo(x - 11, y); c.fill() }
  const t = finish(cv); t.wrapS = t.wrapT = RepeatWrapping
  return t
}

export function wallDecorTexture() {
  return world(44, 18, 36, (c) => {
    // dado panelling
    const w = c.createLinearGradient(0, -9, 0, -0.2); w.addColorStop(0, '#0b1f17'); w.addColorStop(1, '#17352A')
    c.fillStyle = w; c.fillRect(-22, -9, 44, 8.8)
    c.strokeStyle = 'rgba(216,168,78,0.35)'; c.lineWidth = 0.05
    for (let x = -21; x < 21; x += 4.2) c.strokeRect(x, -8, 3.6, 6.4)
    c.fillStyle = COL.wood; c.fillRect(-22, -0.35, 44, 0.35)
    c.fillStyle = COL.brass; c.fillRect(-22, -0.04, 44, 0.06)
    c.fillStyle = COL.wood; c.fillRect(-22, 7.1, 44, 0.3)
    c.fillStyle = 'rgba(16,40,31,0.55)'; c.fillRect(-22, 7.4, 44, 1.6)
    // framed prints
    for (const x of [-14, 14]) {
      c.fillStyle = COL.brass; c.fillRect(x - 1.7, 1.6, 3.4, 4.4)
      c.fillStyle = COL.linen; c.fillRect(x - 1.5, 1.8, 3, 4)
      c.fillStyle = COL.sage; c.fillRect(x - 1.2, 2.1, 2.4, 3.4)
      ellipse(c, x, 3.2, 0.7, 0.9, COL.claret); ellipse(c, x + 0.3, 2.6, 0.4, 0.5, COL.candle)
      c.fillStyle = COL.deep; c.fillRect(x - 1.2, 2.1, 2.4, 0.5)
    }
    // sconces
    for (const x of [-20, -13, -4.5, 4.5, 13, 20]) {
      glow(c, x, 3.4, 5.5, COL.candle, 0.38)
      c.strokeStyle = COL.brass; c.lineWidth = 0.1; c.beginPath(); c.moveTo(x, 2); c.quadraticCurveTo(x, 2.9, x + 0.5, 3); c.stroke()
      rrect(c, x - 0.45, 3, 0.9, 1.1, 0.35, COL.wax)
      glow(c, x, 3.55, 1.4, COL.wax, 0.7)
    }
  })
}

export function farRoomTexture() {
  return world(50, 16, 30, (c) => {
    for (const [x, w] of [[-19, 6.4], [18, 6.4]] as const) {
      c.fillStyle = COL.wood; c.beginPath(); c.moveTo(x - w / 2 - 0.5, -7); c.lineTo(x - w / 2 - 0.5, 3); c.arc(x, 3, w / 2 + 0.5, Math.PI, 0); c.lineTo(x + w / 2 + 0.5, -7); c.fill()
      const g = c.createLinearGradient(0, -7, 0, 6); g.addColorStop(0, '#F6B94F'); g.addColorStop(0.5, '#C9702F'); g.addColorStop(1, '#7C2236')
      c.fillStyle = g; c.beginPath(); c.moveTo(x - w / 2, -7); c.lineTo(x - w / 2, 3); c.arc(x, 3, w / 2, Math.PI, 0); c.lineTo(x + w / 2, -7); c.fill()
      glow(c, x, 0, 7, COL.candle, 0.4)
    }
    // sideboard
    rrect(c, -6, -7, 14, 5.2, 0.2, '#2a1810'); c.fillStyle = '#4a2c1c'; c.fillRect(-6.3, -1.9, 14.6, 0.3)
    const r = rng(5)
    const bot = [COL.sage, COL.claret, '#2f6b4f', COL.sage, COL.sage, COL.claret, '#2f6b4f']
    bot.forEach((b, i) => { const x = -4 + i * 1.1, h = 1.5 + r() * 0.8; rrect(c, x - 0.22, -1.6, 0.44, h, 0.1, b); c.fillRect(x - 0.08, -1.6 + h - 0.05, 0.16, 0.5) })
    for (const x of [-5.2, 6.6]) { rrect(c, x - 0.12, -1.6, 0.24, 1.2, 0.05, COL.wax); glow(c, x, -0.2, 2.8, COL.candle, 0.6) }
    // festoon lights
    c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 0.04
    for (let k = 0; k < 2; k++) {
      c.beginPath()
      const pts: [number, number][] = []
      for (let i = 0; i <= 40; i++) { const t = i / 40, x = -25 + t * 50, y = 6.3 - Math.sin(t * Math.PI) * (1.3 + k * 0.6) - k * 0.7; pts.push([x, y]); i ? c.lineTo(x, y) : c.moveTo(x, y) }
      c.stroke()
      pts.forEach(([x, y], i) => { if (i % 3 === 0) { glow(c, x, y - 0.1, 0.8, COL.candle, 0.7); ellipse(c, x, y - 0.12, 0.1, 0.14, COL.wax) } })
    }
  })
}

export function farTableTexture() {
  return world(40, 9, 36, (c) => {
    const r = rng(21)
    const heads = [-16, -11, -5.5, 0, 5.5, 11, 16]
    heads.forEach((x, i) => {
      const jx = (r() - 0.5) * 1.2
      rrect(c, x + jx - 1.5, -3, 3, 5.4, 0.6, i % 2 ? COL.claret : '#2f6b4f')
      const skin = ['#e0b394', '#b98163', '#f0cfb2', '#8d5a43'][i % 4]
      ellipse(c, x + jx, 3.4 + r() * 0.4, 0.62, 0.74, skin)
      c.fillStyle = ['#2b1a12', '#c9a05a', '#1a1a1a', '#6b3a22'][(i * 3) % 4]
      c.beginPath(); c.ellipse(x + jx, 3.7, 0.66, 0.5, 0, Math.PI, 0); c.fill()
      c.fillStyle = i % 2 ? '#5a1626' : '#1e5441'; c.beginPath(); c.ellipse(x + jx, 2.3, 1.45, 1.3, 0, Math.PI, 0); c.fill()
    })
    const g = c.createLinearGradient(0, -4.5, 0, 0.2); g.addColorStop(0, '#8e8a7a'); g.addColorStop(1, '#d9d3c0')
    c.fillStyle = g; c.fillRect(-20, -4.5, 40, 4.7)
    c.fillStyle = COL.claret; c.fillRect(-20, -1.9, 40, 0.35)
    for (const x of [-13, -2.5, 8.5, 17]) { rrect(c, x - 0.1, -1.4, 0.2, 1.4, 0.04, COL.wax); glow(c, x, 0.2, 3.2, COL.candle, 0.65) }
    for (const x of [-8, 3, 13.5]) { c.strokeStyle = 'rgba(255,248,234,0.7)'; c.lineWidth = 0.05; c.beginPath(); c.ellipse(x, 0.8, 0.28, 0.4, 0, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.moveTo(x, 0.4); c.lineTo(x, -0.8); c.stroke() }
    glow(c, 0, 0.5, 18, COL.candle, 0.12)
  })
}

export function menuTexture(w: number, h: number, fonts: Fonts, dishes: { name: string; category: string }[]) {
  return world(w, h, 150, (c) => {
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(-w / 2 + 0.1, -h / 2 - 0.1, w, h - 0.0)
    c.strokeStyle = COL.brass; c.lineWidth = 0.03
    c.beginPath(); c.moveTo(-w * 0.3, h / 2); c.lineTo(-w * 0.3, h / 2 + 3); c.moveTo(w * 0.3, h / 2); c.lineTo(w * 0.3, h / 2 + 3); c.stroke()
    const g = c.createLinearGradient(0, h / 2, 0, -h / 2); g.addColorStop(0, '#F8F5EC'); g.addColorStop(1, '#E6E0CF')
    c.fillStyle = g; c.fillRect(-w / 2, -h / 2, w, h)
    c.strokeStyle = COL.claret; c.lineWidth = 0.035; c.strokeRect(-w / 2 + 0.14, -h / 2 + 0.14, w - 0.28, h - 0.28)
    c.lineWidth = 0.012; c.strokeRect(-w / 2 + 0.22, -h / 2 + 0.22, w - 0.44, h - 0.44)
    text(c, 'The menu', 0, h / 2 - 0.62, 0.42, fonts.display, COL.claret)
    c.fillStyle = COL.claret; c.fillRect(-0.5, h / 2 - 0.98, 1, 0.02)
    const n = Math.min(dishes.length, 5)
    const top = h / 2 - 1.3, step = (h - 1.75) / Math.max(n, 1)
    for (let i = 0; i < n; i++) {
      const y = top - step * (i + 0.5) + 0.05
      let size = 0.3
      const maxW = w - 0.7
      const nm = dishes[i].name
      while (size > 0.17 && measure(c, nm, size, fonts.display) > maxW) size -= 0.01
      text(c, nm, 0, y + 0.1, size, fonts.display, COL.deep)
      text(c, dishes[i].category, 0, y - 0.17, 0.15, fonts.body, '#5b3a2e', 'center', '500')
    }
  })
}

export function tableTexture() {
  return world(40, 9, 36, (c) => {
    const top = c.createLinearGradient(0, 3.4, 0, 1); top.addColorStop(0, '#fffaf0'); top.addColorStop(1, '#e6dfcc')
    c.fillStyle = top; c.fillRect(-20, 1, 40, 2.5)
    const dr = c.createLinearGradient(0, 1, 0, -4.5); dr.addColorStop(0, '#d8d1bd'); dr.addColorStop(1, '#8d8774')
    c.fillStyle = dr; c.fillRect(-20, -4.5, 40, 5.5)
    c.strokeStyle = 'rgba(80,70,50,0.18)'; c.lineWidth = 0.05
    for (let x = -20; x < 20; x += 1.7) { c.beginPath(); c.moveTo(x, 1); c.quadraticCurveTo(x + 0.4, -1.6, x - 0.2, -4.5); c.stroke() }
    c.fillStyle = COL.claret; c.fillRect(-20, 1.75, 40, 0.5)
    c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(-20, 0.9, 40, 0.1)
    for (const x of [-14, -9, 9, 14]) {
      ellipse(c, x, 2.15, 1.7, 0.42, '#fffaf0'); ellipse(c, x, 2.15, 1.15, 0.28, COL.sage); ellipse(c, x, 2.17, 0.75, 0.17, '#fffaf0')
      rrect(c, x - 2.5, 1.9, 0.6, 0.9, 0.08, COL.claret)
      c.strokeStyle = '#a8a39a'; c.lineWidth = 0.05; c.beginPath(); c.moveTo(x + 2.2, 1.9); c.lineTo(x + 2.2, 2.6); c.stroke()
    }
    for (const x of [-11.5, -6.5, 6.5, 11.5]) {
      c.strokeStyle = 'rgba(255,248,234,0.85)'; c.lineWidth = 0.06
      c.beginPath(); c.moveTo(x, 2.2); c.lineTo(x, 3.4); c.stroke()
      ellipse(c, x, 2.15, 0.42, 0.09, 'rgba(255,248,234,0.6)')
      c.beginPath(); c.ellipse(x, 4.0, 0.42, 0.62, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(124,34,54,0.4)'; c.fill(); c.stroke()
    }
    for (const x of [-7.6, 7.6]) {
      rrect(c, x - 0.3, 1.95, 0.6, 0.18, 0.05, COL.brass); rrect(c, x - 0.08, 2.1, 0.16, 0.6, 0.03, COL.brass); rrect(c, x - 0.11, 2.6, 0.22, 1.3, 0.05, COL.wax)
      glow(c, x, 3.6, 6.5, COL.candle, 0.45)
    }
    glow(c, 0, 2.5, 16, COL.candle, 0.14)
  })
}
export const TABLE_FLAMES = [-7.6, 7.6]

export function subjectTexture() {
  return world(4.4, 3.6, 120, (c) => {
    // candles
    for (const x of [-1.55, 1.55]) {
      rrect(c, x - 0.1, -1.3, 0.2, 1.5, 0.04, COL.wax)
      c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(x + 0.03, -1.3, 0.07, 1.5)
      rrect(c, x - 0.22, -1.38, 0.44, 0.12, 0.05, COL.brass)
    }
    // plate + cloche
    ellipse(c, 0, -1.3, 1.55, 0.2, '#c9c5b6'); ellipse(c, 0, -1.26, 1.4, 0.15, '#fffaf0')
    const g = c.createRadialGradient(-0.4, 0.4, 0.1, 0, -0.2, 1.4)
    g.addColorStop(0, '#fffaf0'); g.addColorStop(0.35, '#c9cbc6'); g.addColorStop(0.8, '#6c7370'); g.addColorStop(1, '#3a4440')
    c.beginPath(); c.moveTo(-1.25, -1.22); c.bezierCurveTo(-1.25, 0.9, 1.25, 0.9, 1.25, -1.22); c.closePath(); c.fillStyle = g; c.fill()
    glow(c, 0.5, -0.4, 1.1, COL.candle, 0.33)
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 0.07; c.lineCap = 'round'
    c.beginPath(); c.moveTo(-0.9, -0.3); c.bezierCurveTo(-0.95, 0.2, -0.55, 0.5, -0.2, 0.55); c.stroke()
    ellipse(c, 0, 0.74, 0.3, 0.06, '#8a6a2a'); ellipse(c, 0, 0.88, 0.16, 0.16, COL.brass); ellipse(c, -0.05, 0.93, 0.05, 0.05, COL.wax)
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.ellipse(0, -1.32, 1.4, 0.07, 0, 0, Math.PI); c.fill()
  })
}
export const SUBJECT_FLAMES: [number, number][] = [[-1.55, 0.42], [1.55, 0.42]]

export function foregroundTexture() {
  return world(12, 7, 60, (c) => {
    const r = rng(77)
    c.save()
    try { c.filter = 'blur(5px)' } catch { /* older browsers */ }
    const glass = (x: number, y: number, s: number) => {
      c.fillStyle = 'rgba(124,34,54,0.55)'; c.strokeStyle = 'rgba(255,248,234,0.8)'; c.lineWidth = 0.07 * s
      c.beginPath(); c.ellipse(x, y, 0.6 * s, 0.95 * s, 0, 0, Math.PI * 2); c.fill(); c.stroke()
      c.beginPath(); c.moveTo(x, y - 0.95 * s); c.lineTo(x, y - 2.6 * s); c.stroke()
      ellipse(c, x, y - 2.65 * s, 0.7 * s, 0.1 * s, 'rgba(255,248,234,0.7)')
    }
    glass(-3.3, 0.9, 1); glass(3.7, 0.2, 0.8)
    c.restore()
    for (let i = 0; i < 16; i++) { const rad = 0.15 + r() * 0.4; glow(c, (r() - 0.5) * 11, (r() - 0.5) * 6, rad * 2, r() > 0.4 ? COL.candle : COL.wax, 0.22 + r() * 0.2) }
    c.fillStyle = 'rgba(90,22,38,0.9)'; c.beginPath(); c.moveTo(4.2, -3.5); c.quadraticCurveTo(5.5, -2.4, 6, -0.8); c.lineTo(6, -3.5); c.fill()
  })
}

export function backdropTexture() {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256
  const c = cv.getContext('2d')!
  const g = c.createRadialGradient(128, 128, 0, 128, 128, 140)
  g.addColorStop(0, '#2f6150'); g.addColorStop(0.5, '#17352A'); g.addColorStop(1, '#0a1c14')
  c.fillStyle = g; c.fillRect(0, 0, 256, 256)
  return finish(cv)
}
