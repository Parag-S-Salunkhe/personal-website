'use client'
// Ported from components/lab/table-for-eight/ (run 2 home).
import { useEffect, useLayoutEffect, useMemo, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { AccumulativeShadows, ContactShadows, Environment, Lightformer, RandomizedLight } from '@react-three/drei'
import { CANDLES, SEATS, TABLE_H, TABLE_L, TABLE_W, type SeatCard } from './seats'
import Props from './Props'
import type { StageData } from './content'
import { SceneEnv } from './SceneEnv'
import { bowlGeo, chairGeos, chargerGeo, decanterGeo, decanterWineGeo, drapeGeo, duskCanvas, flameGeo, forkGeo, glassGeo, holderGeo, knifeGeo, napkinGeo, plankCanvas, plateGeo, potBodyGeo, potLidGeo, saladData, spoonGeo, weaveCanvas, wineGeo } from './parts'

const FLAME_VERT = /* glsl */ `
uniform float uTime; uniform float uSeed;
varying vec3 vN; varying vec3 vV; varying float vH;
void main(){
  float h = clamp(position.y / 0.1, 0.0, 1.0);
  vec3 p = position;
  float fl = 0.78 + 0.16 * sin(uTime * 11.0 + uSeed) + 0.1 * sin(uTime * 23.0 + uSeed * 2.0);
  p.y *= fl;
  p.x += (sin(uTime * 7.0 + uSeed + p.y * 55.0) * 0.004 + sin(uTime * 3.1 + uSeed * 1.7) * 0.004) * h * h * 3.0;
  p.z += cos(uTime * 6.0 + uSeed * 1.3) * 0.004 * h * h * 3.0;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  vH = h;
  gl_Position = projectionMatrix * mv;
}`
const FLAME_FRAG = /* glsl */ `
varying vec3 vN; varying vec3 vV; varying float vH;
void main(){
  float f = pow(clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0), 1.4);
  vec3 blue = vec3(0.25, 0.45, 1.0) * 1.2;
  vec3 core = vec3(1.0, 0.82, 0.42) * 4.2;
  vec3 tip = vec3(1.0, 0.42, 0.1) * 2.4;
  vec3 col = mix(blue, core, smoothstep(0.0, 0.28, vH));
  col = mix(col, tip, smoothstep(0.35, 1.0, vH));
  float a = f * (1.0 - vH * 0.55);
  gl_FragColor = vec4(col * a, a);
}`

type Shared = MutableRefObject<{ p: number; s: number; lit?: number }>
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

const flareTex = () => {
  const c = document.createElement('canvas'); c.width = c.height = 64
  const x = c.getContext('2d')!
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,214,140,.7)'); g.addColorStop(1, 'rgba(255,160,60,0)')
  x.fillStyle = g; x.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

/** Candles light one by one on arrival (match-strike flare, flame grows, light blooms), then burn down with the scroll. */
function Candles({ shared, light, still }: { shared: Shared; light: boolean; still: boolean }) {
  const wax = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FFF8EA', roughness: 0.5, emissive: '#ff9a40', emissiveIntensity: 0.3 }), [])
  const brass = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c79a4a', metalness: 0.9, roughness: 0.32 }), [])
  const holder = useMemo(() => holderGeo(), [])
  const flame = useMemo(() => flameGeo(), [])
  const mats = useMemo(() => CANDLES.map((_, i) => new THREE.ShaderMaterial({ vertexShader: FLAME_VERT, fragmentShader: FLAME_FRAG, uniforms: { uTime: { value: 0 }, uSeed: { value: i * 1.7 + 0.3 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide })), [])
  const ftex = useMemo(() => flareTex(), [])
  const fmats = useMemo(() => CANDLES.map(() => new THREE.SpriteMaterial({ map: ftex, color: new THREE.Color(5, 3.4, 1.6), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0 })), [ftex])
  useEffect(() => () => { ftex.dispose(); fmats.forEach((m) => m.dispose()) }, [ftex, fmats])
  const t0 = useRef<number | null>(null)
  const bodies = useRef<(THREE.Mesh | null)[]>([])
  const flames = useRef<(THREE.Mesh | null)[]>([])
  const flares = useRef<(THREE.Sprite | null)[]>([])
  const lights = useRef<(THREE.PointLight | null)[]>([])
  const lit = light ? [1, 3] : [0, 1, 2, 3, 4]
  useFrame(({ clock }) => {
    if (t0.current === null) t0.current = clock.elapsedTime
    const t = still ? 2.4 : clock.elapsedTime - t0.current
    const p = shared.current.p
    const ig = still ? 99 : Math.max(t - 0.35, (p - 0.02) * 60) // seconds since the first strike; the first strike comes as the warm flood clears
    const burn = (1 - 0.4 * smooth(0.05, 1, p)) * (1 - 0.8 * smooth(0.9, 1, p)) // the candles shrink in the last part of the table
    const dim = 1 - 0.45 * smooth(0.86, 1, p)
    let sum = 0
    CANDLES.forEach((c, i) => {
      const u = ig - i * 0.6 // seconds since this candle's strike
      const on = Math.min(1, Math.max(0, u / 0.45))
      const grow = on * on * (3 - 2 * on)
      sum += grow
      const top = TABLE_H + 0.1 + c.h * burn
      const b = bodies.current[i]
      if (b) { b.scale.y = c.h * burn; b.position.y = TABLE_H + 0.1 + (c.h * burn) / 2 }
      const f = flames.current[i]
      if (f) { f.position.y = top - 0.002; f.scale.setScalar(Math.max(0.001, 1.5 * grow * (1 + 0.5 * Math.exp(-Math.max(0, u - 0.2) * 5) * (u > 0 ? 1 : 0)))) }
      const fl = flares.current[i]
      if (fl) { fl.position.y = top + 0.03; const fk = u > 0 && u < 1.2 ? Math.sin(Math.min(1, u / 0.12) * Math.PI / 2) * Math.exp(-u * 3.2) : 0; fl.scale.setScalar(0.04 + 0.36 * fk); fmats[i].opacity = Math.min(1, fk * 1.4) }
      mats[i].uniforms.uTime.value = t
      const l = lights.current[i]
      if (l) {
        const k = 1 + 0.14 * Math.sin(t * 13 + i * 2.1) + 0.09 * Math.sin(t * 27.3 + i * 5.7) + 0.05 * Math.sin(t * 41 + i)
        const spike = 1 + 1.8 * Math.exp(-Math.max(0, u) * 7) * (u > 0 ? 1 : 0)
        l.intensity = (light ? 2.6 : 1.5) * k * grow * spike * (0.55 + 0.45 * dim)
        l.position.y = top + 0.05
      }
    })
    shared.current.lit = sum / CANDLES.length
  })
  return (
    <>
      {CANDLES.map((c, i) => (
        <group key={i} position={[c.x, 0, c.z]}>
          <mesh geometry={holder} material={brass} position={[0, TABLE_H, 0]} castShadow />
          <mesh ref={(m) => { bodies.current[i] = m }} material={wax} castShadow>
            <cylinderGeometry args={[0.017, 0.019, 1, 20]} />
          </mesh>
          <mesh ref={(m) => { flames.current[i] = m }} geometry={flame} material={mats[i]} scale={[0.001, 0.001, 0.001]} renderOrder={5} />
          <sprite ref={(m) => { flares.current[i] = m }} material={fmats[i]} renderOrder={6} />
          {lit.includes(i) && <pointLight ref={(l) => { lights.current[i] = l }} color="#ff9a3c" distance={9} decay={2} position={[0, TABLE_H + 0.5, 0]} intensity={0} />}
        </group>
      ))}
    </>
  )
}

function useCardTextures(cards: SeatCard[]) {
  const gl = useThree((s) => s.gl)
  const textures = useMemo(() => cards.map(() => {
    const c = document.createElement('canvas')
    c.width = 512; c.height = 300
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    return t
  }), [cards])
  useEffect(() => {
    let alive = true
    const family = getComputedStyle(gl.domElement).getPropertyValue('--font-pinyon').trim() || 'cursive'
    const draw = () => textures.forEach((t, i) => {
      const c = t.image as HTMLCanvasElement
      const x = c.getContext('2d')!
      x.fillStyle = '#F6F1E4'; x.fillRect(0, 0, 512, 300)
      x.strokeStyle = '#B88A44'; x.lineWidth = 3; x.strokeRect(14, 14, 484, 272)
      x.lineWidth = 1; x.strokeRect(24, 24, 464, 252)
      x.fillStyle = '#5a1626'; x.textAlign = 'center'; x.textBaseline = 'middle'
      x.font = `120px ${family}`
      x.fillText(cards[i].name, 256, 150)
      t.needsUpdate = true
    })
    draw()
    document.fonts.load(`100px ${family}`).then(() => { if (alive) draw() }).catch(() => {})
    return () => { alive = false }
  }, [gl, textures, cards])
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures])
  return textures
}

function Settings({ cards, shared, still }: { cards: SeatCard[]; shared: Shared; still: boolean }) {
  const flips = useRef<(THREE.Group | null)[]>([])
  const g = useMemo(() => ({ plate: plateGeo(), charger: chargerGeo(), glass: glassGeo(), wine: wineGeo(), fork: forkGeo(), knife: knifeGeo(), spoon: spoonGeo(), napkin: napkinGeo() }), [])
  const m = useMemo(() => ({
    plate: new THREE.MeshPhysicalMaterial({ color: '#F4F1EA', roughness: 0.22, clearcoat: 0.7, clearcoatRoughness: 0.2, side: THREE.DoubleSide }),
    charger: new THREE.MeshStandardMaterial({ color: '#b98c47', metalness: 0.85, roughness: 0.34, side: THREE.DoubleSide }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.03, metalness: 0, transparent: true, opacity: 0.2, clearcoat: 1, envMapIntensity: 2.2, side: THREE.DoubleSide, depthWrite: false }),
    wine: new THREE.MeshStandardMaterial({ color: '#7C2236', roughness: 0.08, emissive: '#3a0814', emissiveIntensity: 0.5 }),
    steel: new THREE.MeshStandardMaterial({ color: '#d9d9de', metalness: 1, roughness: 0.22 }),
    napkin: new THREE.MeshStandardMaterial({ color: '#A9C3AE', roughness: 1, envMapIntensity: 0.15 }),
    cardBack: new THREE.MeshStandardMaterial({ color: '#F6F1E4', roughness: 0.9 }),
  }), [])
  const tex = useCardTextures(cards)
  useFrame(() => {
    const sN = still ? 9 : shared.current.s
    flips.current.forEach((g, i) => {
      if (!g) return
      const k = smooth(0.12 + i * 0.1, 0.62 + i * 0.1, sN) // the cards stand up in turn as the camera cranes down
      const back = 1 + 1.70158 * 1, e = 1 + back * Math.pow(k - 1, 3) + 1.70158 * Math.pow(k - 1, 2) // ease out back: a small overshoot reads as a flip
      g.rotation.x = -Math.PI / 2 + (Math.PI / 2 - 0.28) * e
    })
  })
  return (
    <>
      {SEATS.map((s, i) => (
        <group key={s.key} position={s.pos} rotation={[0, Math.atan2(s.dir[0], s.dir[2]), 0]}>
          <mesh geometry={g.charger} material={m.charger} castShadow receiveShadow />
          <mesh geometry={g.plate} material={m.plate} position={[0, 0.012, 0]} castShadow receiveShadow />
          {![0, 1, 2, 3, 7].includes(i) && <mesh geometry={g.napkin} material={m.napkin} position={[0, 0.02, 0]} rotation={[0, 0.08 * (i % 3 - 1), 0]} castShadow />}
          <mesh geometry={g.fork} material={m.steel} position={[0.27, 0, -0.01]} castShadow />
          <mesh geometry={g.knife} material={m.steel} position={[-0.26, 0, -0.01]} castShadow />
          <mesh geometry={g.spoon} material={m.steel} position={[-0.3, 0, -0.01]} castShadow />
          <group position={[-0.17, 0, 0.24]}>
            <mesh geometry={g.glass} material={m.glass} castShadow renderOrder={3} />
            <mesh geometry={g.wine} material={m.wine} />
          </group>
          <group ref={(g) => { flips.current[i] = g }} position={[0.07, 0, 0.3]} rotation={[-0.28, Math.PI, 0]} scale={1.35}>
            <mesh position={[0, 0.034, 0]} castShadow>
              <planeGeometry args={[0.11, 0.066]} />
              <meshStandardMaterial map={tex[i]} emissiveMap={tex[i]} emissive="#ffffff" emissiveIntensity={0.55} roughness={0.85} side={THREE.FrontSide} />
            </mesh>
            <mesh position={[0, 0.034, 0.0015]} rotation={[0, Math.PI, 0]} material={m.cardBack}>
              <planeGeometry args={[0.11, 0.066]} />
            </mesh>
          </group>
        </group>
      ))}
    </>
  )
}

