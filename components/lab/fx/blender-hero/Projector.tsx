'use client'
import { useEffect, useMemo, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { hash } from './types'

export type Ctl = { ex: number; yaw: number; beam: number; flick: number; pointerK: number; reduced: boolean }

function offsetFor(name: string): [number, number, number] {
  if (name.startsWith('Fin')) { const i = Number(name.slice(3)); return [0, 0.12 + 0.035 * i, -0.04 * i - 0.02] }
  if (name.startsWith('Foot_')) return [0, -0.16, 0]
  switch (name) {
    case 'LensMount': return [0, 0, 0.1]
    case 'LensFocusRing': return [0, 0, 0.26]
    case 'LensBarrel': return [0, 0, 0.36]
    case 'LensRing': return [0, 0, 0.5]
    case 'LensGlass': return [0, 0, 0.62]
    case 'ReelFront': return [0, 0.4, 0.14]
    case 'ReelBack': return [0, 0.4, -0.14]
    case 'ArmFront': return [0, 0.2, 0.07]
    case 'ArmBack': return [0, 0.2, -0.07]
    case 'FilmPath': return [-0.2, 0.2, 0]
    case 'LampHouse': return [0, 0.32, -0.12]
    case 'GateWindow': return [0, 0, 0.16]
    case 'TrimBand': return [0, 0.06, 0]
    case 'CrankHub': return [0.3, 0, 0]
    case 'CrankArm': return [0.36, 0, 0]
    case 'CrankHandle': return [0.44, 0, 0]
    case 'Knob0': return [-0.28, 0, 0]
    case 'Knob1': return [-0.34, 0, 0]
    case 'Plinth': return [0, -0.09, 0]
    default: return [0, 0, 0]
  }
}

export default function Projector({ ctl }: { ctl: MutableRefObject<Ctl> }) {
  const { scene } = useGLTF('/lab-models/projector.glb')
  const parts = useMemo(() => {
    const root = scene.getObjectByName('Projector') ?? scene
    return root.children.map((o) => ({ o, base: o.position.clone(), q: o.quaternion.clone(), off: new THREE.Vector3(...offsetFor(o.name)) }))
  }, [scene])
  const reelF = useMemo(() => parts.find((p) => p.o.name === 'ReelFront'), [parts])
  const reelB = useMemo(() => parts.find((p) => p.o.name === 'ReelBack'), [parts])
  const glass = useMemo(() => {
    const m = (scene.getObjectByName('LensGlass') as THREE.Mesh | undefined)?.material as THREE.MeshStandardMaterial | undefined
    return m ? { m, base: m.emissiveIntensity || 6 } : null
  }, [scene])
  const spin = useMemo(() => ({ f: 0, b: 0, q: new THREE.Quaternion(), ax: new THREE.Vector3(0, 1, 0) }), [])

  useEffect(() => { scene.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.frustumCulled = false }) }, [scene])

  useFrame((state, dt) => {
    const c = ctl.current
    const t = state.clock.elapsedTime
    for (const p of parts) p.o.position.copy(p.base).addScaledVector(p.off, c.ex)
    if (!c.reduced) { spin.f += dt * 2.6; spin.b += dt * 1.5 }
    if (reelF) { spin.q.setFromAxisAngle(spin.ax, spin.f); reelF.o.quaternion.copy(reelF.q).multiply(spin.q) }
    if (reelB) { spin.q.setFromAxisAngle(spin.ax, spin.b); reelB.o.quaternion.copy(reelB.q).multiply(spin.q) }
    if (glass) glass.m.emissiveIntensity = glass.base * (0.45 + 0.55 * c.beam) * c.flick
    void t
  })

  return <primitive object={scene} />
}

useGLTF.preload('/lab-models/projector.glb')

/** 24 fps flicker value, 0.7..1.05 */
export function flickerAt(t: number, reduced: boolean) {
  if (reduced) return 1
  const n = Math.floor(t * 24)
  const dip = hash(n * 0.37) > 0.93 ? 0.55 : 1
  return (0.86 + 0.16 * hash(n)) * dip
}
