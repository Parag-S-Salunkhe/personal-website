'use client'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { evening } from './timeline'

/** The damped story time every part of the scene reads (the camera rig advances it once per frame). */
export const clockT = { T: 19 }

type Stop = { t: number; pos: [number, number, number]; look: [number, number, number] }
const STOPS: Stop[] = [
  { t: 19.0, pos: [0, 2.4, 6.4], look: [0, 1.2, -1] },
  { t: 19.95, pos: [-0.9, 1.5, 2.0], look: [-0.95, 0.95, 0.15] },
  { t: 20.95, pos: [0.9, 1.7, 2.3], look: [0.2, 1.0, -0.2] },
  { t: 22.0, pos: [2.4, 1.5, 1.7], look: [1.8, 0.85, 0.2] },
  { t: 22.3, pos: [0, 2.1, 2.8], look: [0, 0.8, 0] },
  { t: 22.65, pos: [-4.4, 2.0, 0.9], look: [0, 1.2, 0.4] },
  { t: 23.0, pos: [0, 1.65, -2.6], look: [0, 2.2, 8] },
  { t: 24.5, pos: [0, 1.7, 0.2], look: [0, 2.3, 8] },
  { t: 25.0, pos: [-4.2, 1.6, 1.2], look: [-9, 1.4, 3.0] },
]
const sm = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

export default function Rig({ onFrame, onReady, dof }: { onFrame: (T: number) => void; onReady: () => void; dof: THREE.Vector3 }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const portrait = size.height > size.width * 0.95
  const path = useMemo(() => {
    const quats: THREE.Quaternion[] = [], pos: THREE.Vector3[] = [], looks: THREE.Vector3[] = []
    const m = new THREE.Matrix4(), up = new THREE.Vector3(0, 1, 0)
    STOPS.forEach((s, i) => {
      const look = new THREE.Vector3(...s.look)
      let p = new THREE.Vector3(...s.pos)
      if (portrait) {
        if (i <= 5 || i === 8) p = look.clone().add(p.clone().sub(look).multiplyScalar(1.3))
        if (i === 6) p.z += 2.2
        if (i === 7) p.z += 2.4
      }
      pos.push(p); looks.push(look)
      m.lookAt(p, look, up)
      quats.push(new THREE.Quaternion().setFromRotationMatrix(m))
    })
    return { curve: new THREE.CatmullRomCurve3(pos, false, 'centripetal'), quats, looks, pos }
  }, [portrait])
  const tmp = useMemo(() => ({ q: new THREE.Quaternion(), p: new THREE.Vector3(), f: new THREE.Vector3() }), [])
  const frames = useRef(0)
  useEffect(() => { clockT.T = evening.t }, [])
  useEffect(() => { camera.fov = portrait ? 56 : 38; camera.near = 0.05; camera.far = 60; camera.updateProjectionMatrix() }, [camera, portrait])
  useFrame(({ clock }, dt) => {
    const T = (clockT.T = THREE.MathUtils.damp(clockT.T, evening.t, 4.5, Math.min(dt, 0.05)))
    let i = 0
    while (i < STOPS.length - 2 && T >= STOPS[i + 1].t) i++
    const f = Math.min(1, Math.max(0, (T - STOPS[i].t) / (STOPS[i + 1].t - STOPS[i].t)))
    const e = sm(0.1, 0.9, f)
    path.curve.getPoint(Math.min(1, (i + e) / (STOPS.length - 1)), tmp.p)
    camera.position.copy(tmp.p)
    camera.quaternion.slerpQuaternions(path.quats[i], path.quats[i + 1], e)
    // dwell: a slow breath while the camera rests on a beat
    const rest = 1 - Math.min(1, Math.min(e, 1 - e) * 8)
    const t = clock.elapsedTime
    camera.position.y += Math.sin(t * 0.7) * 0.012 * rest
    camera.position.x += Math.sin(t * 0.43) * 0.015 * rest
    // focus point: ~ the look target, 4m ahead
    tmp.f.set(0, 0, -1).applyQuaternion(camera.quaternion)
    dof.copy(camera.position).addScaledVector(tmp.f, THREE.MathUtils.lerp(path.looks[i].distanceTo(path.pos[i]), path.looks[i + 1].distanceTo(path.pos[i + 1]), e) * (T > 22.9 ? 0.6 : 1))
    onFrame(T)
    if (++frames.current === 4) onReady()
  })
  return null
}
