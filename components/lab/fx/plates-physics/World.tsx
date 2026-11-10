'use client'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Html, Lightformer } from '@react-three/drei'
import { CuboidCollider, CylinderCollider, Physics, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { COL, REST, Bowl, Cutlery, Glass, Plate } from './Parts'
import { mulberry32, type DishInfo, type Kind, type Layout, type Spec } from './layout'

type Bodies = Map<string, RapierRigidBody>
const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0 }
const GRAVITY: [number, number, number] = [0, -48, 0]

function Item({ spec, reduced, bodies, onGrab }: { spec: Spec; reduced: boolean; bodies: Bodies; onGrab: (id: string) => void }) {
  const { pos, rot } = useMemo(() => {
    const r = mulberry32(hash(spec.id))
    const dish = spec.dish !== undefined
    const tilt = spec.kind === 'plate' ? 0.42 : spec.kind === 'bowl' ? 0.14 : spec.kind === 'glass' ? 0.12 : 0.3
    const rest = REST[spec.kind]
    if (reduced) return { pos: [spec.x, rest, spec.z] as [number, number, number], rot: [0, spec.rot, 0] as [number, number, number] }
    return {
      pos: [spec.x + (r() - 0.5) * 0.5, (dish ? 5.5 : 3.2) + r() * 2.2, spec.z + (r() - 0.5) * 0.5] as [number, number, number],
      rot: [(r() - 0.5) * 2 * tilt, spec.rot + r() * 0.8, (r() - 0.5) * 2 * tilt] as [number, number, number],
    }
  }, [spec, reduced])
  const k: Kind = spec.kind
  const ceramicFeel = { friction: 0.7, restitution: 0.28 }
  return (
    <RigidBody
      ref={(b) => { if (b) bodies.set(spec.id, b); else bodies.delete(spec.id) }}
      type={reduced ? 'fixed' : 'dynamic'} colliders={false} position={pos} rotation={rot}
      ccd linearDamping={0.12} angularDamping={0.5}
    >
      {k === 'plate' && <CylinderCollider args={[0.07, 0.86]} {...ceramicFeel} />}
      {k === 'bowl' && <CylinderCollider args={[0.2, 0.55]} {...ceramicFeel} />}
      {k === 'glass' && <CylinderCollider args={[0.35, 0.21]} friction={0.4} restitution={0.15} />}
      {(k === 'fork' || k === 'knife' || k === 'spoon') && <CuboidCollider args={[0.1, 0.03, 0.62]} position={[0, 0, -0.2]} friction={0.5} restitution={0.2} />}
      <group
        onPointerDown={(e) => { e.stopPropagation(); onGrab(spec.id) }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'grab' }}
        onPointerOut={() => { document.body.style.cursor = '' }}
      >
        {k === 'plate' && <Plate dish={spec.dish} />}
        {k === 'bowl' && <Bowl />}
        {k === 'glass' && <Glass wine={spec.wine} />}
        {(k === 'fork' || k === 'knife' || k === 'spoon') && <Cutlery kind={k} />}
      </group>
    </RigidBody>
  )
}

function Candle({ x, z, seed }: { x: number; z: number; seed: number }) {
  const light = useRef<THREE.PointLight>(null)
  const flame = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const f = 1 + Math.sin(t * 9 + seed) * 0.06 + Math.sin(t * 23 + seed * 3) * 0.05
    if (light.current) light.current.intensity = 70 * f
    if (flame.current) flame.current.scale.set(0.8 * f, 1.5 * f, 0.8 * f)
  })
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.06, 0]} castShadow><cylinderGeometry args={[0.28, 0.34, 0.12, 24]} /><meshStandardMaterial color="#C79A45" metalness={1} roughness={0.3} /></mesh>
      <mesh position={[0, 0.55, 0]} castShadow><cylinderGeometry args={[0.1, 0.11, 0.9, 20]} /><meshStandardMaterial color={COL.wax} roughness={0.6} /></mesh>
      <mesh ref={flame} position={[0, 1.13, 0]}><sphereGeometry args={[0.075, 12, 10]} /><meshBasicMaterial color="#FFD27A" toneMapped={false} /></mesh>
      <pointLight ref={light} position={[0, 1.3, 0]} color="#F6B94F" intensity={34} distance={0} decay={2} />
    </group>
  )
}

