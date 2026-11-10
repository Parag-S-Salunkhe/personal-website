'use client'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, Vector3 } from 'three'
import type { MutableRefObject } from 'react'
import { smooth, type Story } from './timeline'

const tmpP = new Vector3(), tmpL = new Vector3()
type K = { p: number; pos: [number, number, number]; look: [number, number, number] }

/** Advances story time/progress and drives the camera along the keyframes. */
export default function Rig({ story }: { story: MutableRefObject<Story> }) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const st = story.current
    if (st.still) { st.p = 0.3; } else { st.t += dt; st.p = MathUtils.damp(st.p, st.raw, 3.2, dt) }
    const aspect = size.width / size.height
    const D = Math.max(19, 9.8 / (aspect * 0.6887))
    const bd = aspect < 1 ? 9 : 6.5
    const ks: K[] = [
      { p: 0, pos: [0, 2.0, D * 1.04], look: [0, 6.4, 0] },
      { p: 0.2, pos: [0, 3.6, D * 0.92], look: [0, 5.9, 0] },
      { p: 0.46, pos: [0, 4.6, D * 0.6], look: [0, 6.0, 0] },
      { p: 0.5, pos: [0, 4.6, D * 0.6], look: [0, 6.0, 0] },
      { p: 0.7, pos: [-2.8, 9.2, bd], look: [-3.75, 8.0, 1.6] },
      { p: 0.92, pos: [0, 6.4, D * 1.08], look: [0, 6.0, 0] },
      { p: 1, pos: [0, 6.4, D * 1.1], look: [0, 6.0, 0] },
    ]
    let p = st.p
    if (st.still) { tmpP.set(0, 5.0, D * 0.98); tmpL.set(0, 6.0, 0) } else {
      let i = 0
      while (i < ks.length - 2 && p > ks[i + 1].p) i++
      const a = ks[i], b = ks[i + 1]
      const u = smooth(a.p, b.p, p)
      tmpP.set(...a.pos).lerp(new Vector3(...b.pos), u)
      tmpL.set(...a.look).lerp(new Vector3(...b.look), u)
      tmpP.x += Math.sin(st.t * 0.35) * 0.18; tmpP.y += Math.sin(st.t * 0.27) * 0.08
      p = 0
    }
    camera.position.copy(tmpP)
    camera.lookAt(tmpL)
  })
  return null
}
