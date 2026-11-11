// Ported from components/lab/fx/popup-book/art.ts: the pages are repainted from real dishes (getDishes()).
// Every word on the paper comes from `BookData`; nothing about a dish is written here.
import * as THREE from 'three'
import { C, grain, hash, mk, rng, toTex, type Fam } from './paper'

export type BookDish = { name: string; slug: string; category: string; rating: number; date: string; ingredients: string[] }
export type BookData = { dishes: BookDish[]; dishCount: number }
export type PanelSpec = { key: string; w: number; h: number; x: number; z: number; d: number; tex: THREE.Texture; glow?: THREE.Texture; yaw?: number }
export type Assets = { front: THREE.Texture[]; back: THREE.Texture[]; spreads: PanelSpec[][]; textures: THREE.Texture[] }

type G = CanvasRenderingContext2D
export const PW = 3.0, PH = 2.4

class Ink {
  scale: number
  constructor(scale: number) { this.scale = scale }
  /** A unit-space canvas: draw with 1 unit = `scale` pixels, y down from the top edge. */
  panel(w: number, h: number) {
    const c = mk(w * this.scale, h * this.scale), g = c.getContext('2d')!
    g.scale(c.width / w, c.height / h)
    g.lineJoin = 'round'; g.lineCap = 'round'
    return { c, g, finish: () => { grain(g, c.width, c.height); return toTex(c) } }
  }
  glow(w: number, h: number) { const c = mk(w * this.scale * 0.5, h * this.scale * 0.5), g = c.getContext('2d')!; g.scale(c.width / w, c.height / h); g.fillStyle = '#000'; g.fillRect(0, 0, w, h); return { c, g, tex: () => toTex(c) } }
}

const edge = 'rgba(28,14,8,.3)'
function fill(g: G, color: string | CanvasGradient, stroke = edge) { g.fillStyle = color; g.fill(); if (stroke) { g.lineWidth = 0.007; g.strokeStyle = stroke; g.stroke() } }
function rrect(g: G, x: number, y: number, w: number, h: number, r: number) { g.beginPath(); g.roundRect(x, y, w, h, r) }
function lg(g: G, x0: number, y0: number, x1: number, y1: number, stops: [number, string][]) { const k = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => k.addColorStop(o, c)); return k }
function scallops(g: G, w: number, y: number, n: number, depth: number, r: () => number, jitter = 0.4) {
  const bw = w / n
  g.moveTo(0, y)
  for (let i = 0; i < n; i++) { const x = i * bw; g.quadraticCurveTo(x + bw / 2, y - depth * (1 - jitter + r() * jitter * 2), x + bw, y) }
}
function wrapText(g: G, text: string, x: number, y: number, maxW: number, lh: number, maxLines = 3, center = false) {
  const words = text.split(/\s+/), lines: string[] = []
  let cur = ''
  for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w } else cur = t }
  if (cur) lines.push(cur)
  if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '…') }
  g.textAlign = center ? 'center' : 'left'
  lines.forEach((l, i) => g.fillText(l, x, y + i * lh))
  return lines.length
}
function stars(g: G, n: number, x: number, y: number, size: number, color: string) {
  for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(x + i * size * 2.3, y, size, 0, 7); g.fillStyle = i < n ? color : 'rgba(23,53,42,.22)'; g.fill() }
}

function flameShape(g: G, x: number, y: number, s: number) {
  g.beginPath(); g.moveTo(x, y - s); g.bezierCurveTo(x + s * 0.55, y - s * 0.3, x + s * 0.7, y + s * 0.3, x, y + s * 0.7); g.bezierCurveTo(x - s * 0.7, y + s * 0.3, x - s * 0.55, y - s * 0.3, x, y - s); g.closePath()
}
function flames(g: G, n: number, x: number, y: number, s: number, gap: number) {
  const lit = Math.round(n)
  for (let i = 0; i < 5; i++) {
    flameShape(g, x + i * gap, y, s)
    if (i < lit) { g.fillStyle = C.candle; g.fill(); g.strokeStyle = C.claret; g.lineWidth = 0.008; g.stroke() }
    else { g.strokeStyle = 'rgba(23,53,42,.45)'; g.lineWidth = 0.008; g.stroke() }
  }
}
const fmtN = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1))

