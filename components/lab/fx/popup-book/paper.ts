import * as THREE from 'three'

export const C = { cloth: '#17352A', clothDeep: '#10281F', linen: '#F1EEE6', candle: '#F6B94F', claret: '#7C2236', sage: '#A9C3AE', wax: '#FFF8EA' }
export type Fam = { gilda: string; hanken: string; pinyon: string }

export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
export const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) } return h >>> 0 }

export function mk(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = Math.max(2, Math.round(w)); c.height = Math.max(2, Math.round(h))
  return c
}
export function toTex(c: HTMLCanvasElement, srgb = true) {
  const t = new THREE.CanvasTexture(c)
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

let grainTile: HTMLCanvasElement | null = null
/** A small tile of paper fibre and speckle, drawn once and reused as a pattern. */
function getGrain() {
  if (grainTile) return grainTile
  const c = mk(192, 192), g = c.getContext('2d')!
  const img = g.createImageData(192, 192), r = rng(7)
  for (let i = 0; i < 192 * 192; i++) {
    const v = r()
    const dark = v < 0.5
    img.data[i * 4] = dark ? 40 : 255; img.data[i * 4 + 1] = dark ? 28 : 250; img.data[i * 4 + 2] = dark ? 20 : 240
    img.data[i * 4 + 3] = dark ? (0.5 - v) * 70 : (v - 0.5) * 90
  }
  g.putImageData(img, 0, 0)
  g.lineCap = 'round'
  for (let i = 0; i < 90; i++) {
    g.strokeStyle = r() < 0.5 ? 'rgba(60,40,20,.07)' : 'rgba(255,255,250,.14)'
    g.lineWidth = 0.6 + r() * 0.5
    const x = r() * 192, y = r() * 192, l = 5 + r() * 14, a = r() * 6.28
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + r() * 3, y + Math.sin(a) * l * 0.5 + r() * 3, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke()
  }
  grainTile = c
  return c
}
/** Lay paper grain over what is already drawn (only where something is drawn). */
export function grain(g: CanvasRenderingContext2D, w: number, h: number, strength = 1) {
  g.save()
  g.setTransform(1, 0, 0, 1, 0, 0)
  g.globalCompositeOperation = 'source-atop'
  g.globalAlpha = strength
  g.fillStyle = g.createPattern(getGrain(), 'repeat')!
  g.fillRect(0, 0, w, h)
  g.restore()
}
export function dispose(obj: THREE.Object3D) {
  obj.traverse((o) => {
    const m = o as THREE.Mesh
    if (m.geometry) m.geometry.dispose()
    const mat = m.material as THREE.Material | THREE.Material[] | undefined
    const mats = Array.isArray(mat) ? mat : mat ? [mat] : []
    for (const x of mats) {
      for (const v of Object.values(x as unknown as Record<string, unknown>)) if (v instanceof THREE.Texture) v.dispose()
      x.dispose()
    }
    const d = m.customDepthMaterial
    if (d) d.dispose()
  })
}
