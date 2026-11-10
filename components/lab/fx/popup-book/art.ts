import * as THREE from 'three'
import { C, grain, hash, mk, rng, toTex, type Fam } from './paper'

export type BookData = {
  poster: string | null
  movies: { title: string; rating: number; date: string }[]
  dishes: { name: string; category: string; rating: number; ingredients: string[] }[]
  dishCount: number
}
export type PanelSpec = { key: string; w: number; h: number; x: number; z: number; d: number; tex: THREE.Texture; glow?: THREE.Texture; yaw?: number; kind?: 'tab' }
export type Assets = {
  front: THREE.Texture[]; back: THREE.Texture[]; spreads: PanelSpec[][]
  pocket: THREE.Texture; slider: THREE.Texture; sliderGlow: THREE.Texture | null; textures: THREE.Texture[]
}

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

/* ------------------------------ cover and pockets ------------------------------ */
function coverArt(ink: Ink, fam: Fam) {
  const w = PW + 0.08, h = PH + 0.08
  const { c, g } = ink.panel(w, h)
  g.fillStyle = lg(g, 0, 0, w, h, [[0, '#8a2740'], [1, '#6b1b2e']]); g.fillRect(0, 0, w, h)
  g.lineWidth = 0.004
  for (let x = 0; x < w; x += 0.02) { g.strokeStyle = 'rgba(0,0,0,.09)'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke() }
  for (let y = 0; y < h; y += 0.02) { g.strokeStyle = 'rgba(255,230,230,.05)'; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke() }
  g.strokeStyle = C.candle; g.lineWidth = 0.022; rrect(g, 0.16, 0.16, w - 0.32, h - 0.32, 0.06); g.stroke()
  g.lineWidth = 0.008; rrect(g, 0.23, 0.23, w - 0.46, h - 0.46, 0.04); g.stroke()
  // table emblem: a round table with eight places
  const ex = w / 2, ey = 0.52
  g.fillStyle = C.candle; g.beginPath(); g.arc(ex, ey, 0.1, 0, 7); g.fill()
  for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.283; g.beginPath(); g.arc(ex + Math.cos(a) * 0.2, ey + Math.sin(a) * 0.2, 0.034, 0, 7); g.fill() }
  g.fillStyle = C.wax; g.textAlign = 'center'; g.textBaseline = 'alphabetic'
  g.font = `0.36px ${fam.gilda}`
  g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 0.03; g.shadowOffsetY = 0.012
  g.fillText('Supper is', ex, 1.02); g.fillText('at eight.', ex, 1.38)
  g.shadowColor = 'transparent'
  g.fillStyle = C.sage; g.font = `0.095px ${fam.hanken}`
  g.fillText('Come hungry. Stay late.', ex, 1.52)
  return { tex: (grain(g, c.width, c.height), toTex(c)) }
}
function pocketArt(ink: Ink, fam: Fam) {
  const w = 2.0, h = 0.74
  const { c, g } = ink.panel(w, h)
  g.beginPath(); g.moveTo(0.04, 0.02); g.lineTo(w, 0.02); g.lineTo(w, h - 0.02); g.lineTo(0.04, h - 0.02); g.quadraticCurveTo(0, h / 2, 0.04, 0.02); g.closePath()
  fill(g, lg(g, 0, 0, w, h, [[0, '#a8334e'], [1, '#8a2740']]), 'rgba(20,6,10,.5)')
  g.setLineDash([0.05, 0.04]); g.strokeStyle = C.candle; g.lineWidth = 0.012; rrect(g, 0.12, 0.1, w - 0.2, h - 0.2, 0.03); g.stroke(); g.setLineDash([])
  g.fillStyle = C.wax; g.font = `0.2px ${fam.pinyon}`; g.textAlign = 'center'; g.fillText('a seat for you', 1.05, 0.43)
  g.fillStyle = C.sage; g.font = `0.07px ${fam.hanken}`; g.fillText('pull the tab, ease it out', 1.05, 0.6)
  return { tex: (grain(g, c.width, c.height), toTex(c)) }
}
function sliderArt(ink: Ink, fam: Fam) {
  const w = 2.8, h = 0.7
  const { c, g } = ink.panel(w, h)
  // card
  g.beginPath(); g.rect(0, 0.02, 1.5, 0.66); fill(g, C.wax)
  g.strokeStyle = '#B88A44'; g.lineWidth = 0.008; rrect(g, 0.07, 0.09, 1.36, 0.52, 0.02); g.stroke()
  g.fillStyle = C.claret; g.textAlign = 'center'; g.font = `0.26px ${fam.pinyon}`; g.fillText('Your seat', 0.85, 0.37)
  g.fillStyle = C.cloth; g.font = `0.075px ${fam.hanken}`; g.fillText('Eight chairs. One is yours.', 0.85, 0.52)
  // strap and tab
  g.beginPath(); g.rect(1.5, 0.27, 0.9, 0.16); fill(g, '#E8D9A8')
  g.beginPath(); g.moveTo(2.34, 0.08); g.lineTo(2.62, 0.08); g.quadraticCurveTo(2.8, 0.08, 2.8, 0.35); g.quadraticCurveTo(2.8, 0.62, 2.62, 0.62); g.lineTo(2.34, 0.62); g.closePath()
  fill(g, C.candle, 'rgba(60,30,5,.5)')
  g.fillStyle = C.claret; g.font = `700 0.09px ${fam.hanken}`; g.textAlign = 'center'; g.fillText('pull', 2.58, 0.37)
  g.fillRect(2.45, 0.43, 0.26, 0.012)
  return { tex: (grain(g, c.width, c.height), toTex(c)) }
}