function Furniture({ light }: { light: boolean }) {
  const ch = useMemo(() => chairGeos(), [])
  const wood = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4a2d1b', roughness: 0.5 }), [])
  const cush = useMemo(() => new THREE.MeshStandardMaterial({ color: '#7C2236', roughness: 0.9 }), [])
  const weave = useMemo(() => { const t = new THREE.CanvasTexture(weaveCanvas()); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(36, 12); return t }, [])
  const cloth = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#17352A', roughness: 0.92, sheen: 1, sheenColor: new THREE.Color('#5f8f73'), sheenRoughness: 0.5, bumpMap: weave, bumpScale: 0.6 }), [weave])
  const linen = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#cfc9b8', roughness: 0.95, sheen: 0.6, sheenColor: new THREE.Color('#e8dcc0'), sheenRoughness: 0.6 }), [])
  const dL = useMemo(() => drapeGeo(TABLE_L + 0.4, 0.55), [])
  const dW = useMemo(() => drapeGeo(TABLE_W + 0.4, 0.55), [])
  const side = { color: '#10281F', roughness: 0.95, side: THREE.DoubleSide } as const
  const hang = useMemo(() => new THREE.MeshStandardMaterial(side), []) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      {/* cloth top, drapes, runner */}
      <mesh position={[0, TABLE_H - 0.012, 0]} receiveShadow material={cloth}>
        <boxGeometry args={[TABLE_L + 0.4, 0.024, TABLE_W + 0.4]} />
      </mesh>
      <mesh geometry={dL} material={hang} position={[0, TABLE_H - 0.02, (TABLE_W + 0.4) / 2]} />
      <mesh geometry={dL} material={hang} position={[0, TABLE_H - 0.02, -(TABLE_W + 0.4) / 2]} rotation={[0, Math.PI, 0]} />
      <mesh geometry={dW} material={hang} position={[(TABLE_L + 0.4) / 2, TABLE_H - 0.02, 0]} rotation={[0, Math.PI / 2, 0]} />
      <mesh geometry={dW} material={hang} position={[-(TABLE_L + 0.4) / 2, TABLE_H - 0.02, 0]} rotation={[0, -Math.PI / 2, 0]} />
      <mesh position={[0, TABLE_H + 0.002, 0]} material={linen} receiveShadow>
        <boxGeometry args={[TABLE_L - 0.7, 0.004, 0.3]} />
      </mesh>
      {/* chairs */}
      {SEATS.map((s) => {
        const px = s.pos[0] - s.dir[0] * 0.74, pz = s.pos[2] - s.dir[2] * 0.74
        return (
          <group key={s.key} position={[px, 0, pz]} rotation={[0, Math.atan2(s.dir[0], s.dir[2]) + (s.key === 'you-a' ? 0.05 : s.key === 'you-b' ? -0.1 : 0), 0]}>
            <mesh geometry={ch.wood} material={wood} />
            <mesh geometry={ch.cushion} material={cush} />
          </group>
        )
      })}
    </>
  )
}

