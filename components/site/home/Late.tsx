'use client'
// Beat 5: the late show. Ported from components/lab/fx/blender-hero/Scene.tsx (assembled projector, no exploded tour):
// the lamp switches on, the beam forms in the dust, real posters change on the screen as you scroll.
import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, useTexture } from '@react-three/drei'
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import Projector, { flickerAt, type Ctl } from './Projector'
import { Beam, LENS, SCREEN, SCREEN_H } from './Beam'
import { bh, clamp01, hash, smooth } from './bhTypes'
import { SceneEnv } from './SceneEnv'
import type { LateFilm } from './content'

export const LATE_START = 0.85

/** Which film is on the screen for story progress p (0..n-1). */
export const filmAt = (p: number, n: number) => (n <= 0 ? -1 : Math.min(n - 1, Math.floor(clamp01(((p - LATE_START) / (1 - LATE_START) - 0.2) / 0.8) * n)))

function Rig({ ctl, prog, light, onFilm, n }: { ctl: React.MutableRefObject<Ctl>; prog: React.MutableRefObject<number>; light: boolean; onFilm: (i: number) => void; n: number }) {
  const { camera, size } = useThree()
  const pd = useRef(Math.max(LATE_START, prog.current))
  const last = useRef(-2)
  const turn = useRef<THREE.Group>(null)
  const tmp = useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3(), a: new THREE.Vector3(), la: new THREE.Vector3() }), [])

  useFrame((state, dt) => {
    const c = ctl.current
    const t = state.clock.elapsedTime
    pd.current = THREE.MathUtils.damp(pd.current, prog.current, 5, Math.min(dt, 0.1))
    const u = clamp01((pd.current - LATE_START) / (1 - LATE_START))
    const cam = camera as THREE.PerspectiveCamera
    const portrait = size.width / size.height < 1
    cam.fov = portrait ? 56 : light ? 48 : 36
    cam.near = 0.05; cam.far = 40; cam.up.set(0, 1, 0); cam.updateProjectionMatrix()

    // the lamp strikes with a stutter, then flickers at 24 fps
    const on = smooth(0.08, 0.24, u)
    const strike = on > 0 && on < 1 ? (Math.floor(t * 18) % 3 === 0 ? 0.15 : 1) : 1
    c.beam = on * strike
    c.flick = flickerAt(t, false)
    c.ex = 0
    const idx = filmAt(pd.current, n)
    bh.idx = Math.max(0, idx)
    if (idx !== last.current) { last.current = idx; onFilm(idx) }

    // camera: three-quarter view of the projector, then behind its shoulder looking down the beam, then a slow push
    const zoom = light ? 1.35 : 1
    tmp.pos.set(1.7 * zoom, 0.75, 2.05 * zoom); tmp.look.set(0.1, 0.36, 0)
    const k2 = smooth(0.1, 0.42, u)
    tmp.a.set(-1.35 * (light ? 0.6 : 1), 0.85, -0.95 * zoom); tmp.la.set(0, 0.75, 2.7)
    tmp.pos.lerp(tmp.a, k2); tmp.look.lerp(tmp.la, k2)
    const k3 = smooth(0.5, 1, u)
    tmp.pos.z += k3 * 1.6; tmp.pos.x += k3 * 0.5; tmp.pos.y += k3 * 0.1; tmp.look.z += k3 * 0.8; tmp.look.y += k3 * 0.15
    camera.position.copy(tmp.pos)
    camera.lookAt(tmp.look)
    if (turn.current) turn.current.rotation.y = THREE.MathUtils.damp(turn.current.rotation.y, THREE.MathUtils.lerp(-0.55 + Math.sin(t * 0.3) * 0.1, 0, k2), 4, Math.min(dt, 0.1))
  })
  return (
    <group ref={turn}>
      <Projector ctl={ctl} />
    </group>
  )
}

function Lamp({ ctl }: { ctl: React.MutableRefObject<Ctl> }) {
  const pl = useRef<THREE.PointLight>(null)
  useFrame(() => { if (pl.current) pl.current.intensity = 2.5 * ctl.current.beam * ctl.current.flick })
  return <pointLight ref={pl} position={[LENS.x, LENS.y + 0.05, LENS.z + 0.25]} color="#FFD9A0" distance={4} decay={2} />
}