/* ------------------------------ flat pages ------------------------------ */
function pageBase(g: G, w: number, h: number, side: 'left' | 'right', seed: number) {
  g.fillStyle = lg(g, 0, 0, w, 0, side === 'right' ? [[0, '#e6e1d3'], [0.08, '#F1EEE6'], [1, '#F4F1EA']] : [[0, '#F4F1EA'], [0.92, '#F1EEE6'], [1, '#e6e1d3']])
  g.fillRect(0, 0, w, h)
  const r = rng(seed)
  for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(150,120,70,${0.015 + r() * 0.02})`; g.beginPath(); g.ellipse(r() * w, r() * h, 0.2 + r() * 0.5, 0.1 + r() * 0.3, r() * 3, 0, 7); g.fill() }
  // gutter crease
  const gx = side === 'right' ? 0 : w
  g.fillStyle = lg(g, gx, 0, gx + (side === 'right' ? 0.35 : -0.35), 0, [[0, 'rgba(70,40,20,.3)'], [1, 'rgba(70,40,20,0)']]); g.fillRect(side === 'right' ? 0 : w - 0.35, 0, 0.35, h)
  g.strokeStyle = 'rgba(60,40,20,.13)'; g.lineWidth = 0.006; g.beginPath(); g.moveTo(side === 'right' ? 0.012 : w - 0.012, 0); g.lineTo(side === 'right' ? 0.012 : w - 0.012, h); g.stroke()
  g.strokeStyle = 'rgba(184,138,68,.5)'; g.lineWidth = 0.007; rrect(g, 0.14, 0.14, w - 0.28, h - 0.28, 0.03); g.stroke()
}
/** Stage mark on a right-hand page: soft floor shadow and dotted fold guides, under the pop-ups. */
function stageFloor(g: G, w: number, h: number, hinges: number[], accent: string) {
  g.strokeStyle = 'rgba(60,40,20,.28)'; g.lineWidth = 0.008; g.setLineDash([0.03, 0.05])
  for (const z of hinges) { const y = (z + PH / 2) / PH * h; g.beginPath(); g.moveTo(0.3, y); g.lineTo(w - 0.3, y); g.stroke() }
  g.setLineDash([])
  g.fillStyle = accent; g.globalAlpha = 0.1; g.beginPath(); g.ellipse(w / 2, h * 0.5, w * 0.4, h * 0.36, 0, 0, 7); g.fill(); g.globalAlpha = 1
}
function leftPage(ink: Ink, fam: Fam, seed: number, o: { no: number; title: string; lines?: string[]; list?: { a: string; b: string }[]; note?: string; script?: string }) {
  const { c, g } = ink.panel(PW, PH)
  pageBase(g, PW, PH, 'left', seed)
  g.textBaseline = 'alphabetic'; g.textAlign = 'left'
  let y = 0.5
  if (o.script) { g.fillStyle = C.claret; g.font = `0.26px ${fam.pinyon}`; g.fillText(o.script, 0.38, y); y += 0.31 }
  g.fillStyle = C.cloth; g.font = `0.25px ${fam.gilda}`
  const n = wrapText(g, o.title, 0.38, y, PW - 0.95, 0.28, 2)
  y += (n - 1) * 0.28 + 0.14
  g.strokeStyle = C.claret; g.lineWidth = 0.012; g.beginPath(); g.moveTo(0.4, y); g.lineTo(1.1, y); g.stroke()
  y += 0.25
  g.fillStyle = '#2a3a32'; g.font = `0.1px ${fam.hanken}`
  for (const l of o.lines ?? []) { const k = wrapText(g, l, 0.4, y, PW - 0.98, 0.14, 3); y += k * 0.14 + 0.06 }
  for (const it of (o.list ?? []).slice(0, 3)) {
    g.fillStyle = C.cloth; g.font = `0.125px ${fam.gilda}`; g.textAlign = 'left'; wrapText(g, it.a, 0.4, y, PW - 1.5, 0.15, 1)
    g.fillStyle = C.claret; g.font = `0.095px ${fam.hanken}`; g.textAlign = 'right'; g.fillText(it.b, PW - 0.42, y); y += 0.2
    g.strokeStyle = 'rgba(23,53,42,.14)'; g.lineWidth = 0.004; g.beginPath(); g.moveTo(0.4, y - 0.125); g.lineTo(PW - 0.42, y - 0.125); g.stroke()
  }
  if (o.note) { g.textAlign = 'left'; g.fillStyle = C.claret; g.font = `0.2px ${fam.pinyon}`; g.fillText(o.note, 0.4, PH - 0.3) }
  g.fillStyle = 'rgba(23,53,42,.55)'; g.font = `0.09px ${fam.hanken}`; g.textAlign = 'left'; g.fillText(String(o.no), 0.3, PH - 0.22)
  grain(g, c.width, c.height, 0.9)
  return toTex(c)
}
function rightPage(ink: Ink, seed: number, hinges: number[], accent: string, no: number, fam: Fam) {
  const { c, g } = ink.panel(PW, PH)
  pageBase(g, PW, PH, 'right', seed)
  stageFloor(g, PW, PH, hinges, accent)
  g.fillStyle = 'rgba(23,53,42,.55)'; g.font = `0.09px ${fam.hanken}`; g.textAlign = 'right'; g.fillText(String(no), PW - 0.3, PH - 0.22)
  grain(g, c.width, c.height, 0.9)
  return toTex(c)
}

/* ------------------------------ spread 1: the house ------------------------------ */
function houseSpread(ink: Ink): PanelSpec[] {
  const out: PanelSpec[] = []
  {
    const w = 2.8, h = 1.5, { c, g, finish } = ink.panel(w, h), r = rng(11)
    g.beginPath(); scallops(g, w, 0.3, 9, 0.22, r); g.lineTo(w, h); g.lineTo(0, h); g.closePath()
    fill(g, lg(g, 0, 0, 0, h, [[0, '#0f2a21'], [1, '#1d4538']]))
    for (let i = 0; i < 46; i++) { g.fillStyle = r() < 0.3 ? C.candle : C.wax; g.globalAlpha = 0.5 + r() * 0.5; g.beginPath(); g.arc(0.1 + r() * (w - 0.2), 0.3 + r() * 0.55, 0.008 + r() * 0.012, 0, 7); g.fill() }
    g.globalAlpha = 1
    g.fillStyle = 'rgba(246,185,79,.18)'; g.beginPath(); g.arc(2.25, 0.52, 0.26, 0, 7); g.fill()
    g.beginPath(); g.arc(2.25, 0.52, 0.15, 0, 7); fill(g, C.wax)
    g.beginPath(); g.arc(2.3, 0.49, 0.13, 0, 7); g.fillStyle = 'rgba(241,238,230,.0)'; g.fill()
    for (let i = 0; i < 12; i++) { const x = i * (w / 11); g.beginPath(); g.arc(x, h - 0.2 + Math.sin(i * 1.7) * 0.05, 0.22, 0, 7); fill(g, i % 2 ? '#4c7761' : '#5d8a72') }
    g.fillStyle = '#4c7761'; g.fillRect(0, h - 0.2, w, 0.2)
    out.push({ key: 'h-sky', w, h, x: 1.5, z: -1.12, d: 0, tex: finish() })
    void c
  }
  {
    const w = 2.0, h = 1.45, { g, finish } = ink.panel(w, h), gl = ink.glow(w, h)
    g.beginPath(); g.rect(1.42, 0.06, 0.22, 0.5); fill(g, '#5e1a2a')
    g.beginPath(); g.moveTo(0.0, 0.6); g.lineTo(1.0, 0.02); g.lineTo(2.0, 0.6); g.closePath(); fill(g, lg(g, 0, 0, w, 0.6, [[0, '#8a2740'], [1, '#6b1b2e']]))
    g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 0.01; for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(0.14 * i * 1.1 + 0.05, 0.6 - i * 0.02); g.lineTo(1.0, 0.04 + i * 0.07); g.stroke() }
    g.beginPath(); g.rect(0.1, 0.58, 1.8, 0.87); fill(g, lg(g, 0, 0, 0, h, [[0, '#F4F1EA'], [1, '#DDD7C7']]))
    const win = (x: number, y: number, ww: number, hh: number, who: number) => {
      g.beginPath(); g.rect(x - 0.03, y - 0.03, ww + 0.06, hh + 0.06); fill(g, C.claret)
      g.beginPath(); g.rect(x, y, ww, hh); fill(g, lg(g, 0, y, 0, y + hh, [[0, '#ffd27a'], [1, '#f6b94f']]))
      if (who) { g.fillStyle = 'rgba(95,40,20,.75)'; g.beginPath(); g.arc(x + ww * 0.5, y + hh * 0.5, 0.05, 0, 7); g.fill(); g.beginPath(); g.ellipse(x + ww * 0.5, y + hh * 0.9, 0.1, 0.1, 0, Math.PI, 0); g.fill() }
      g.strokeStyle = C.wax; g.lineWidth = 0.014; g.beginPath(); g.moveTo(x + ww / 2, y); g.lineTo(x + ww / 2, y + hh); g.moveTo(x, y + hh * 0.5); g.lineTo(x + ww, y + hh * 0.5); g.stroke()
      gl.g.fillStyle = '#ffa63d'; gl.g.fillRect(x, y, ww, hh); gl.g.strokeStyle = '#000'; gl.g.lineWidth = 0.014; gl.g.beginPath(); gl.g.moveTo(x + ww / 2, y); gl.g.lineTo(x + ww / 2, y + hh); gl.g.moveTo(x, y + hh * 0.5); gl.g.lineTo(x + ww, y + hh * 0.5); gl.g.stroke()
    }
    win(0.28, 0.74, 0.34, 0.4, 1); win(1.38, 0.74, 0.34, 0.4, 0); win(0.28, 1.0 + 0.2 - 0.02, 0.3, 0.17, 0)
    g.beginPath(); g.arc(1.0, 0.33, 0.1, 0, 7); fill(g, C.candle); gl.g.fillStyle = '#ffa63d'; gl.g.beginPath(); gl.g.arc(1.0, 0.33, 0.1, 0, 7); gl.g.fill()
    g.beginPath(); g.moveTo(0.82, 1.45); g.lineTo(0.82, 1.12); g.arc(1.0, 1.12, 0.18, Math.PI, 0); g.lineTo(1.18, 1.45); g.closePath(); fill(g, C.claret)
    g.fillStyle = C.candle; g.beginPath(); g.arc(1.12, 1.3, 0.017, 0, 7); g.fill()
    g.fillStyle = 'rgba(169,195,174,.9)'; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(1.7 + (i % 3) * 0.05, 1.0 + Math.floor(i / 3) * 0.1 + (i % 2) * 0.02, 0.035, 0, 7); g.fill() }
    out.push({ key: 'h-house', w, h, x: 1.5, z: -0.7, d: 0.07, tex: finish(), glow: gl.tex() })
  }
  {
    const w = 2.7, h = 0.55, { g, finish } = ink.panel(w, h), gl = ink.glow(w, h), r = rng(5)
    g.beginPath(); g.moveTo(0, h); for (let i = 0; i <= 14; i++) { g.lineTo(i * (w / 14), 0.22 + Math.sin(i * 1.3) * 0.05); g.quadraticCurveTo(i * (w / 14) + w / 28, 0.1 + r() * 0.1, (i + 1) * (w / 14), 0.22 + Math.sin((i + 1) * 1.3) * 0.05) } g.lineTo(w, h); g.closePath()
    fill(g, lg(g, 0, 0, 0, h, [[0, '#6c9a7f'], [1, '#4c7761']]))
    for (let i = 0; i < 26; i++) { const x = 0.05 + r() * (w - 0.1), y = 0.2 + r() * 0.25; g.fillStyle = C.candle; g.beginPath(); g.arc(x, y, 0.014, 0, 7); g.fill(); gl.g.fillStyle = '#ffb34d'; gl.g.beginPath(); gl.g.arc(x, y, 0.02, 0, 7); gl.g.fill() }
    for (const lx of [0.22, 2.48]) {
      g.beginPath(); g.rect(lx - 0.012, 0.0, 0.024, 0.4); fill(g, '#2a3a32')
      g.beginPath(); g.moveTo(lx - 0.07, 0.1); g.lineTo(lx + 0.07, 0.1); g.lineTo(lx + 0.05, 0.0); g.lineTo(lx - 0.05, 0.0); g.closePath(); fill(g, C.candle)
      gl.g.fillStyle = '#ffb34d'; gl.g.fillRect(lx - 0.055, 0.005, 0.11, 0.09)
    }
    out.push({ key: 'h-hedge', w, h, x: 1.5, z: 0.5, d: 0.14, tex: finish(), glow: gl.tex() })
  }
  return out
}

/* ------------------------------ spread 2: the table ------------------------------ */
function chairBack(g: G, cx: number, top: number, w: number, h: number, col: string, dark: string, front: boolean) {
  g.beginPath(); g.rect(cx - w / 2 + 0.02, top + h * 0.7, 0.045, 0.6); fill(g, dark)
  g.beginPath(); g.rect(cx + w / 2 - 0.065, top + h * 0.7, 0.045, 0.6); fill(g, dark)
  g.beginPath(); g.roundRect(cx - w / 2, top, w, h, 0.06); fill(g, col)
  g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 0.008
  if (front) { g.beginPath(); g.roundRect(cx - w / 2 + 0.05, top + 0.05, w - 0.1, h - 0.1, 0.04); g.stroke() }
  else { for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(cx - w / 2 + (w * i) / 4, top + 0.04); g.lineTo(cx - w / 2 + (w * i) / 4, top + h - 0.04); g.stroke() } }
  g.fillStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.roundRect(cx - w / 2 + 0.03, top + 0.03, w - 0.06, 0.04, 0.02); g.fill()
}
function tableSpread(ink: Ink): PanelSpec[] {
  const out: PanelSpec[] = []
  {
    const w = 2.8, h = 1.7, { g, finish } = ink.panel(w, h), gl = ink.glow(w, h), r = rng(21)
    g.beginPath(); scallops(g, w, 0.26, 10, 0.2, r, 0.2); g.lineTo(w, h); g.lineTo(0, h); g.closePath()
    fill(g, '#1f4a3b')
    g.strokeStyle = 'rgba(255,255,255,.05)'; g.lineWidth = 0.06; for (let x = 0.1; x < w; x += 0.2) { g.beginPath(); g.moveTo(x, 0.3); g.lineTo(x, h); g.stroke() }
    g.beginPath(); g.moveTo(0.75, 1.1); g.lineTo(0.75, 0.62); g.arc(1.1, 0.62, 0.35, Math.PI, 0); g.lineTo(1.45, 1.1); g.closePath(); fill(g, lg(g, 0, 0.3, 0, 1.1, [[0, '#0d1f2b'], [1, '#2a4a5e']]), C.linen)
    for (let i = 0; i < 14; i++) { g.fillStyle = C.wax; g.beginPath(); g.arc(0.8 + r() * 0.6, 0.38 + r() * 0.5, 0.008, 0, 7); g.fill() }
    for (const [fx, fy] of [[1.9, 0.5], [2.3, 0.62]] as const) { g.beginPath(); g.rect(fx, fy, 0.3, 0.38); fill(g, '#B88A44'); g.beginPath(); g.rect(fx + 0.03, fy + 0.03, 0.24, 0.32); fill(g, C.sage); g.fillStyle = C.claret; g.beginPath(); g.arc(fx + 0.15, fy + 0.2, 0.06, 0, 7); g.fill() }
    for (const side of [0, 1]) {
      const x0 = side ? w - 0.5 : 0, dir = side ? -1 : 1
      g.beginPath(); g.moveTo(x0, 0.2); g.lineTo(x0 + dir * 0.5, 0.2); g.quadraticCurveTo(x0 + dir * 0.3, 0.9, x0 + dir * 0.5, h); g.lineTo(x0, h); g.closePath()
      fill(g, lg(g, x0, 0, x0 + dir * 0.5, 0, [[0, '#6b1b2e'], [0.5, '#93304a'], [1, '#7C2236']]))
      g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 0.01; for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(x0 + dir * i * 0.09, 0.24); g.quadraticCurveTo(x0 + dir * (i * 0.07), 0.9, x0 + dir * i * 0.09, h); g.stroke() }
    }
    g.strokeStyle = '#2a3a32'; g.lineWidth = 0.01; g.beginPath(); g.moveTo(1.9, 0.2); g.lineTo(1.9, 0.5); g.stroke()
    g.beginPath(); g.moveTo(1.9, 0.44); g.lineTo(1.72, 0.64); g.lineTo(2.08, 0.64); g.closePath(); fill(g, C.candle); gl.g.fillStyle = '#ffb34d'; gl.g.beginPath(); gl.g.moveTo(1.9, 0.44); gl.g.lineTo(1.72, 0.64); gl.g.lineTo(2.08, 0.64); gl.g.fill()
    out.push({ key: 't-wall', w, h, x: 1.5, z: -1.12, d: 0, tex: finish(), glow: gl.tex() })
  }
  {
    const w = 2.7, h = 1.3, { g, finish } = ink.panel(w, h)
    const cols = [C.claret, '#5d8a72', C.claret, '#5d8a72']
    for (let i = 0; i < 4; i++) chairBack(g, 0.4 + i * 0.63, 0.05, 0.44, 0.5, cols[i], '#4a1320', false)
    out.push({ key: 't-far', w, h, x: 1.5, z: -0.82, d: 0.06, tex: finish() })
  }
  {
    const w = 2.7, h = 1.0, { g, finish } = ink.panel(w, h)
    g.beginPath(); g.moveTo(0.4, 0.06); g.lineTo(2.3, 0.06); g.lineTo(2.62, 0.4); g.lineTo(0.08, 0.4); g.closePath(); fill(g, lg(g, 0, 0.06, 0, 0.4, [[0, '#FFF8EA'], [1, '#E9E3D3']]))
    g.beginPath(); g.moveTo(1.0, 0.06); g.lineTo(1.7, 0.06); g.lineTo(1.82, 0.4); g.lineTo(0.88, 0.4); g.closePath(); fill(g, 'rgba(169,195,174,.85)', '')
    g.beginPath(); g.moveTo(0.08, 0.4); g.lineTo(2.62, 0.4); g.lineTo(2.62, 0.9)
    const r = rng(3); for (let i = 0; i < 12; i++) g.quadraticCurveTo(2.62 - (i + 0.5) * (2.54 / 12), 0.98 - r() * 0.04, 2.62 - (i + 1) * (2.54 / 12), 0.9)
    g.lineTo(0.08, 0.4); g.closePath(); fill(g, lg(g, 0, 0.4, 0, 1, [[0, '#EDE8DA'], [1, '#D6CFBB']]))
    g.strokeStyle = 'rgba(80,60,30,.12)'; g.lineWidth = 0.012; for (let i = 1; i < 14; i++) { g.beginPath(); g.moveTo(0.08 + i * 0.18, 0.42); g.quadraticCurveTo(0.1 + i * 0.18, 0.7, 0.08 + i * 0.18, 0.95); g.stroke() }
    g.fillStyle = C.claret; g.fillRect(0.08, 0.5, 2.54, 0.045)
    const plate = (x: number, y: number, rx: number) => {
      g.fillStyle = 'rgba(40,20,10,.18)'; g.beginPath(); g.ellipse(x + 0.012, y + 0.014, rx, rx * 0.3, 0, 0, 7); g.fill()
      g.beginPath(); g.ellipse(x, y, rx, rx * 0.3, 0, 0, 7); fill(g, C.wax)
      g.beginPath(); g.ellipse(x, y, rx * 0.66, rx * 0.2, 0, 0, 7); fill(g, '#E7ECE2', 'rgba(60,90,70,.4)')
      g.beginPath(); g.ellipse(x, y - 0.004, rx * 0.3, rx * 0.09, 0, 0, 7); g.fillStyle = C.sage; g.fill()
    }
    for (let i = 0; i < 4; i++) plate(0.62 + i * 0.48, 0.16, 0.14)
    for (let i = 0; i < 4; i++) plate(0.4 + i * 0.6, 0.31, 0.17)
    for (let i = 0; i < 4; i++) { const x = 0.38 + i * 0.6 + 0.3; g.strokeStyle = 'rgba(120,150,170,.9)'; g.lineWidth = 0.008; g.beginPath(); g.ellipse(x, 0.2, 0.025, 0.012, 0, 0, 7); g.stroke(); g.beginPath(); g.moveTo(x, 0.21); g.lineTo(x, 0.26); g.stroke() }
    out.push({ key: 't-table', w, h, x: 1.5, z: -0.34, d: 0.13, tex: finish() })
  }
  {
    const w = 1.9, h = 0.95, { g, finish } = ink.panel(w, h), cols = ['#5d8a72', C.claret, '#5d8a72']
    for (let i = 0; i < 3; i++) chairBack(g, 0.36 + i * 0.62, 0.06, 0.5, 0.5, cols[i], '#2a3a32', true)
    out.push({ key: 't-near', w, h, x: 1.02, z: 0.2, d: 0.2, tex: finish() })
  }
  {
    const w = 0.56, h = 0.9, { g, finish } = ink.panel(w, h)
    chairBack(g, 0.28, 0.06, 0.5, 0.5, C.candle, '#8a5a1a', true)
    out.push({ key: 't-loose', w, h, x: 2.62, z: 0.26, d: 0.26, yaw: -0.5, tex: finish() })
  }
  return out
}

/* ------------------------------ spread 3: movie night ------------------------------ */
function paintPoster(g: G, img: HTMLImageElement | null, x: number, y: number, w: number, h: number, fam: Fam) {
  if (img) g.drawImage(img, x, y, w, h)
  else { g.fillStyle = C.claret; g.fillRect(x, y, w, h); g.fillStyle = C.wax; g.font = `${h * 0.12}px ${fam.gilda}`; g.textAlign = 'center'; g.fillText('tonight', x + w / 2, y + h / 2) }
}
function movieSpread(ink: Ink, fam: Fam, poster: HTMLImageElement | null): PanelSpec[] {
  const out: PanelSpec[] = []
  {
    const w = 2.8, h = 1.7, { g, finish } = ink.panel(w, h), gl = ink.glow(w, h), r = rng(31)
    g.beginPath(); scallops(g, w, 0.3, 12, 0.22, r, 0.1); g.lineTo(w, h); g.lineTo(0, h); g.closePath(); fill(g, lg(g, 0, 0, 0, h, [[0, '#17352A'], [1, '#10281F']]))
    const sx = 0.62, sy = 0.42, sw = 1.56, sh = 0.88
    g.beginPath(); g.roundRect(sx - 0.07, sy - 0.07, sw + 0.14, sh + 0.14, 0.03); fill(g, '#C99A3E')
    const paint = (gg: G) => {
      gg.save(); gg.beginPath(); gg.rect(sx, sy, sw, sh); gg.clip()
      if (poster) { gg.filter = 'blur(0.05px)'; gg.globalAlpha = 0.9; gg.drawImage(poster, sx, sy - sh * 0.4, sw, sw * 1.5); gg.filter = 'none'; gg.globalAlpha = 1; gg.fillStyle = 'rgba(20,10,5,.35)'; gg.fillRect(sx, sy, sw, sh) } else { gg.fillStyle = '#2b1b17'; gg.fillRect(sx, sy, sw, sh) }
      const pw = sh * (2 / 3)
      paintPoster(gg, poster, sx + (sw - pw) / 2, sy + 0.03, pw, sh - 0.06, fam)
      gg.restore()
    }
    paint(g); paint(gl.g)
    for (let i = 0; i < 14; i++) { g.fillStyle = C.candle; g.beginPath(); g.arc(sx - 0.07 + i * ((sw + 0.14) / 13), sy - 0.07, 0.014, 0, 7); g.fill() }
    for (const side of [0, 1]) {
      const x0 = side ? w : 0, dir = side ? -1 : 1
      g.beginPath(); g.moveTo(x0, 0.22); g.lineTo(x0 + dir * 0.5, 0.22); g.quadraticCurveTo(x0 + dir * 0.34, 0.9, x0 + dir * 0.5, h); g.lineTo(x0, h); g.closePath()
      fill(g, lg(g, x0, 0, x0 + dir * 0.5, 0, [[0, '#6b1b2e'], [0.5, '#9a3450'], [1, '#7C2236']]))
      g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = 0.01; for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(x0 + dir * i * 0.09, 0.26); g.quadraticCurveTo(x0 + dir * (i * 0.07), 0.9, x0 + dir * i * 0.09, h); g.stroke() }
    }
    out.push({ key: 'm-screen', w, h, x: 1.5, z: -1.12, d: 0, tex: finish(), glow: gl.tex() })
  }
  const heads = ['#F1EEE6', '#F6B94F', '#E9D3B4', '#A9C3AE']
  const rows = [
    { key: 'm-r1', w: 2.6, h: 0.72, z: -0.6, n: 5, cw: 0.38, col: ['#5d8a72', C.claret], d: 0.08, seed: 41 },
    { key: 'm-r2', w: 2.7, h: 0.66, z: -0.1, n: 5, cw: 0.44, col: [C.claret, '#5d8a72'], d: 0.15, seed: 42 },
    { key: 'm-r3', w: 2.8, h: 0.6, z: 0.5, n: 4, cw: 0.55, col: ['#5d8a72', C.claret], d: 0.22, seed: 43 },
  ]
  for (const R of rows) {
    const { g, finish } = ink.panel(R.w, R.h), r = rng(R.seed)
    for (let i = 0; i < R.n; i++) {
      const cx = (R.w / R.n) * (i + 0.5), col = R.col[i % 2], seatTop = 0.16
      if (r() < 0.6) { g.beginPath(); g.arc(cx + (r() - 0.5) * 0.05, seatTop - 0.02, R.cw * 0.2, 0, 7); fill(g, heads[Math.floor(r() * 4)]); g.beginPath(); g.ellipse(cx, seatTop + 0.1, R.cw * 0.3, 0.07, 0, Math.PI, 0); fill(g, heads[Math.floor(r() * 4)]) }
      g.beginPath(); g.roundRect(cx - R.cw / 2, seatTop + 0.06, R.cw, R.h - seatTop - 0.06, 0.05); fill(g, col)
      g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(cx - R.cw / 2 + 0.03, seatTop + 0.09, R.cw - 0.06, 0.012)
      g.beginPath(); g.roundRect(cx - R.cw / 2 - 0.04, seatTop + 0.2, 0.06, R.h - seatTop - 0.2, 0.02); fill(g, col)
      g.beginPath(); g.roundRect(cx + R.cw / 2 - 0.02, seatTop + 0.2, 0.06, R.h - seatTop - 0.2, 0.02); fill(g, col)
    }
    out.push({ key: R.key, w: R.w, h: R.h, x: 1.5, z: R.z, d: R.d, tex: finish() })
  }
  return out
}

/* ------------------------------ spread 4: the kitchen ------------------------------ */
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
function kitchenSpread(ink: Ink, fam: Fam, dishes: BookData['dishes']): PanelSpec[] {
  const out: PanelSpec[] = []
  {
    const w = 2.8, h = 1.7, { g, finish } = ink.panel(w, h), r = rng(51)
    g.beginPath(); scallops(g, w, 0.28, 8, 0.2, r, 0.15); g.lineTo(w, h); g.lineTo(0, h); g.closePath(); fill(g, '#B7CDBB')
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
  const list = dishes.slice(0, 3)
  const xs = [0.6, 1.5, 2.4]
  {
    const w = 2.8, h = 1.15, { g, finish } = ink.panel(w, h)
    list.forEach((d, i) => { g.save(); g.translate(xs[i] - 0.1, 0.66); g.scale(1.4, 1.4); dishPaint(g, 0, 0, i % 3, hash(d.name)); g.restore() })
    g.beginPath(); g.rect(0.0, 0.66, w, 0.08); fill(g, '#F4F1EA')
    g.beginPath(); g.rect(0.04, 0.74, w - 0.08, h - 0.74); fill(g, lg(g, 0, 0.5, 0, h, [[0, '#8a2740'], [1, '#6b1b2e']]))
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 0.01
    for (let i = 0; i < 4; i++) { g.beginPath(); g.roundRect(0.12 + i * 0.66, 0.82, 0.58, 0.26, 0.02); g.stroke(); g.fillStyle = C.candle; g.beginPath(); g.arc(0.4 + i * 0.66, 0.95, 0.017, 0, 7); g.fill() }
    out.push({ key: 'k-counter', w, h, x: 1.5, z: -0.5, d: 0.1, tex: finish() })
  }
  list.forEach((d, i) => {
    const w = 0.8, h = 0.46, { g, finish } = ink.panel(w, h)
    g.beginPath(); g.moveTo(0.03, 0.12); g.lineTo(0.28, 0.12); g.lineTo(0.32, 0.02); g.lineTo(0.48, 0.02); g.lineTo(0.52, 0.12); g.lineTo(0.77, 0.12); g.lineTo(0.77, h - 0.02); g.lineTo(0.03, h - 0.02); g.closePath()
    fill(g, lg(g, 0, 0, 0, h, [[0, '#FFF8EA'], [1, '#EFE8D6']]), 'rgba(60,40,10,.45)')
    g.fillStyle = C.claret; g.fillRect(0.03, 0.12, 0.74, 0.03)
    g.fillStyle = C.cloth; g.textBaseline = 'alphabetic'; g.font = `0.098px ${fam.gilda}`
    const n = wrapText(g, d.name, w / 2, 0.29, 0.66, 0.108, 2, true)
    g.fillStyle = C.claret; g.font = `0.062px ${fam.hanken}`; g.textAlign = 'center'; g.fillText(`${d.category} · ${d.rating}/5`, w / 2, 0.29 + n * 0.108 + 0.01)
    out.push({ key: `k-tab${i}`, w, h, x: xs[i], z: 0.34, d: 0.2 + i * 0.09, tex: finish(), kind: 'tab' })
  })
  return out
}

/* ------------------------------ everything ------------------------------ */
export function buildAssets(data: BookData, fam: Fam, poster: HTMLImageElement | null, scale: number): Assets {
  const ink = new Ink(scale)
  const m = data.movies, d = data.dishes
  const lp = (n: number, title: string, o: Omit<Parameters<typeof leftPage>[3], 'no' | 'title'>) => leftPage(ink, fam, 100 + n, { no: n * 2, title, ...o })
  const cover = coverArt(ink, fam)
  const front = [
    cover.tex,
    rightPage(ink, 201, [-1.12, -0.7, 0.5], C.sage, 1, fam),
    rightPage(ink, 202, [-1.12, -0.82, -0.34, 0.34, 0.46], C.candle, 3, fam),
    rightPage(ink, 203, [-1.12, -0.6, -0.1, 0.5], C.claret, 5, fam),
    rightPage(ink, 204, [-1.12, -0.5, 0.52], C.sage, 7, fam),
  ]
  const back = [
    lp(1, 'Come in', { script: 'Welcome,', lines: ['The house is warm and the lights are on from six. Wipe your feet, hand over a bottle, and find your name.'], note: 'Supper is at eight.' }),
    lp(2, 'Eight chairs', { script: 'The table', lines: ['Linen on the table, a candle for every two people, one chair pulled out for whoever is running late.', `${data.dishCount} dishes have gone out of this kitchen so far.`] }),
    lp(3, m[0] ? m[0].title : 'Movie night', { script: 'Tonight', list: m.slice(0, 4).map((x) => ({ a: x.title, b: `${x.rating}/5` })) }),
    lp(4, d[0] ? d[0].name : 'The kitchen', { script: 'From the stove', lines: d[0] ? [`${d[0].category}, rated ${d[0].rating} out of 5. What went in:`, d[0].ingredients.slice(0, 6).join(', ') || 'Whatever was in the cupboard.'] : ['Whatever was in the cupboard.'], note: 'Seconds are encouraged.' }),
    leftPage(ink, fam, 109, { no: 10, title: 'The end', lines: ['Thanks for coming. The washing up can wait.'] }),
  ]
  const spreads = [houseSpread(ink), tableSpread(ink), movieSpread(ink, fam, poster), kitchenSpread(ink, fam, d)]
  const pocket = pocketArt(ink, fam).tex, slider = sliderArt(ink, fam).tex
  const textures = [...front, ...back, pocket, slider, ...spreads.flat().flatMap((p) => (p.glow ? [p.tex, p.glow] : [p.tex]))]
  return { front, back, spreads, pocket, slider, sliderGlow: null, textures }
}
