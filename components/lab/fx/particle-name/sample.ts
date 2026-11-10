import { mulberry32 } from './rng'

export interface Sampled {
  /** interleaved x,y in world units, centred on 0,0, sorted left to right */
  xy: Float32Array
  /** mean gap between neighbouring points, world units */
  spacing: number
}

/**
 * Draw `lines` to an offscreen 2D canvas in the page display font, then pick `n` points that fall inside the glyphs
 * (jittered grid so the letters fill evenly). Scaled to fit maxW x maxH world units.
 */
export function sampleWord(lines: string[], family: string, n: number, maxW: number, maxH: number, seed: number): Sampled {
  const FS = 260
  const c = document.createElement('canvas')
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  const font = `900 ${FS}px ${family}`
  ctx.font = font
  const widths = lines.map((l) => ctx.measureText(l).width)
  const capH = ctx.measureText('H').actualBoundingBoxAscent || FS * 0.7
  const gap = capH * 0.16
  const textW = Math.max(...widths)
  const textH = lines.length * capH + (lines.length - 1) * gap
  const pad = 6
  c.width = Math.ceil(textW + pad * 2)
  c.height = Math.ceil(textH + pad * 2)
  ctx.font = font
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#fff'
  lines.forEach((l, i) => ctx.fillText(l, c.width / 2, pad + capH * (i + 1) + gap * i))
  const W = c.width, H = c.height
  const data = ctx.getImageData(0, 0, W, H).data
  const solid = (x: number, y: number) => {
    const xi = Math.round(x), yi = Math.round(y)
    return xi >= 0 && yi >= 0 && xi < W && yi < H && data[(yi * W + xi) * 4 + 3] > 128
  }
  let area = 0
  for (let i = 3; i < data.length; i += 4) if (data[i] > 128) area++
  const rnd = mulberry32(seed)
  const step = Math.sqrt(area / n)
  const pts: number[] = []
  for (let gy = step / 2; gy < H; gy += step) {
    for (let gx = step / 2; gx < W; gx += step) {
      const x = gx + (rnd() - 0.5) * step * 0.8
      const y = gy + (rnd() - 0.5) * step * 0.8
      if (solid(x, y)) pts.push(x, y)
    }
  }
  let count = pts.length / 2
  // trim extras (random drop) or top up with random solid pixels
  while (count > n) {
    const k = Math.floor(rnd() * count)
    pts.splice(k * 2, 2)
    count--
  }
  let guard = 0
  while (count < n && guard++ < n * 60) {
    const x = rnd() * W, y = rnd() * H
    if (solid(x, y)) { pts.push(x, y); count++ }
  }
  const k = Math.min(maxW / textW, maxH / textH)
  const order = Array.from({ length: count }, (_, i) => i).sort((a, b) => pts[a * 2] - pts[b * 2])
  const xy = new Float32Array(count * 2)
  order.forEach((src, i) => {
    xy[i * 2] = (pts[src * 2] - W / 2) * k
    xy[i * 2 + 1] = -(pts[src * 2 + 1] - H / 2) * k
  })
  return { xy, spacing: step * k }
}
