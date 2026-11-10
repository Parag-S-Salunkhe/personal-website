'use client'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { CAM } from './layout'

/** Velvet room: warm projector glow in the middle, curtain folds down both sides. Painted to a canvas texture. */
export default function Backdrop({ aspect }: { aspect: number }) {
  const tex = useMemo(() => {
    const W = 1024, H = 640
    const c = document.createElement('canvas')
    c.width = W; c.height = H
    const g = c.getContext('2d')!
    const rg = g.createRadialGradient(W * 0.5, H * 0.46, 10, W * 0.5, H * 0.5, W * 0.62)
    rg.addColorStop(0, '#8a3a26')
    rg.addColorStop(0.35, '#5a1a26')
    rg.addColorStop(0.75, '#2B0B14')
    rg.addColorStop(1, '#1a0710')
    g.fillStyle = rg
    g.fillRect(0, 0, W, H)
    for (const side of [0, 1]) {
      const cw = W * 0.17
      const x0 = side === 0 ? 0 : W - cw
      for (let x = 0; x < cw; x++) {
        const f = 0.5 + 0.5 * Math.sin((x / cw) * Math.PI * 7 + side)
        const l = 0.28 + 0.5 * f
        const r = Math.round(107 * l * 1.2), gg = Math.round(26 * l * 1.2), b = Math.round(43 * l * 1.2)
        g.fillStyle = `rgb(${r},${gg},${b})`
        g.fillRect(x0 + x, 0, 1, H)
      }
    }
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  useEffect(() => () => tex.dispose(), [tex])
  const z = -8
  const h = 2 * Math.tan((CAM.fov * Math.PI) / 360) * (CAM.z - z) * 1.08
  const w = Math.max(h * aspect, h * 1.6)
  return (
    <mesh position={[0, 0, z]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  )
}
