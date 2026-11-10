'use client'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { CanvasTexture, SRGBColorSpace, type MeshBasicMaterial } from 'three'
import { COLS, ROWS, layoutTitle, titleIndex, type Story } from './timeline'

const CW = 100, CH = 146, W = COLS * CW, H = ROWS * CH
const N = COLS * ROWS

/** Letter board: a canvas texture of 36 cells; each cell flips out and in when the title changes. */
export default function Board({ story, texts, family }: { story: MutableRefObject<Story>; texts: string[]; family: string }) {
  const matRef = useRef<MeshBasicMaterial>(null)
  const invalidate = useThree((s) => s.invalidate)
  const grids = useMemo(() => texts.map(layoutTitle), [texts])
  const st = useRef({ cur: -2, ch: Array(N).fill(' ') as string[], target: Array(N).fill(' ') as string[], f: Array(N).fill(-1) as number[], wait: Array(N).fill(0) as number[], dirty: true, fontReady: false })
  const { canvas, tex } = useMemo(() => {
    const c = document.createElement('canvas'); c.width = W; c.height = H
    const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; t.anisotropy = 4
    return { canvas: c, tex: t }
  }, [])
  useEffect(() => () => tex.dispose(), [tex])
  useEffect(() => {
    let live = true
    document.fonts?.load(`800 120px ${family}`).finally(() => { if (live) { st.current.fontReady = true; st.current.dirty = true; invalidate() } })
    return () => { live = false }
  }, [family, invalidate])

  const draw = () => {
    const s = st.current, ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#12060a'; ctx.fillRect(0, 0, W, H)
    for (let k = 0; k < N; k++) {
      const col = k % COLS, row = Math.floor(k / COLS), x = col * CW, y = row * CH
      const g = ctx.createLinearGradient(0, y, 0, y + CH)
      g.addColorStop(0, '#2a0e18'); g.addColorStop(1, '#1b0810')
      ctx.fillStyle = g; ctx.fillRect(x + 4, y + 5, CW - 8, CH - 10)
      ctx.strokeStyle = 'rgba(216,168,78,.28)'; ctx.lineWidth = 2; ctx.strokeRect(x + 4, y + 5, CW - 8, CH - 10)
      const f = s.f[k]
      const sc = f < 0 ? 1 : Math.abs(Math.cos(Math.PI * f))
      const ch = s.ch[k]
      if (ch !== ' ') {
        ctx.save(); ctx.translate(x + CW / 2, y + CH / 2); ctx.scale(1, Math.max(0.02, sc))
        ctx.font = `800 118px ${family}, Impact, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillStyle = '#FFF3D6'; ctx.fillText(ch, 0, 6)
        ctx.restore()
      }
      if (f >= 0 && sc < 0.5) { ctx.fillStyle = 'rgba(216,168,78,.18)'; ctx.fillRect(x + 4, y + CH / 2 - 1, CW - 8, 2) }
    }
    tex.needsUpdate = true
  }

  useFrame((_, dtRaw) => {
    const s = st.current, dt = Math.min(dtRaw, 0.05), sy = story.current
    const ti = titleIndex(sy.p)
    if (ti !== s.cur) {
      s.cur = ti
      const g = ti < 0 ? ' '.repeat(N) : grids[Math.min(ti, grids.length - 1)]
      for (let k = 0; k < N; k++) { s.target[k] = g[k]; s.wait[k] = (k % COLS) * 0.05 + Math.floor(k / COLS) * 0.14 + ((k * 7) % 5) * 0.03; if (sy.still) { s.ch[k] = s.target[k]; s.f[k] = -1 } }
      s.dirty = true
    }
    for (let k = 0; k < N; k++) {
      if (s.f[k] < 0) {
        if (s.ch[k] !== s.target[k]) {
          if (s.ch[k] === ' ' && s.target[k] === ' ') s.ch[k] = s.target[k]
          else if ((s.wait[k] -= dt) <= 0) { s.f[k] = 0; s.dirty = true }
        }
      } else {
        const prev = s.f[k]
        s.f[k] += dt / 0.4
        if (prev < 0.5 && s.f[k] >= 0.5) s.ch[k] = s.target[k]
        if (s.f[k] >= 1) s.f[k] = -1
        s.dirty = true
      }
    }
    if (s.dirty && s.fontReady) { draw(); s.dirty = s.f.some((v) => v >= 0) || s.ch.some((c, k) => c !== s.target[k]); invalidate() }
    if (matRef.current) { const lit = 0.25 + 1.7 * Math.min(1, Math.max(0, (sy.p - 0.16) / 0.1)); matRef.current.color.setScalar(lit) }
  })

  return (
    <group position={[0, 6, 0.7]}>
      <mesh position={[0, 0, -0.08]}><boxGeometry args={[5.8, 2.5, 0.08]} /><meshStandardMaterial color="#10040a" roughness={0.6} /></mesh>
      <mesh><planeGeometry args={[5.4, 5.4 * H / W]} /><meshBasicMaterial ref={matRef} map={tex} toneMapped={false} /></mesh>
    </group>
  )
}
