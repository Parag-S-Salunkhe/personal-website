'use client'
// Beat 1 + 2: the tilt-shift terrace at dusk, then the dolly through Number 14's window.
// Ported from components/lab/fx/tilt-shift/Scene.tsx (Rig, Post, scene) and rebuilt for the home story:
// the lab's progress 0..0.6 is mapped onto story p 0..0.24; p 0.24..0.34 is the dolly (new camera keys).
import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { TiltShiftFx } from './TiltShiftFx'
import Street from './Street'
import { Lamps, Lighting, People, Sky, Windows } from './Life'
import Room from './Room'
import { clamp01, smooth, type Shared } from './types'

export const DUSK_END = 0.24 // story p where the street part ends and the dolly begins
export const DOLLY_END = 0.34

// camera keys along the lab progress: [p, target x, y, z, visible width, azimuth deg, elevation deg]
const KEYS: number[][] = [
  [0.0, -5.5, 1.3, 0.5, 13, -30, 17],
  [0.3, -1.5, 1.3, 0.3, 11, -22, 18],
  [0.55, 3.0, 1.1, -0.1, 8, -14, 20],
  [0.7, 3.95, 0.85, -0.7, 4.7, -5, 14],
  [1.0, 4.05, 0.85, -0.7, 4.3, -4, 14],
]
const LAB_END = 0.62
function sample(p: number, col: number) {
  for (let i = 0; i < KEYS.length - 1; i++) {
    const a = KEYS[i], b = KEYS[i + 1]
    if (p <= b[0]) { const t = (p - a[0]) / (b[0] - a[0]); return a[col] + (b[col] - a[col]) * Math.min(1, Math.max(0, t)) }
  }
  return KEYS[KEYS.length - 1][col]
}

type Focus = { y: number; q: number }

function Rig({ sh, prog, focus, light }: { sh: React.MutableRefObject<Shared>; prog: React.MutableRefObject<number>; focus: React.MutableRefObject<Focus>; light: boolean }) {
  const { camera, size } = useThree()
  const pd = useRef(0)
  const v = useMemo(() => ({ t: new THREE.Vector3(), f: new THREE.Vector3(), a: new THREE.Vector3(), b: new THREE.Vector3(), pos: new THREE.Vector3(), la: new THREE.Vector3(), pb: new THREE.Vector3(), lb: new THREE.Vector3() }), [])
  const baseFov = light ? 32 : 24
  useFrame((_, dt) => {
    pd.current = THREE.MathUtils.damp(pd.current, prog.current, 5, Math.min(dt, 0.1))
    const p = pd.current
    const lab = clamp01(p / DUSK_END) * LAB_END
    sh.current.p = lab
    const q = clamp01((p - DUSK_END) / (DOLLY_END - DUSK_END))
    const cam = camera as THREE.PerspectiveCamera
    cam.near = 0.05; cam.far = 150
    cam.up.set(0, 1, 0)
    const aspect = size.width / size.height
    const narrow = aspect < 1 ? 0.45 + 0.55 * aspect : 1
    // the street camera, exactly as the lab rig computes it
    const W = sample(lab, 4) * narrow
    cam.fov = baseFov
    const d = W / (2 * Math.tan(THREE.MathUtils.degToRad(baseFov) / 2) * aspect)
    const az = THREE.MathUtils.degToRad(sample(lab, 5)), el = THREE.MathUtils.degToRad(sample(lab, 6))
    v.t.set(sample(lab, 1), sample(lab, 2) + (aspect < 1 ? 1.6 : 0), sample(lab, 3))
    v.pos.set(v.t.x + d * Math.sin(az) * Math.cos(el), v.t.y + d * Math.sin(el), v.t.z + d * Math.cos(az) * Math.cos(el))
    if (q > 0) {
      // dolly: straight at the lit window, in through the glazing, fov narrowing as we go
      const k = Math.pow(q, 2.1)
      v.pb.set(3.95, 0.82, -0.32); v.lb.set(3.95, 0.74, -1.29)
      v.pos.lerp(v.pb, k)
      v.t.lerp(v.lb, smooth(0.0, 1, q))
      cam.fov = THREE.MathUtils.lerp(baseFov, light ? 20 : 14, smooth(0.1, 1, q))
    }
    cam.updateProjectionMatrix()
    camera.position.copy(v.pos)
    camera.lookAt(v.t)
    camera.updateMatrixWorld()
    // focus point glides from the pavement (where the guests walk) to the table inside the window
    const kf = smooth(0.5, 0.7, lab)
    v.a.set(v.t.x, 0.35, 0.6); v.b.set(3.95, 0.7, -0.8)
    v.f.lerpVectors(v.a, v.b, kf).project(cam)
    focus.current.y = q > 0 ? 0.5 : v.f.y * 0.5 + 0.5
    focus.current.q = q
  })
  return null
}

function Post({ focus, light, sh }: { focus: React.MutableRefObject<Focus>; light: boolean; sh: React.MutableRefObject<Shared> }) {
  const fx = useMemo(() => new TiltShiftFx(light ? 9 : 18), [light])
  const size = useThree((s) => s.size)
  useEffect(() => () => fx.dispose(), [fx])
  useFrame(() => {
    fx.set('focus', focus.current.y)
    fx.set('band', 0.1 - 0.035 * smooth(0.45, 0.7, sh.current.p) + 0.7 * smooth(0, 0.6, focus.current.q))
    fx.set('reach', size.width / size.height < 1 ? 0.26 : 0.32)
    fx.set('maxR', light ? 10 : 16)
  })
  return (
    <EffectComposer multisampling={light ? 0 : 4} enableNormalPass={false}>
      <Bloom intensity={light ? 0.85 : 1.15} luminanceThreshold={0.85} luminanceSmoothing={0.35} mipmapBlur />
      <primitive object={fx} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.3} darkness={0.55} />
    </EffectComposer>
  )
}

export default function Dusk({ prog, light, posterUrl }: { prog: React.MutableRefObject<number>; light: boolean; posterUrl: string | null }) {
  const sh = useRef<Shared>({ p: 0, reduced: false })
  const focus = useRef<Focus>({ y: 0.4, q: 0 })
  return (
    <>
      <Sky sh={sh} />
      <Lighting sh={sh} cast={!light} />
      <Suspense fallback={null}>
        <Street cast={!light} />
        <Windows sh={sh} />
        <Lamps sh={sh} cast={!light} lights />
        <People sh={sh} cast={!light} />
        <Room sh={sh} posterUrl={posterUrl} lights />
      </Suspense>
      <Rig sh={sh} prog={prog} focus={focus} light={light} />
      <Post focus={focus} light={light} sh={sh} />
    </>
  )
}