function Cloth({ W, D, light }: { W: number; D: number; light: boolean }) {
  const map = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 128
    const g = c.getContext('2d')!
    g.fillStyle = '#fff'; g.fillRect(0, 0, 128, 128)
    const r = mulberry32(7)
    for (let i = 0; i < 128; i += 2) { g.fillStyle = `rgba(0,0,0,${0.05 + r() * 0.07})`; g.fillRect(i, 0, 1, 128); g.fillStyle = `rgba(0,0,0,${0.04 + r() * 0.06})`; g.fillRect(0, i, 128, 1) }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(W * 3, D * 3); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = light ? 2 : 8
    return t
  }, [W, D, light])
  useEffect(() => () => map.dispose(), [map])
  return (
    <>
      <RigidBody type="fixed" colliders={false}><CuboidCollider args={[W, 0.25, D]} position={[0, -0.25, 0]} friction={0.85} restitution={0.1} /></RigidBody>
      <mesh position={[0, -0.25, 0]} receiveShadow castShadow>
        <boxGeometry args={[W * 2, 0.5, D * 2]} />
        <meshStandardMaterial color={COL.cloth} map={map} roughness={0.95} />
      </mesh>
    </>
  )
}

function Sweeper({ W, D, cleared, bodies }: { W: number; D: number; cleared: boolean; bodies: Bodies }) {
  const ref = useRef<RapierRigidBody>(null)
  const t = useRef(0)
  useFrame((_, dt) => {
    const b = ref.current; if (!b) return
    if (cleared) { t.current += Math.min(dt, 0.05); if (t.current < 3.2) bodies.forEach((x) => x.wakeUp()) }
    const u = Math.min(1, t.current / 2.4)
    const z = -D - 0.5 + (2 * D + 4.2) * Math.pow(u, 1.5)
    b.setNextKinematicTranslation({ x: 0, y: 0.5, z })
    if (cleared && u < 1) {
      // belt and braces: anything the bar has passed is carried along, so thin cutlery never gets left behind
      const vz = ((2 * D + 4.2) * 1.5 * Math.sqrt(u)) / 2.4
      bodies.forEach((x) => {
        const p = x.translation()
        if (x.isEnabled() && p.z < z + 0.5 && p.y < 1.6) { const lv = x.linvel(); if (lv.z < vz + 1) x.setLinvel({ x: lv.x, y: lv.y, z: vz + 1.5 }, true) }
      })
    }
  })
  return <RigidBody ref={ref} type="kinematicPosition" colliders={false} position={[0, 0.5, -D - 0.5]}><CuboidCollider args={[W + 3, 0.5, 0.2]} /></RigidBody>
}

function Rig({ layout, compact }: { layout: Layout; compact: boolean }) {
  const { camera, size } = useThree()
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    const aspect = size.width / size.height
    const tf = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2))
    const dW = (layout.W + (compact ? 0.5 : 0.9)) / (tf * aspect)
    const dD = ((layout.D + 1.8) / tf) * 0.7
    const d = Math.max(dW, dD) * (compact ? 1 : 1.22)
    const dir = compact ? new THREE.Vector3(0, 0.92, 0.4).normalize() : new THREE.Vector3(0, 0.8, 0.6)
    const target = new THREE.Vector3(0, 0, compact ? -1.3 : -0.2)
    cam.position.copy(target).addScaledVector(dir, d)
    cam.lookAt(target); cam.updateProjectionMatrix(); cam.updateMatrixWorld()
  }, [camera, size, layout, compact])
  return null
}