/* ------------------------------ cover ------------------------------ */
function coverArt(ink: Ink, fam: Fam, dishCount: number) {
  const w = PW + 0.08, h = PH + 0.08
  const { c, g } = ink.panel(w, h)
  g.fillStyle = lg(g, 0, 0, w, h, [[0, '#8a2740'], [1, '#6b1b2e']]); g.fillRect(0, 0, w, h)
  g.lineWidth = 0.004
  for (let x = 0; x < w; x += 0.02) { g.strokeStyle = 'rgba(0,0,0,.09)'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke() }
  for (let y = 0; y < h; y += 0.02) { g.strokeStyle = 'rgba(255,230,230,.05)'; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke() }
  g.strokeStyle = C.candle; g.lineWidth = 0.022; rrect(g, 0.16, 0.16, w - 0.32, h - 0.32, 0.06); g.stroke()
  g.lineWidth = 0.008; rrect(g, 0.23, 0.23, w - 0.46, h - 0.46, 0.04); g.stroke()
  // emblem: a plate with a fork and a knife
  const ex = w / 2, ey = 0.58
  g.strokeStyle = C.candle; g.fillStyle = C.candle; g.lineWidth = 0.014
  g.beginPath(); g.arc(ex, ey, 0.2, 0, 7); g.stroke()
  g.beginPath(); g.arc(ex, ey, 0.12, 0, 7); g.stroke()
  g.lineWidth = 0.018
  g.beginPath(); g.moveTo(ex - 0.4, ey - 0.2); g.lineTo(ex - 0.4, ey + 0.22); g.stroke()
  g.lineWidth = 0.01; for (const dx of [-0.045, 0, 0.045]) { g.beginPath(); g.moveTo(ex - 0.4 + dx, ey - 0.22); g.lineTo(ex - 0.4 + dx, ey - 0.08); g.stroke() }
  g.lineWidth = 0.018; g.beginPath(); g.moveTo(ex + 0.4, ey - 0.22); g.quadraticCurveTo(ex + 0.46, ey - 0.02, ex + 0.4, ey + 0.1); g.lineTo(ex + 0.4, ey + 0.22); g.stroke()
  g.fillStyle = C.wax; g.textAlign = 'center'; g.textBaseline = 'alphabetic'
  g.font = `0.36px ${fam.gilda}`
  g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 0.03; g.shadowOffsetY = 0.012
  g.fillText('From the', ex, 1.2); g.fillText('kitchen', ex, 1.58)
  g.shadowColor = 'transparent'
  g.fillStyle = C.sage; g.font = `0.095px ${fam.hanken}`
  g.fillText(dishCount === 1 ? '1 dish so far' : `${dishCount} dishes so far`, ex, 1.8)
  return toTex((grain(g, c.width, c.height), c))
}

