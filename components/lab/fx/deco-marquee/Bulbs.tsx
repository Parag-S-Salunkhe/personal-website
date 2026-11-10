'use client'
import { useFrame, useThree } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { Color, Object3D, type InstancedMesh } from 'three'
import { bulbLevel, makeBulbs, type Story } from './timeline'

const TUNG = new Color('#FF9F43'), BEAM = new Color('#FFF3D6'), tmp = new Color()

export default function Bulbs({ story, light }: { story: MutableRefObject<Story>; light: boolean }) {
  const ref = useRef<InstancedMesh>(null)
  const defs = useMemo(() => makeBulbs(light), [light])
  const invalidate = useThree((s) => s.invalidate)
  useLayoutEffect(() => {
    const m = ref.current
    if (!m) return
    const o = new Object3D()
    defs.forEach((b, i) => { o.position.set(b.x, b.y, b.z); o.updateMatrix(); m.setMatrixAt(i, o.matrix); m.setColorAt(i, tmp.setRGB(0.05, 0.03, 0.02)) })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    invalidate()
  }, [defs, invalidate])
  useFrame(() => {
    const m = ref.current
    if (!m || !m.instanceColor) return
    const { p, t, still } = story.current
    for (let i = 0; i < defs.length; i++) {
      const lv = bulbLevel(defs[i], p, t, still)
      if (lv < 0.05) tmp.setRGB(0.06, 0.04, 0.03)
      else { tmp.copy(TUNG).lerp(BEAM, Math.min(1, Math.max(0, lv - 0.9))).multiplyScalar(lv * 2.1) }
      m.setColorAt(i, tmp)
    }
    m.instanceColor.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, defs.length]} frustumCulled={false}>
      <sphereGeometry args={[0.085, light ? 6 : 10, light ? 6 : 10]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}