function Dishes() {
  const body = useMemo(() => potBodyGeo(), [])
  const lid = useMemo(() => potLidGeo(), [])
  const bowl = useMemo(() => bowlGeo(), [])
  const dec = useMemo(() => decanterGeo(), [])
  const decW = useMemo(() => decanterWineGeo(), [])
  const enamel = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#7C2236', roughness: 0.28, clearcoat: 0.8, side: THREE.DoubleSide }), [])
  const white = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#F4F1EA', roughness: 0.25, clearcoat: 0.6, side: THREE.DoubleSide }), [])
  const woodMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b98a56', roughness: 0.6 }), [])
  const crust = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b8742f', roughness: 0.75 }), [])
  const crumb = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ecd29a', roughness: 0.9 }), [])
  const glassM = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#fff', roughness: 0.03, transparent: true, opacity: 0.2, clearcoat: 1, envMapIntensity: 2.2, side: THREE.DoubleSide, depthWrite: false }), [])
  const wineM = useMemo(() => new THREE.MeshStandardMaterial({ color: '#7C2236', roughness: 0.08, emissive: '#3a0814', emissiveIntensity: 0.5 }), [])
  const salad = useMemo(() => saladData(), [])
  const leaves = useRef<THREE.InstancedMesh>(null)
  const toms = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    salad.leaves.forEach((l, i) => { leaves.current?.setMatrixAt(i, l.m); leaves.current?.setColorAt(i, l.c) })
    salad.toms.forEach((t, i) => toms.current?.setMatrixAt(i, t))
    if (leaves.current) { leaves.current.instanceMatrix.needsUpdate = true; if (leaves.current.instanceColor) leaves.current.instanceColor.needsUpdate = true }
    if (toms.current) toms.current.instanceMatrix.needsUpdate = true
  }, [salad])
  const y = TABLE_H + 0.004
  return (
    <>
      {/* bread board */}
      <group position={[-1.65, y, 0.02]} rotation={[0, 0.12, 0]}>
        <mesh material={woodMat} position={[0, 0.01, 0]} castShadow receiveShadow><boxGeometry args={[0.5, 0.02, 0.23]} /></mesh>
        <mesh material={crust} position={[-0.06, 0.06, 0]} scale={[0.13, 0.062, 0.075]} castShadow><sphereGeometry args={[1, 24, 16]} /></mesh>
        {[-0.05, -0.015, 0.02].map((x, i) => <mesh key={i} material={crumb} position={[-0.06 + x, 0.119, 0]} rotation={[0, 0.9, 0]}><boxGeometry args={[0.07, 0.004, 0.009]} /></mesh>)}
        <mesh material={crust} position={[0.13, 0.04, 0.05]} rotation={[0, 0.4, Math.PI / 2]} castShadow><cylinderGeometry args={[0.025, 0.025, 0.2, 16]} /></mesh>
        {[0.17, 0.2].map((x, i) => <mesh key={i} material={crumb} position={[x, 0.032, -0.06]} rotation={[0.1 * i, 0, 0.1]} castShadow><cylinderGeometry args={[0.04, 0.04, 0.012, 20]} /></mesh>)}
      </group>
      {/* pot */}
      <group position={[-0.3, y, 0.01]}>
        <mesh geometry={body} material={enamel} castShadow receiveShadow />
        <mesh geometry={lid} material={enamel} castShadow />
        <mesh material={enamel} position={[0, 0.215, 0]} castShadow><sphereGeometry args={[0.022, 16, 12]} /></mesh>
        {[-1, 1].map((s) => <mesh key={s} material={enamel} position={[s * 0.158, 0.12, 0]} rotation={[0, 0, 0]} castShadow><torusGeometry args={[0.028, 0.008, 8, 18]} /></mesh>)}
      </group>
      {/* salad bowl */}
      <group position={[0.92, y, -0.01]}>
        <mesh geometry={bowl} material={white} castShadow receiveShadow />
        <instancedMesh ref={leaves} args={[undefined, undefined, salad.leaves.length]} castShadow>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial roughness={0.6} />
        </instancedMesh>
        <instancedMesh ref={toms} args={[undefined, undefined, salad.toms.length]} castShadow>
          <sphereGeometry args={[0.017, 10, 8]} />
          <meshStandardMaterial color="#c4361f" roughness={0.3} />
        </instancedMesh>
      </group>
      {/* decanter */}
      <group position={[1.95, y, 0.04]}>
        <mesh geometry={dec} material={glassM} castShadow renderOrder={3} />
        <mesh geometry={decW} material={wineM} />
      </group>
    </>
  )
}