/** The screen: a poster per film (same-origin textures), or a warm blank frame when there are none. */
function Screen({ films, ctl }: { films: LateFilm[]; ctl: React.MutableRefObject<Ctl> }) {
  const urls = films.map((f) => f.posterUrl).filter((u): u is string => !!u)
  const tex = useTexture(urls) as THREE.Texture | THREE.Texture[]
  const list = useMemo(() => (Array.isArray(tex) ? tex : [tex]), [tex])
  const state = useRef({ cutUntil: 0, last: -1 })
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false }), [])
  useEffect(() => {
    list.forEach((t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.needsUpdate = true })
    mat.map = list[0] ?? null; mat.needsUpdate = true
  }, [list, mat])
  useEffect(() => () => mat.dispose(), [mat])
  const warm = useMemo(() => new THREE.Color('#F3DDB4'), [])

  useFrame((s) => {
    const c = ctl.current, st = state.current, t = s.clock.elapsedTime
    if (st.last !== bh.idx) {
      if (st.last >= 0) st.cutUntil = t + 0.38
      st.last = bh.idx
      mat.map = list[bh.idx] ?? list[0] ?? null; mat.needsUpdate = true
    }
    let k = c.beam * 0.92 * c.flick
    if (t < st.cutUntil) { const n = Math.floor(t * 24); k *= hash(n * 1.3) > 0.45 ? 1.15 : 0.05 }
    if (list.length === 0) mat.color.copy(warm).multiplyScalar(Math.max(0, k) * 0.8)
    else mat.color.setScalar(Math.max(0, k))
  })

  const w = SCREEN_H / 1.5
  return (
    <group position={SCREEN} rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 0, -0.03]}><boxGeometry args={[w + 0.14, SCREEN_H + 0.14, 0.04]} /><meshStandardMaterial color="#D8A84E" metalness={0.9} roughness={0.35} /></mesh>
      <mesh material={mat}><planeGeometry args={[w, SCREEN_H]} /></mesh>
    </group>
  )
}

export default function Late({ films, prog, light, onFilm }: { films: LateFilm[]; prog: React.MutableRefObject<number>; light: boolean; onFilm: (i: number) => void }) {
  const ctl = useRef<Ctl>({ ex: 0, yaw: 0, beam: 0, flick: 1, pointerK: 0, reduced: false })
  return (
    <>
      <SceneEnv bg="#0A1322" fog={['#0A1322', 5, 13]} />
      <ambientLight intensity={0.22} color="#c7cfe8" />
      <spotLight position={[2.4, 3.2, 2.2]} angle={0.5} penumbra={0.8} intensity={38} color="#FFB36B" castShadow={!light} shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
      <spotLight position={[-2.6, 1.8, -1.8]} angle={0.6} penumbra={1} intensity={22} color="#6FA7A4" />
      <directionalLight position={[0, 4, -3]} intensity={0.6} color="#D8A84E" />
      <Suspense fallback={null}>
        <Rig ctl={ctl} prog={prog} light={light} onFilm={onFilm} n={films.length} />
        <Beam ctl={ctl} count={light ? 260 : 700} />
        <Screen films={films} ctl={ctl} />
      </Suspense>
      <Lamp ctl={ctl} />
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.255, 1.6]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#17233d" roughness={0.85} />
      </mesh>
      <ContactShadows position={[0, -0.25, 0]} opacity={0.65} scale={3} blur={2.4} far={1} resolution={light ? 256 : 512} frames={1} />
      <EffectComposer multisampling={light ? 0 : 4} enableNormalPass={false}>
        <Bloom intensity={light ? 0.7 : 1.1} luminanceThreshold={0.78} luminanceSmoothing={0.3} mipmapBlur />
        <Noise opacity={0.07} premultiply />
        <Vignette offset={0.25} darkness={0.75} />
      </EffectComposer>
    </>
  )
}