/** Window-level drag: kinematic while held, released with the pointer's velocity. */
function Drag({ bodies, layout, ctl }: { bodies: Bodies; layout: Layout; ctl: MutableRefObject<{ grab: (id: string) => void }> }) {
  const { camera, gl } = useThree()
  const st = useRef<{ body: RapierRigidBody; target: THREE.Vector3; vel: THREE.Vector3; cur: THREE.Vector3 } | null>(null)
  const ray = useMemo(() => new THREE.Raycaster(), [])
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.7), [])
  const ndc = useMemo(() => new THREE.Vector2(), [])
  const hit = useMemo(() => new THREE.Vector3(), [])
  useEffect(() => {
    const aim = (e: PointerEvent) => {
      const r = gl.domElement.getBoundingClientRect()
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      ray.setFromCamera(ndc, camera)
      if (st.current && ray.ray.intersectPlane(plane, hit)) {
        st.current.target.set(THREE.MathUtils.clamp(hit.x, -layout.W - 1, layout.W + 1), 0.7, THREE.MathUtils.clamp(hit.z, -layout.D - 1, layout.D + 1))
      }
    }
    const up = () => {
      const s = st.current; if (!s) return
      st.current = null; document.body.style.cursor = ''
      s.body.setBodyType(0, true)
      const v = s.vel.clone(); if (v.length() > 26) v.setLength(26)
      s.body.setLinvel({ x: v.x, y: Math.max(v.y, 0) - 1, z: v.z }, true)
      s.body.setAngvel({ x: v.z * 0.15, y: (v.x - v.z) * 0.3, z: -v.x * 0.15 }, true)
    }
    window.addEventListener('pointermove', aim); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up)
    ctl.current.grab = (id) => {
      const b = bodies.get(id); if (!b) return
      const p = b.translation()
      b.setBodyType(2, true)
      b.setLinvel({ x: 0, y: 0, z: 0 }, true); b.setAngvel({ x: 0, y: 0, z: 0 }, true)
      st.current = { body: b, target: new THREE.Vector3(p.x, 0.7, p.z), vel: new THREE.Vector3(), cur: new THREE.Vector3(p.x, p.y, p.z) }
      document.body.style.cursor = 'grabbing'
    }
    return () => { window.removeEventListener('pointermove', aim); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); st.current = null; document.body.style.cursor = '' }
  }, [camera, gl, layout, bodies, ctl, ndc, ray, plane, hit])
  useFrame((_, dt0) => {
    const dt = Math.max(1 / 240, Math.min(dt0, 0.05))
    const s = st.current
    if (s) {
      const next = s.cur.clone().lerp(s.target, 1 - Math.exp(-16 * dt))
      const v = next.clone().sub(s.cur).divideScalar(dt)
      s.vel.lerp(v, 0.35)
      s.cur.copy(next)
      s.body.setNextKinematicTranslation(next)
    }
    bodies.forEach((b) => { if (b.isEnabled() && b.translation().y < -14) b.setEnabled(false) })
  })
  return null
}