/* ------------------------------ flat pages ------------------------------ */
function pageBase(g: G, w: number, h: number, side: 'left' | 'right', seed: number) {
  g.fillStyle = lg(g, 0, 0, w, 0, side === 'right' ? [[0, '#e6e1d3'], [0.08, '#F1EEE6'], [1, '#F4F1EA']] : [[0, '#F4F1EA'], [0.92, '#F1EEE6'], [1, '#e6e1d3']])
  g.fillRect(0, 0, w, h)
  const r = rng(seed)
  for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(150,120,70,${0.015 + r() * 0.02})`; g.beginPath(); g.ellipse(r() * w, r() * h, 0.2 + r() * 0.5, 0.1 + r() * 0.3, r() * 3, 0, 7); g.fill() }
  const gx = side === 'right' ? 0 : w
  g.fillStyle = lg(g, gx, 0, gx + (side === 'right' ? 0.35 : -0.35), 0, [[0, 'rgba(70,40,20,.3)'], [1, 'rgba(70,40,20,0)']]); g.fillRect(side === 'right' ? 0 : w - 0.35, 0, 0.35, h)
  g.strokeStyle = 'rgba(60,40,20,.13)'; g.lineWidth = 0.006; g.beginPath(); g.moveTo(side === 'right' ? 0.012 : w - 0.012, 0); g.lineTo(side === 'right' ? 0.012 : w - 0.012, h); g.stroke()
  g.strokeStyle = 'rgba(184,138,68,.5)'; g.lineWidth = 0.007; rrect(g, 0.14, 0.14, w - 0.28, h - 0.28, 0.03); g.stroke()
}
function stageFloor(g: G, w: number, h: number, hinges: number[], accent: string) {
  g.strokeStyle = 'rgba(60,40,20,.28)'; g.lineWidth = 0.008; g.setLineDash([0.03, 0.05])
  for (const z of hinges) { const y = (z + PH / 2) / PH * h; g.beginPath(); g.moveTo(0.3, y); g.lineTo(w - 0.3, y); g.stroke() }
  g.setLineDash([])
  g.fillStyle = accent; g.globalAlpha = 0.1; g.beginPath(); g.ellipse(w / 2, h * 0.5, w * 0.4, h * 0.36, 0, 0, 7); g.fill(); g.globalAlpha = 1
}
/** Left page of a spread: the dish, its course, the flames, the cook date and the first ingredients. */
function dishLeft(ink: Ink, fam: Fam, d: BookDish, seed: number) {
  const { c, g } = ink.panel(PW, PH)
  pageBase(g, PW, PH, 'left', seed)
  g.textBaseline = 'alphabetic'; g.textAlign = 'left'
  let y = 0.5
  g.fillStyle = C.claret; g.font = `600 0.1px ${fam.hanken}`; g.fillText(d.category, 0.4, y); y += 0.3
  g.fillStyle = C.cloth; g.font = `0.25px ${fam.gilda}`
  const n = wrapText(g, d.name, 0.4, y, PW - 0.95, 0.28, 2)
  y += (n - 1) * 0.28 + 0.16
  g.strokeStyle = C.claret; g.lineWidth = 0.012; g.beginPath(); g.moveTo(0.4, y); g.lineTo(1.1, y); g.stroke()
  y += 0.28
  flames(g, d.rating, 0.46, y - 0.02, 0.085, 0.2)
  g.fillStyle = '#2a3a32'; g.font = `0.1px ${fam.hanken}`; g.textAlign = 'left'; g.fillText(`${fmtN(d.rating)} of 5`, 1.52, y + 0.01)
  y += 0.26
  g.fillText(`Cooked ${d.date}`, 0.4, y); y += 0.27
  if (d.ingredients.length) {
    g.fillStyle = C.claret; g.font = `600 0.095px ${fam.hanken}`; g.fillText('What went in', 0.4, y); y += 0.15
    g.fillStyle = '#2a3a32'; g.font = `0.092px ${fam.hanken}`
    for (const ing of d.ingredients.slice(0, 4)) { wrapText(g, ing, 0.4, y, PW - 1.0, 0.13, 1); y += 0.125 }
  }
  grain(g, c.width, c.height, 0.9)
  return toTex(c)
}
function rightPage(ink: Ink, seed: number, hinges: number[], accent: string) {
  const { c, g } = ink.panel(PW, PH)
  pageBase(g, PW, PH, 'right', seed)
  stageFloor(g, PW, PH, hinges, accent)
  grain(g, c.width, c.height, 0.9)
  return toTex(c)
}

/* ------------------------------ one pop-up scene per dish ------------------------------ */
const WALLS = ['#B7CDBB', '#D8C9A4', '#C3D0DC']
function dishSpread(ink: Ink, fam: Fam, d: BookDish): PanelSpec[] {
  const out: PanelSpec[] = []
  const seed = hash(d.name)
  {
    const w = 2.8, h = 1.7, { g, finish } = ink.panel(w, h), r = rng(51 + (seed % 7))
    g.beginPath(); scallops(g, w, 0.28, 8, 0.2, r, 0.15); g.lineTo(w, h); g.lineTo(0, h); g.closePath(); fill(g, WALLS[seed % 3])
    g.strokeStyle = 'rgba(241,238,230,.9)'; g.lineWidth = 0.014
    for (let y = 0.3; y < h; y += 0.17) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke() }
    for (let row = 0; row < 8; row++) for (let x = (row % 2) * 0.1; x < w; x += 0.2) { g.beginPath(); g.moveTo(x, 0.3 + row * 0.17); g.lineTo(x, 0.3 + (row + 1) * 0.17); g.stroke() }
    g.beginPath(); g.rect(0.1, 0.86, 2.6, 0.045); fill(g, '#8a5a2a')
    const jars = ['#7C2236', '#F6B94F', '#17352A', '#C7662B', '#F1EEE6', '#7C2236', '#F6B94F', '#17352A']
    jars.forEach((c, i) => { const x = 0.2 + i * 0.32; g.beginPath(); g.roundRect(x, 0.58, 0.2, 0.28, 0.04); fill(g, c); g.beginPath(); g.rect(x + 0.02, 0.54, 0.16, 0.05); fill(g, '#8a5a2a'); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x + 0.04, 0.63, 0.03, 0.18) })
    g.strokeStyle = '#2a3a32'; g.lineWidth = 0.014; g.beginPath(); g.moveTo(0.3, 0.38); g.lineTo(2.5, 0.38); g.stroke()
    ;[0.6, 1.2, 1.85].forEach((x, i) => { g.beginPath(); g.moveTo(x, 0.38); g.lineTo(x, 0.44); g.stroke(); g.beginPath(); g.arc(x, 0.5 + i * 0.01, 0.1, 0, 7); fill(g, i === 1 ? C.candle : '#2a3a32'); g.beginPath(); g.rect(x - 0.1, 0.43, 0.2, 0.03); fill(g, i === 1 ? '#b8861e' : '#10281F') })
    out.push({ key: 'k-wall', w, h, x: 1.5, z: -1.12, d: 0, tex: finish() })
  }
  {
    const w = 2.8, h = 1.15, { g, finish } = ink.panel(w, h)
    g.save(); g.translate(1.4, 0.66); g.scale(1.9, 1.9); dishPaint(g, 0, 0, seed % 3, seed); g.restore()
    g.beginPath(); g.rect(0.0, 0.66, w, 0.08); fill(g, '#F4F1EA')
    g.beginPath(); g.rect(0.04, 0.74, w - 0.08, h - 0.74); fill(g, lg(g, 0, 0.5, 0, h, [[0, '#8a2740'], [1, '#6b1b2e']]))
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 0.01
    for (let i = 0; i < 4; i++) { g.beginPath(); g.roundRect(0.12 + i * 0.66, 0.82, 0.58, 0.26, 0.02); g.stroke(); g.fillStyle = C.candle; g.beginPath(); g.arc(0.4 + i * 0.66, 0.95, 0.017, 0, 7); g.fill() }
    out.push({ key: 'k-counter', w, h, x: 1.5, z: -0.5, d: 0.1, tex: finish() })
  }
  {
    const w = 1.0, h = 0.56, { g, finish } = ink.panel(w, h)
    g.beginPath(); g.moveTo(0.03, 0.1); g.lineTo(0.97, 0.1); g.lineTo(0.97, h - 0.02); g.lineTo(0.03, h - 0.02); g.closePath()
    fill(g, lg(g, 0, 0, 0, h, [[0, '#FFF8EA'], [1, '#EFE8D6']]), 'rgba(60,40,10,.45)')
    g.fillStyle = C.claret; g.fillRect(0.03, 0.1, 0.94, 0.03)
    flames(g, d.rating, 0.2, 0.27, 0.07, 0.15)
    g.fillStyle = C.cloth; g.font = `600 0.075px ${fam.hanken}`; g.textAlign = 'center'; g.fillText(`${fmtN(d.rating)} of 5`, 0.5, 0.46)
    out.push({ key: 'k-flames', w, h, x: 0.72, z: 0.4, d: 0.2, tex: finish() })
  }
  {
    const w = 1.15, h = 0.5, { g, finish } = ink.panel(w, h)
    g.beginPath(); g.moveTo(0.03, 0.12); g.lineTo(0.4, 0.12); g.lineTo(0.44, 0.02); g.lineTo(0.72, 0.02); g.lineTo(0.76, 0.12); g.lineTo(1.12, 0.12); g.lineTo(1.12, h - 0.02); g.lineTo(0.03, h - 0.02); g.closePath()
    fill(g, lg(g, 0, 0, 0, h, [[0, '#FFF8EA'], [1, '#EFE8D6']]), 'rgba(60,40,10,.45)')
    g.fillStyle = C.claret; g.fillRect(0.03, 0.12, 1.09, 0.03)
    g.fillStyle = C.cloth; g.textBaseline = 'alphabetic'; g.font = `0.098px ${fam.gilda}`
    const n = wrapText(g, d.name, w / 2, 0.29, 1.0, 0.108, 2, true)
    g.fillStyle = C.claret; g.font = `0.062px ${fam.hanken}`; g.textAlign = 'center'; g.fillText(d.category, w / 2, 0.29 + n * 0.108 + 0.01)
    out.push({ key: 'k-name', w, h, x: 2.1, z: 0.36, d: 0.3, tex: finish() })
  }
  return out
}

/* ------------------------------ everything ------------------------------ */
export function buildAssets(data: BookData, fam: Fam, scale: number): Assets {
  const ink = new Ink(scale)
  const ds = data.dishes.slice(0, 3)
  const front = [coverArt(ink, fam, data.dishCount), ...ds.map((d, i) => rightPage(ink, 201 + i, [-1.12, -0.5, 0.36], [C.sage, C.candle, C.claret][i % 3]))]
  const back = ds.map((d, i) => dishLeft(ink, fam, d, 100 + i))
  const spreads = ds.map((d) => dishSpread(ink, fam, d))
  const textures = [...front, ...back, ...spreads.flat().map((p) => p.tex)]
  return { front, back, spreads, textures }
}
function dishPaint(g: G, cx: number, base: number, kind: number, seed: number) {
  const r = rng(seed)
  g.fillStyle = 'rgba(40,20,10,.2)'; g.beginPath(); g.ellipse(cx + 0.01, base + 0.012, 0.29, 0.06, 0, 0, 7); g.fill()
  if (kind === 0) { // bowl of stew with steam
    g.beginPath(); g.moveTo(cx - 0.25, base - 0.2); g.quadraticCurveTo(cx - 0.22, base + 0.01, cx, base + 0.01); g.quadraticCurveTo(cx + 0.22, base + 0.01, cx + 0.25, base - 0.2); g.closePath(); fill(g, lg(g, cx - 0.25, 0, cx + 0.25, 0, [[0, '#a8334e'], [1, '#7C2236']]))
    g.beginPath(); g.ellipse(cx, base - 0.2, 0.25, 0.05, 0, 0, 7); fill(g, ['#D98A2B', '#C7662B', '#B8923A'][seed % 3])
    for (let i = 0; i < 9; i++) { g.fillStyle = r() < 0.5 ? '#6c9a7f' : '#F1EEE6'; g.beginPath(); g.arc(cx - 0.18 + r() * 0.36, base - 0.2 + (r() - 0.5) * 0.04, 0.016 + r() * 0.015, 0, 7); g.fill() }
    g.strokeStyle = 'rgba(241,238,230,.7)'; g.lineWidth = 0.014; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(cx - 0.1 + i * 0.1, base - 0.26); g.bezierCurveTo(cx - 0.16 + i * 0.1, base - 0.32, cx - 0.04 + i * 0.1, base - 0.36, cx - 0.1 + i * 0.1, base - 0.42); g.stroke() }
  } else if (kind === 1) { // plated nest of pasta
    g.beginPath(); g.ellipse(cx, base - 0.03, 0.29, 0.06, 0, 0, 7); fill(g, C.wax)
    g.beginPath(); g.ellipse(cx, base - 0.04, 0.2, 0.04, 0, 0, 7); fill(g, '#E7ECE2', 'rgba(60,90,70,.4)')
    g.beginPath(); g.moveTo(cx - 0.17, base - 0.05); g.quadraticCurveTo(cx - 0.16, base - 0.24, cx, base - 0.24); g.quadraticCurveTo(cx + 0.16, base - 0.24, cx + 0.17, base - 0.05); g.closePath(); fill(g, '#F2C56A')
    g.strokeStyle = 'rgba(160,100,20,.45)'; g.lineWidth = 0.01; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(cx - 0.15, base - 0.07 - i * 0.03); g.quadraticCurveTo(cx, base - 0.1 - i * 0.03, cx + 0.15, base - 0.07 - i * 0.03); g.stroke() }
    for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(cx - 0.1 + r() * 0.2, base - 0.22 + r() * 0.05, 0.03, 0.015, r() * 3, 0, 7); fill(g, '#5d8a72', '') }
    g.fillStyle = C.claret; g.beginPath(); g.arc(cx + 0.06, base - 0.25, 0.018, 0, 7); g.fill()
  } else { // a pie
    g.beginPath(); g.ellipse(cx, base - 0.03, 0.29, 0.06, 0, 0, 7); fill(g, C.sage)
    g.beginPath(); g.moveTo(cx - 0.24, base - 0.14); g.lineTo(cx - 0.21, base - 0.03); g.quadraticCurveTo(cx, base + 0.03, cx + 0.21, base - 0.03); g.lineTo(cx + 0.24, base - 0.14); g.closePath(); fill(g, '#C98A3E')
    g.beginPath(); g.ellipse(cx, base - 0.14, 0.24, 0.055, 0, 0, 7); fill(g, '#E2A957')
    g.strokeStyle = 'rgba(120,70,20,.55)'; g.lineWidth = 0.012; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(cx + i * 0.07 - 0.04, base - 0.18); g.lineTo(cx + i * 0.07 + 0.04, base - 0.1); g.stroke() }
    g.fillStyle = C.claret; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(cx - 0.1 + i * 0.1, base - 0.15, 0.014, 0, 7); g.fill() }
  }
}
