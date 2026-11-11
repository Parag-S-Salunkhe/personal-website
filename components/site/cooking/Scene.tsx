'use client'
// Ported from components/lab/fx/popup-book/Scene.tsx: no pull-tab, scroll drives the book, the cloth matches the site.
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
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

type Props = { assets: Assets; shared: Shared; still: boolean; light: boolean; onFrame: (s: BookState) => void; onReady: () => void }

export default function Scene({ assets, shared, still, light, onFrame, onReady }: Props) {
  const { camera, size, scene } = useThree()
  const portrait = size.height > size.width * 0.95
  const book = useMemo(() => createBook(assets), [assets])
  useEffect(() => () => book.dispose(), [book])
  const cloth = useMemo(() => clothTexture(), [])
  const flame = useMemo(() => flameTex(), [])
  useEffect(() => () => { cloth.dispose(); flame.dispose() }, [cloth, flame])
  useEffect(() => {
    scene.background = new THREE.Color('#10281F'); scene.fog = new THREE.FogExp2('#10281F', 0.028)
    const cam = camera as THREE.PerspectiveCamera
    cam.fov = portrait ? 46 : 34; cam.near = 0.1; cam.far = 60; cam.updateProjectionMatrix()
    return () => { scene.fog = null }
  }, [scene, camera, portrait])

  const st = useRef({ p: 0, frames: 0 })
  const sparks = useRef<THREE.Sprite[]>([])
  const lamps = useRef<THREE.PointLight[]>([])

  useFrame(({ clock }, dtRaw) => {
    const s = st.current, dt = Math.min(dtRaw, 0.05), t = clock.elapsedTime
    s.p = still ? 1 : THREE.MathUtils.damp(s.p, shared.current.p, 4.5, dt)
    book.update(s.p, still)
    const bs = book.state
    // camera: a slow orbit round the book, higher over the closed cover, lower once the pop-ups stand
    const open = ss(0, 1, bs.turn[0])
    const az = still ? 0.2 : 0.3 * Math.sin(t * 0.17) + (s.p - 0.5) * 0.5
    const el = THREE.MathUtils.lerp(1.05, portrait ? 0.95 : 0.76, open)
    const dist = portrait ? THREE.MathUtils.lerp(8.6, 9.4, open) : THREE.MathUtils.lerp(7.6, 8.6, open)
    // phone: show the left page (the dish), then pan to the pop-up page as it rises
    const rise = still ? 1 : Math.max(0, ...bs.r)
    const tx = portrait ? open * THREE.MathUtils.lerp(-1.35, 1.45, ss(0.05, 0.8, rise)) : 0, ty = 0.5 * open, tz = portrait ? 0.15 : 0.2
    camera.position.set(tx + Math.sin(az) * Math.cos(el) * dist, ty + Math.sin(el) * dist, tz + Math.cos(az) * Math.cos(el) * dist)
    camera.lookAt(tx, ty, tz)
    sparks.current.forEach((sp, i) => { const f = still ? 1 : 1 + Math.sin(t * 9 + i * 3.1) * 0.08 + Math.sin(t * 21 + i) * 0.05; sp.scale.set(0.34 * f, 0.4 * f, 1) })
    lamps.current.forEach((l, i) => { l.intensity = 9 * (still ? 1 : 1 + Math.sin(t * 8 + i * 2) * 0.07 + Math.sin(t * 19 + i) * 0.04) })
    onFrame(bs)
    if (++s.frames === 4) onReady()
  })

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
      <primitive object={book.root} />
    </>
  )
}