function Room({ light }: { light: boolean }) {
  const floorMap = useMemo(() => { const t = new THREE.CanvasTexture(plankCanvas()); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 5); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t }, [])
  const dusk = useMemo(() => { const t = new THREE.CanvasTexture(duskCanvas()); t.colorSpace = THREE.SRGBColorSpace; return t }, [])
  const wall = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2a2a33', roughness: 0.95 }), [])
  const frame = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a1412', roughness: 0.6 }), [])
  const bulbs = useRef<THREE.InstancedMesh>(null)
  const nB = light ? 12 : 22
  const strings = useMemo(() => {
    const out: THREE.Vector3[][] = []
    for (const z of [-1.9, 1.9]) {
      const pts: THREE.Vector3[] = []
      for (let i = 0; i < 80; i++) { const u = i / 79, x = -5 + u * 10; pts.push(new THREE.Vector3(x, 2.75 - 0.5 * (1 - Math.pow(2 * u - 1, 2)) - 0.0, z + Math.sin(u * 5) * 0.2)) }
      out.push(pts)
    }
    return out
  }, [])
  const lines = useMemo(() => strings.map((p) => new THREE.Line(new THREE.BufferGeometry().setFromPoints(p), new THREE.LineBasicMaterial({ color: '#1a1412' }))), [strings])
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    let k = 0
    strings.forEach((pts) => { for (let i = 0; i < nB; i++) { const p = pts[Math.round((i + 0.5) / nB * 79)]; m.makeTranslation(p.x, p.y - 0.04, p.z); bulbs.current?.setMatrixAt(k++, m) } })
    if (bulbs.current) bulbs.current.instanceMatrix.needsUpdate = true
  }, [strings, nB])
  useEffect(() => () => lines.forEach((l) => { l.geometry.dispose(); (l.material as THREE.Material).dispose() }), [lines])
  const Window = ({ pos, rot }: { pos: [number, number, number]; rot: number }) => (
    <group position={pos} rotation={[0, rot, 0]}>
      <mesh><planeGeometry args={[6.4, 3.6]} /><meshBasicMaterial map={dusk} toneMapped={false} fog={false} color="#d0d4e8" /></mesh>
      {[[0, 0, 6.5, 0.12], [0, 1.74, 6.5, 0.14], [0, -1.74, 6.5, 0.14]].map(([x, y, w, h], i) => <mesh key={i} material={frame} position={[x, y, 0.03]}><boxGeometry args={[w, h, 0.08]} /></mesh>)}
      {[-3.2, 0, 3.2].map((x, i) => <mesh key={i} material={frame} position={[x, 0, 0.03]}><boxGeometry args={[0.14, 3.6, 0.08]} /></mesh>)}
      <mesh material={frame} position={[0, -1.84, 0.12]}><boxGeometry args={[6.8, 0.1, 0.3]} /></mesh>
    </group>
  )
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[40, 40]} /><meshStandardMaterial map={floorMap} roughness={0.55} metalness={0.05} /></mesh>
      <mesh material={wall} position={[0, 3, -8.6]}><planeGeometry args={[30, 8]} /></mesh>
      <mesh material={wall} position={[0, 3, 8.6]} rotation={[0, Math.PI, 0]}><planeGeometry args={[30, 8]} /></mesh>
      <mesh material={wall} position={[9, 3, 0]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[30, 8]} /></mesh>
      <mesh material={wall} position={[-9, 3, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[30, 8]} /></mesh>
      <mesh material={wall} position={[0, 6.6, 0]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[30, 30]} /></mesh>
      <Window pos={[0, 2.3, -8.55]} rot={0} />
      <Window pos={[8.95, 2.3, 0]} rot={-Math.PI / 2} />
      {/* a sideboard with a lamp, so the camera has something warm behind it */}
      <mesh material={frame} position={[-2, 0.5, 8.1]}><boxGeometry args={[4.2, 1, 0.8]} /></mesh>
      <mesh position={[-3.2, 1.35, 8.1]}><sphereGeometry args={[0.2, 20, 16]} /><meshBasicMaterial color={[3.2, 2.0, 0.9]} toneMapped={false} /></mesh>
      <mesh position={[-3.2, 1.05, 8.1]} material={frame}><cylinderGeometry args={[0.04, 0.09, 0.2, 10]} /></mesh>
      {lines.map((l, i) => <primitive key={i} object={l} />)}
      <instancedMesh ref={bulbs} args={[undefined, undefined, nB * 2]}>
        <sphereGeometry args={[0.04, 10, 8]} />
        <meshBasicMaterial color={[3.4, 2.2, 1.0]} toneMapped={false} />
      </instancedMesh>
    </>
  )
}

