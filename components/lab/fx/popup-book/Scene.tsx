'use client'
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { createBook, flameTex, type BookState } from './book'
import type { Assets } from './art'
import { grain, mk, rng, toTex } from './paper'

const ss = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
type Shared = MutableRefObject<{ p: number }>

function clothTexture() {
  const c = mk(512, 512), g = c.getContext('2d')!, r = rng(9)
  g.fillStyle = '#17352A'; g.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '40,90,70' : '8,25,18'},${0.05 + r() * 0.06})`; g.beginPath(); g.ellipse(r() * 512, r() * 512, 30 + r() * 90, 20 + r() * 60, r() * 3, 0, 7); g.fill() }
  for (let x = 0; x < 512; x += 3) { g.strokeStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke() }
  for (let y = 0; y < 512; y += 3) { g.strokeStyle = 'rgba(180,220,200,.06)'; g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke() }
  grain(g, 512, 512, 0.5)
  const t = toTex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(7, 7)
  return t
}

type Props = {
  assets: Assets; shared: Shared; still: boolean; light: boolean
  onFrame: (s: BookState) => void; onReady: () => void
}

export default function Scene({ assets, shared, still, light, onFrame, onReady }: Props) {
  const { camera, gl, size, scene } = useThree()
  const portrait = size.height > size.width * 0.95
  const book = useMemo(() => createBook(assets, light), [assets, light])
  useEffect(() => () => book.dispose(), [book])
  const cloth = useMemo(() => clothTexture(), [])
  const flame = useMemo(() => flameTex(), [])
  useEffect(() => () => { cloth.dispose(); flame.dispose() }, [cloth, flame])
  useEffect(() => {
    scene.background = new THREE.Color('#0a1410'); scene.fog = new THREE.FogExp2('#0a1410', 0.028)
    const cam = camera as THREE.PerspectiveCamera
    cam.fov = portrait ? 46 : 34; cam.near = 0.1; cam.far = 60; cam.updateProjectionMatrix()
    return () => { scene.fog = null }
  }, [scene, camera, portrait])

  const st = useRef({ p: 0, pull: 0, pullT: 0, active: false, x0: 0, p0: 0, backAt: 0, frames: 0, stepsAt: 0 })
  const ray = useMemo(() => ({ rc: new THREE.Raycaster(), plane: new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.17), v: new THREE.Vector3(), n: new THREE.Vector2(), tmp: new THREE.Vector3(), tmp2: new THREE.Vector3() }), [])
  const sparks = useRef<THREE.Sprite[]>([])
  const lamps = useRef<THREE.PointLight[]>([])

  const worldX = (cx: number, cy: number) => {
    const r = gl.domElement.getBoundingClientRect()
    ray.n.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1)
    ray.rc.setFromCamera(ray.n, camera)
    return ray.rc.ray.intersectPlane(ray.plane, ray.v) ? ray.v.x : null
  }
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const s = st.current
      if (!s.active) return
      const x = worldX(e.clientX, e.clientY)
      if (x !== null) s.pullT = Math.min(1, Math.max(0, s.p0 + (x - s.x0) / 1.3))
    }
    const up = () => { const s = st.current; if (!s.active) return; s.active = false; s.backAt = performance.now() + 1500; gl.domElement.style.cursor = '' }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up)
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); gl.domElement.style.cursor = '' }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, camera])

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    if (!e.object.userData.slider || book.state.turn[0] > 0.02) return
    e.stopPropagation()
    const x = worldX(e.clientX, e.clientY)
    if (x === null) return
    const s = st.current; s.active = true; s.x0 = x; s.p0 = s.pull; s.backAt = 0
    gl.domElement.style.cursor = 'grabbing'
  }
  const onOver = (e: ThreeEvent<PointerEvent>) => { if (e.object.userData.slider && book.state.turn[0] < 0.02 && !st.current.active) gl.domElement.style.cursor = 'grab' }
  const onOut = (e: ThreeEvent<PointerEvent>) => { if (e.object.userData.slider && !st.current.active) gl.domElement.style.cursor = '' }

  useFrame(({ clock }, dtRaw) => {
    const s = st.current, dt = Math.min(dtRaw, 0.05), t = clock.elapsedTime
    s.p = still ? 1 : THREE.MathUtils.damp(s.p, shared.current.p, 4.5, dt)
    if (!s.active && s.backAt && performance.now() > s.backAt) { s.pullT = 0; s.backAt = 0 }
    s.pull = THREE.MathUtils.damp(s.pull, s.pullT, s.active ? 18 : 5, dt)
    book.update(s.p, t, s.pull, still)
    const bs = book.state
    // camera: a slow orbit round the book, higher over the closed cover, lower once the pop-ups stand
    const open = ss(0, 1, bs.turn[0])
    const az = still ? 0.2 : 0.3 * Math.sin(t * 0.17) + (s.p - 0.5) * 0.5
    const el = THREE.MathUtils.lerp(1.05, portrait ? 0.95 : 0.76, open)
    const dist = portrait ? THREE.MathUtils.lerp(8.6, 9.4, open) : THREE.MathUtils.lerp(7.6, 8.6, open)
    const tx = portrait ? 1.5 * open : 0, ty = 0.5 * open, tz = portrait ? 0.15 : 0.2
    camera.position.set(tx + Math.sin(az) * Math.cos(el) * dist, ty + Math.sin(el) * dist, tz + Math.cos(az) * Math.cos(el) * dist)
    camera.lookAt(tx, ty, tz)
    sparks.current.forEach((sp, i) => { const f = 1 + Math.sin(t * 9 + i * 3.1) * 0.08 + Math.sin(t * 21 + i) * 0.05; sp.scale.set(0.34 * f, 0.4 * f, 1) })
    lamps.current.forEach((l, i) => { l.intensity = 9 * (1 + Math.sin(t * 8 + i * 2) * 0.07 + Math.sin(t * 19 + i) * 0.04) })
    onFrame(bs)
    // keep the recorder's drag script pointing at the tab
    if (t - s.stepsAt > 0.4 && typeof window !== 'undefined') {
      s.stepsAt = t
      const base = ray.tmp.set(bs.bookX + 3.17, 0.17, 0.7).project(camera)
      const far = ray.tmp2.set(bs.bookX + 3.17 + 1.3, 0.17, 0.7).project(camera)
      const fx = (base.x + 1) / 2, fy = (1 - base.y) / 2, dx = (far.x - base.x) / 2
      if (!s.active && s.pull < 0.05 && bs.turn[0] < 0.02 && fx > 0 && fx < 1 && fy > 0 && fy < 1) {
        window.__labDemoSteps = [
          { type: 'move', x: fx - 0.08, y: fy - 0.1, ms: 300 }, { type: 'move', x: fx, y: fy, ms: 500 }, { type: 'wait', ms: 250 }, { type: 'down', x: fx, y: fy },
          { type: 'move', x: fx + dx * 0.4, y: fy, ms: 450 }, { type: 'move', x: fx + dx * 0.85, y: fy + 0.01, ms: 600 }, { type: 'wait', ms: 700 },
          { type: 'up', x: fx + dx * 0.85, y: fy + 0.01 },
        ]
      }
    }
    if (++s.frames === 4) onReady()
  })
  useEffect(() => () => { delete window.__labDemoSteps }, [])

  return (
    <>
      <hemisphereLight args={['#fff1d6', '#17352A', 0.75]} />
      <directionalLight position={[-3.5, 8, 5.5]} intensity={2.3} color="#ffe3b8" castShadow shadow-mapSize={light ? [1024, 1024] : [2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.02}
        shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-camera-near={1} shadow-camera-far={22} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.026, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial map={cloth} roughness={1} />
      </mesh>
      {[-3.1, 3.2].map((x, i) => (
        <group key={x} position={[x, 0, i ? -0.6 : -0.9]}>
          <mesh position={[0, 0.03, 0]} castShadow><cylinderGeometry args={[0.2, 0.24, 0.06, 20]} /><meshStandardMaterial color="#C99A3E" metalness={0.7} roughness={0.35} /></mesh>
          <mesh position={[0, 0.5, 0]} castShadow><cylinderGeometry args={[0.04, 0.05, 0.9, 14]} /><meshStandardMaterial color="#C99A3E" metalness={0.7} roughness={0.35} /></mesh>
          <mesh position={[0, 1.18, 0]} castShadow><cylinderGeometry args={[0.065, 0.07, 0.62, 14]} /><meshStandardMaterial color="#FFF8EA" roughness={0.6} /></mesh>
          <sprite ref={(el) => { if (el) sparks.current[i] = el }} position={[0, 1.66, 0]} scale={[0.34, 0.4, 1]}>
            <spriteMaterial map={flame} blending={THREE.AdditiveBlending} depthWrite={false} transparent />
          </sprite>
          <pointLight ref={(el) => { if (el) lamps.current[i] = el }} position={[0, 1.75, 0.2]} color="#ffb04f" intensity={9} distance={9} decay={1.6} />
        </group>
      ))}
      <primitive object={book.root} onPointerDown={onDown} onPointerOver={onOver} onPointerOut={onOut} />
    </>
  )
}
