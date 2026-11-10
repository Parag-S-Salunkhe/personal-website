'use client'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BoxGeometry, BufferAttribute, Color, Group, MeshBasicMaterial, type Texture } from 'three'
import { rng } from './rng'
import { WORD_AR } from './paint'

const COLS = 16, ROWS = 5

/** Fragments of one painted word, scattered along rays from the sweet spot C. Every fragment is
 *  scaled by its distance from C, so from C each one projects exactly onto its slot in the word;
 *  from anywhere else the word falls apart. */
export default function Word({ tex, width, D, focus }: { tex: Texture; width: number; D: number; focus: { v: number } }) {
  const group = useRef<Group>(null)
  const height = width / WORD_AR
  const tw = width / COLS, th = height / ROWS

  const mat = useMemo(() => new MeshBasicMaterial({ map: tex, vertexColors: true, toneMapped: false }), [tex])
  const tiles = useMemo(() => {
    const r = rng(2026)
    const tints = ['#ffffff', '#ffffff', '#fff3de', '#f3ece0', '#e4efe5', '#ffffff']
    const out: { geo: BoxGeometry; x: number; y: number; s: number; ph: number }[] = []
    for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
      const geo = new BoxGeometry(1, 1, 0.07)
      const uv = geo.getAttribute('uv') as BufferAttribute
      const pad = 0.0006
      const u0 = i / COLS + pad, u1 = (i + 1) / COLS - pad, v0 = 1 - (j + 1) / ROWS + pad, v1 = 1 - j / ROWS - pad
      // face order +x,-x,+y,-y,+z,-z; each face has 4 vertices. Only +z shows the word.
      for (let k = 0; k < 24; k++) {
        if (k >= 16 && k < 20) {
          const c = k - 16 // 0:(0,1) 1:(1,1) 2:(0,0) 3:(1,0)
          uv.setXY(k, c % 2 ? u1 : u0, c < 2 ? v1 : v0)
        } else uv.setXY(k, 0.5, 0.97)
      }
      const t = new Color(tints[Math.floor(r() * tints.length)])
      const dark = t.clone().multiplyScalar(0.55)
      const col = new Float32Array(24 * 3)
      for (let k = 0; k < 24; k++) { const c = k >= 16 && k < 20 ? t : dark; col.set([c.r, c.g, c.b], k * 3) }
      geo.setAttribute('color', new BufferAttribute(col, 3))
      // depth along the ray: some tiles hang near the camera, some far behind the word
      const s = 0.42 + Math.pow(r(), 0.8) * 1.2
      out.push({ geo, x: (i + 0.5 - COLS / 2) * tw, y: (ROWS / 2 - j - 0.5) * th, s, ph: r() * 6.28 })
    }
    return out
  }, [tw, th])

  useEffect(() => () => { tiles.forEach((t) => t.geo.dispose()); mat.dispose() }, [tiles, mat])

  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    const t = clock.elapsedTime
    const chaos = 1 - focus.v
    g.children.forEach((m, n) => {
      const q = tiles[n]
      const s = q.s + Math.sin(t * 0.6 + q.ph) * 0.05 * chaos
      m.position.set(q.x * s, q.y * s, D - D * s)
      m.scale.set(tw * 0.985 * s, th * 0.985 * s, s)
      m.rotation.set(Math.sin(t * 0.5 + q.ph) * 0.35 * chaos, Math.cos(t * 0.4 + q.ph) * 0.45 * chaos, 0)
    })
  })

  return (
    <group ref={group}>
      {tiles.map((q, n) => <mesh key={n} geometry={q.geo} material={mat} />)}
    </group>
  )
}

