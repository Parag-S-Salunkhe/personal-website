'use client'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Layout } from './layout'
import type { Shared } from './types'

/** Striped paper popcorn bucket. Rises from below the frame as the story nears its end. */
export default function Bucket({ layout, shared }: { layout: Layout; shared: Shared }) {
  const g = useRef<THREE.Group>(null)
  const { R, bh, cy } = layout.bucket
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512; c.height = 256
    const x = c.getContext('2d')!
    x.fillStyle = '#FFF3D6'
    x.fillRect(0, 0, 512, 256)
    const stripes = 10
    for (let i = 0; i < stripes; i += 2) {
      x.fillStyle = '#A32339'
      x.fillRect((i / stripes) * 512, 0, 512 / stripes, 256)
    }
    const shade = x.createLinearGradient(0, 0, 0, 256)
    shade.addColorStop(0, 'rgba(0,0,0,0)')
    shade.addColorStop(1, 'rgba(60,20,10,0.28)')
    x.fillStyle = shade
    x.fillRect(0, 0, 512, 256)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 4
    return t
  }, [])
  useEffect(() => () => tex.dispose(), [tex])

  const hidden = cy - bh - layout.viewH * 0.1
  useFrame(() => {
    if (!g.current) return
    const u = THREE.MathUtils.clamp((shared.sp - 0.26) / 0.12, 0, 1)
    const e = 1 - Math.pow(1 - u, 3)
    g.current.position.y = hidden + (cy - hidden) * e
    g.current.visible = u > 0.001
  })
  return (
    <group ref={g} position={[0, hidden, 0]} visible={false}>
      <mesh>
        <cylinderGeometry args={[R, R * 0.72, bh, 48, 1, true]} />
        <meshStandardMaterial map={tex} roughness={0.85} side={THREE.FrontSide} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[R * 0.985, R * 0.715, bh, 48, 1, true]} />
        <meshStandardMaterial color="#3a1219" roughness={1} side={THREE.BackSide} />
      </mesh>
      <mesh position={[0, bh / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R, 0.045, 8, 48]} />
        <meshStandardMaterial color="#D8A84E" roughness={0.45} metalness={0.5} />
      </mesh>
      <mesh position={[0, -bh / 2 + 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[R * 0.72, 40]} />
        <meshStandardMaterial color="#3a1219" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
