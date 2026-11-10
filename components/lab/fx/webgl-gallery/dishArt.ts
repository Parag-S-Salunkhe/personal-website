export type DishArt = { name: string; category: string; rating: number }

function hash(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) } return h >>> 0 }
function rng(seed: number) { let a = seed; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }

function star(c: CanvasRenderingContext2D, x: number, y: number, r: number, fill: boolean) {
  c.beginPath()
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5; const rr = i % 2 ? r * 0.42 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) }
  c.closePath()
  c.fillStyle = fill ? '#F6B94F' : 'rgba(23,53,42,.18)'
  c.fill()
}

/** Draws a menu card (Table palette): category, dish name, a plate, rating stars. 512x768. */
export function drawDishCard(d: DishArt): HTMLCanvasElement {
  const W = 512, H = 768
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H
  const c = cv.getContext('2d')!
  const rand = rng(hash(d.name))
  c.fillStyle = '#F1EEE6'; c.fillRect(0, 0, W, H)
  // linen weave
  c.globalAlpha = 0.05; c.fillStyle = '#17352A'
  for (let y = 0; y < H; y += 4) c.fillRect(0, y, W, 1)
  for (let x = 0; x < W; x += 4) c.fillRect(x, 0, 1, H)
  c.globalAlpha = 1
  c.strokeStyle = '#7C2236'; c.lineWidth = 6; c.strokeRect(22, 22, W - 44, H - 44)
  c.strokeStyle = '#F6B94F'; c.lineWidth = 2; c.strokeRect(34, 34, W - 68, H - 68)
  c.textAlign = 'center'; c.fillStyle = '#7C2236'
  c.font = 'italic 26px Georgia, serif'
  c.fillText(d.category, W / 2, 92)
  // name, wrapped
  c.fillStyle = '#17352A'; c.font = '44px Georgia, serif'
  const words = d.name.split(' '); const lines: string[] = []; let cur = ''
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (c.measureText(t).width > W - 120 && cur) { lines.push(cur); cur = w } else cur = t }
  if (cur) lines.push(cur)
  lines.slice(0, 3).forEach((l, i) => c.fillText(l, W / 2, 154 + i * 52))
  // plate
  const px = W / 2, py = 470, pr = 150
  c.fillStyle = 'rgba(23,53,42,.22)'; c.beginPath(); c.ellipse(px + 6, py + 12, pr + 6, pr + 4, 0, 0, 7); c.fill()
  const rim = c.createRadialGradient(px - 40, py - 50, 20, px, py, pr)
  rim.addColorStop(0, '#FFF8EA'); rim.addColorStop(1, '#d9d4c6')
  c.fillStyle = rim; c.beginPath(); c.arc(px, py, pr, 0, 7); c.fill()
  c.strokeStyle = '#A9C3AE'; c.lineWidth = 5; c.beginPath(); c.arc(px, py, pr - 14, 0, 7); c.stroke()
  c.fillStyle = '#efeadc'; c.beginPath(); c.arc(px, py, pr - 44, 0, 7); c.fill()
  const food = ['#C8622B', '#7C2236', '#A9C3AE', '#F6B94F', '#8a5a2b', '#5b8a4e']
  for (let i = 0; i < 9; i++) {
    const a = rand() * 6.28, r = rand() * (pr - 90)
    c.fillStyle = food[Math.floor(rand() * food.length)]
    c.beginPath(); c.ellipse(px + Math.cos(a) * r, py + Math.sin(a) * r, 16 + rand() * 24, 12 + rand() * 18, rand() * 3, 0, 7); c.fill()
  }
  c.fillStyle = '#5b8a4e'
  for (let i = 0; i < 6; i++) { const a = rand() * 6.28, r = rand() * 60; c.beginPath(); c.ellipse(px + Math.cos(a) * r, py + Math.sin(a) * r, 5, 11, a, 0, 7); c.fill() }
  // stars
  const n = Math.max(0, Math.min(5, Math.round(d.rating)))
  for (let i = 0; i < 5; i++) star(c, W / 2 + (i - 2) * 46, 690, 18, i < n)
  return cv
}