function Label({ x, z, i, dish, hidden, compact }: { x: number; z: number; i: number; dish: DishInfo; hidden: boolean; compact: boolean }) {
  return (
    <Html position={[x, compact ? 1.6 : 2.0, z]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div style={{ opacity: hidden ? 0 : 1, transition: 'opacity .45s', transform: `translateY(${i % 2 && !compact ? -34 : 0}px)` }}>
      <div className="pp-label" style={{ width: compact ? 118 : 176 }}>
        <p style={{ fontFamily: 'var(--font-gilda), serif', fontSize: compact ? 14 : 18, lineHeight: 1.15 }}>{dish.name}</p>
        <p style={{ fontSize: compact ? 11.5 : 13, marginTop: 3, opacity: 0.8 }}>{dish.category}</p>
      </div></div>
    </Html>
  )
}

export default function World({ layout, dishes, dropped, cleared, reduced, light, compact, paused, ctl, setDemo }: {
  layout: Layout; dishes: DishInfo[]; dropped: number; cleared: boolean; reduced: boolean; light: boolean; compact: boolean; paused: boolean
  ctl: MutableRefObject<{ grab: (id: string) => void }>; setDemo: (steps: NonNullable<Window['__labDemoSteps']>) => void
}) {
  const bodies = useMemo<Bodies>(() => new Map(), [])
  const [live, setLive] = useState<string[]>(reduced ? layout.initial.map((s) => s.id) : [])
  const { camera, size } = useThree()
  useEffect(() => {
    if (reduced) return
    const ids = layout.initial.map((s) => setTimeout(() => setLive((l) => [...l, s.id]), s.delay * 1000))
    return () => ids.forEach(clearTimeout)
  }, [layout, reduced])

  const dishSpecs = useMemo<Spec[]>(() => dishes.slice(0, layout.spots.length).map((_, i) => ({ id: `dish-${i}`, kind: 'plate', x: layout.spots[i][0], z: layout.spots[i][1], rot: i * 0.9, delay: 0, dish: i })), [dishes, layout])

  // demo: grab the first plate (left), toss it across the table
  useEffect(() => {
    if (reduced) return
    const first = layout.initial[0]
    const v = new THREE.Vector3(first.x, 0.15, first.z).project(camera)
    const sx = (v.x + 1) / 2, sy = (1 - v.y) / 2
    const dx = compact ? 0.3 : 0.2, dy = compact ? 0.0 : -0.02
    setDemo([
      { type: 'wait', ms: 1300 }, { type: 'move', x: sx, y: sy, ms: 400 }, { type: 'down', x: sx, y: sy },
      { type: 'move', x: sx + dx * 0.3, y: sy + dy * 0.3, ms: 220 }, { type: 'move', x: sx + dx * 0.7, y: sy + dy * 0.7, ms: 120 },
      { type: 'move', x: sx + dx, y: sy + dy, ms: 60 }, { type: 'up', x: sx + dx * 1.1, y: sy + dy * 1.1 }, { type: 'wait', ms: 1500 },
    ])
  }, [camera, size, layout, reduced, compact, setDemo])

  const shadowSize = light ? 1024 : 2048
  return (
    <>
      <color attach="background" args={['#0b120f']} />
      <Rig layout={layout} compact={compact} />
      <ambientLight intensity={1.1} color="#FFE9C4" />
      <directionalLight position={[-3, 11, 6]} intensity={4} color="#FFE0AE" castShadow shadow-mapSize={[shadowSize, shadowSize]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-bias={-0.0004} shadow-normalBias={0.03} />
      <Environment resolution={64} frames={1} environmentIntensity={1.3}>
        <Lightformer form="rect" intensity={0.9} color="#FFE6BF" position={[0, 10, 0]} scale={[30, 30, 1]} rotation={[Math.PI / 2, 0, 0]} />
        <Lightformer form="rect" intensity={1.2} color="#FFD9A0" position={[0, 3, 9]} scale={[20, 5, 1]} />
        <Lightformer form="rect" intensity={3} color="#FFD9A0" position={[-4, 5, 3]} scale={[8, 3, 1]} rotation={[0.6, 0.5, 0]} />
        <Lightformer form="rect" intensity={2} color="#FFF1D8" position={[5, 6, -3]} scale={[6, 3, 1]} rotation={[0.9, -0.6, 0]} />
        <Lightformer form="ring" intensity={1.2} color="#A9C3AE" position={[0, 8, 0]} scale={6} rotation={[Math.PI / 2, 0, 0]} />
      </Environment>
      {layout.candles.map(([x, z], i) => <Candle key={i} x={x} z={z} seed={i * 2.1} />)}
      <Physics gravity={GRAVITY} paused={paused || reduced}>
        <Cloth W={layout.W} D={layout.D} light={light} />
        <Sweeper W={layout.W} D={layout.D} cleared={cleared} bodies={bodies} />
        {layout.initial.filter((s) => live.includes(s.id)).map((s) => <Item key={s.id} spec={s} reduced={reduced} bodies={bodies} onGrab={(id) => ctl.current.grab(id)} />)}
        {dishSpecs.slice(0, dropped).map((s) => <Item key={s.id} spec={s} reduced={reduced} bodies={bodies} onGrab={(id) => ctl.current.grab(id)} />)}
        <Drag bodies={bodies} layout={layout} ctl={ctl} />
      </Physics>
      {dishSpecs.slice(0, dropped).map((s, i) => <Label key={s.id} i={i} x={s.x} z={s.z} dish={dishes[i]} hidden={cleared} compact={compact} />)}
    </>
  )
}
