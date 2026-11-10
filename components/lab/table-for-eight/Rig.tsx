'use client'
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { SEATS } from './seats'

type Shared = MutableRefObject<{ p: number; s: number; lit?: number }>
const N = 9 // ten stops: 0 overhead, 1..8 seats, 9 pull-back
const HOLD = 0.34
const sm = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)

/** progress 0..1 -> stop index 0..9 with a dwell at each stop. */
export function stopOf(p: number) {
  const q = Math.min(1, p / 0.93) * N
  if (q >= N) return N
  const i = Math.floor(q), f = q - i
  return i + (f < HOLD ? 0 : sm((f - HOLD) / (1 - HOLD)))
}

function buildPath(portrait: boolean) {
  const pos: THREE.Vector3[] = [], look: THREE.Vector3[] = []
  pos.push(portrait ? new THREE.Vector3(0, 9.6, 0.02) : new THREE.Vector3(0, 6.3, 2.1))
  look.push(new THREE.Vector3(0, 0.7, 0))
  const out = portrait ? 1.0 : 1.3, h = portrait ? 1.5 : 1.55, ahead = portrait ? 0.25 : 0.3
  for (const s of SEATS) {
    const [px, py, pz] = s.pos, [dx, , dz] = s.dir
    pos.push(new THREE.Vector3(px - dx * out, h, pz - dz * out))
    look.push(new THREE.Vector3(px + dx * ahead, py + 0.04, pz + dz * ahead))
  }
  pos.push(portrait ? new THREE.Vector3(-9.0, 3.7, 1.3) : new THREE.Vector3(-4.9, 3.5, 5.7))
  look.push(portrait ? new THREE.Vector3(0.6, 0.6, 0) : new THREE.Vector3(0.2, 0.6, 0))
  return { pos: new THREE.CatmullRomCurve3(pos, false, 'centripetal'), look: new THREE.CatmullRomCurve3(look, false, 'centripetal') }
}

export default function Rig({ shared, still, onFrame, onReady, dof }: { shared: Shared; still: boolean; onFrame: (s: number, p: number) => void; onReady: () => void; dof: THREE.Vector3 }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const portrait = size.height > size.width * 0.95
  const path = useMemo(() => buildPath(portrait), [portrait])
  const st = useRef({ p: 0, frames: 0 })
  const a = useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3(), fwd: new THREE.Vector3(), up: new THREE.Vector3() }), [])
  useEffect(() => { camera.fov = portrait ? 54 : 36; camera.near = 0.05; camera.far = 60; camera.updateProjectionMatrix() }, [camera, portrait])
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    st.current.p = still ? 1 : THREE.MathUtils.damp(st.current.p, shared.current.p, 4.2, Math.min(dt, 0.05))
    const s = still ? N : stopOf(st.current.p)
    shared.current.s = s
    path.pos.getPoint(Math.min(1, s / N), a.pos)
    path.look.getPoint(Math.min(1, s / N), a.look)
    // breathing push + faint sway while the camera dwells on a seat
    const frac = Math.abs(s - Math.round(s))
    const w = still ? 0 : 1 - THREE.MathUtils.smoothstep(frac, 0.02, 0.3)
    a.fwd.subVectors(a.look, a.pos).normalize()
    a.pos.addScaledVector(a.fwd, Math.sin(t * 0.55) * 0.045 * w)
    a.pos.y += Math.sin(t * 0.8) * 0.008 * w
    a.pos.x += Math.sin(t * 0.37) * 0.01 * w
    camera.position.copy(a.pos)
    // portrait: the overhead shot is rolled so the table runs up the screen, then unrolls
    if (portrait) { const k = 1 - THREE.MathUtils.smoothstep(s, 0, 1.2); a.up.set(k, 1 - k, 0).normalize() } else a.up.set(0, 1, 0)
    camera.up.copy(a.up)
    camera.lookAt(a.look)
    dof.copy(a.look)
    onFrame(s, st.current.p)
    if (++st.current.frames === 4) onReady()
  })
  return null
}