/** Room light follows the candles: dark until they are lit, dimmer again in the pull-back. */
function Lights({ shared, light, still }: { shared: Shared; light: boolean; still: boolean }) {
  const spot = useRef<THREE.SpotLight>(null)
  const amb = useRef<THREE.AmbientLight>(null)
  const scene = useThree((s) => s.scene)
  useFrame(() => {
    const lit = still ? 1 : shared.current.lit ?? 0
    const dim = still ? 0.7 : 1 - 0.5 * smooth(0.86, 1, shared.current.p)
    if (spot.current) spot.current.intensity = (light ? 20 : 15) * (0.12 + 0.88 * lit) * dim
    if (amb.current) amb.current.intensity = 0.22 * (0.4 + 0.6 * lit) * dim
    scene.environmentIntensity = 0.55 * (0.3 + 0.7 * lit) * dim
  })
  useEffect(() => () => { scene.environmentIntensity = 1 }, [scene])
  return (
    <>
      <ambientLight ref={amb} intensity={0.1} color="#6c6a96" />
      <spotLight ref={spot} position={[0.5, 4.6, 0.8]} angle={0.62} penumbra={1} intensity={2} decay={2} color="#ffcf94" />
    </>
  )
}

export default function World({ cards, stage, shared, light, still }: { cards: SeatCard[]; stage: StageData; shared: Shared; light: boolean; still: boolean }) {
  return (
    <>
      <SceneEnv bg="#0b0a0d" fog={['#0c0a0b', 9, 30]} />
      <hemisphereLight args={['#46598f', '#2a1a10', 0.2]} />
      <directionalLight position={[0, 5, -9]} intensity={0.28} color="#6f8fe0" />
      <directionalLight position={[9, 5, 0]} intensity={0.18} color="#6f8fe0" />
      <Lights shared={shared} light={light} still={still} />
      <Environment resolution={128} environmentIntensity={0.55}>
        <Lightformer form="rect" intensity={2.2} color="#6f8fe0" position={[0, 2, -7]} scale={[8, 4, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#6f8fe0" position={[8, 2, 0]} rotation-y={-Math.PI / 2} scale={[8, 4, 1]} />
        <Lightformer form="ring" intensity={3} color="#ffb867" position={[0, 3.5, 0]} rotation-x={Math.PI / 2} scale={3} />
        <Lightformer form="rect" intensity={1.2} color="#ffa24d" position={[0, 0.5, 7]} scale={[8, 1.5, 1]} />
      </Environment>
      <Room light={light} />
      <Furniture light={light} />
      <Settings cards={cards} shared={shared} still={still} />
      <Props shared={shared} stage={stage} still={still} light={light} />
      <Dishes />
      <Candles shared={shared} light={light} still={still} />
      {light ? (
        <ContactShadows position={[0, TABLE_H + 0.006, 0]} scale={[7.2, 2.2]} blur={2.4} far={0.7} opacity={0.65} frames={1} resolution={512} />
      ) : (
        <AccumulativeShadows temporal frames={44} alphaTest={0.85} color="#050302" opacity={1} colorBlend={1.5} scale={7.4 as unknown as number} position={[0, TABLE_H + 0.006, 0]}>
          <RandomizedLight amount={8} radius={5} ambient={0.55} intensity={1.4} position={[3, 3.4, 2.2]} bias={0.0008} />
        </AccumulativeShadows>
      )}
    </>
  )
}
