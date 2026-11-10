'use client'
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, useTexture } from '@react-three/drei'
import { CANDLES, SEATS, TABLE_H, TABLE_L, TABLE_W } from './seats'
import { bowlGeo, chairGeos, chargerGeo, decanterGeo, decanterWineGeo, drapeGeo, flameGeo, forkGeo, glassGeo, holderGeo, knifeGeo, napkinGeo, plankCanvas, plateGeo, potBodyGeo, potLidGeo, saladData, spoonGeo, weaveCanvas, wineGeo } from './parts'
import { beamFrag, beamVert, dustFrag, dustVert, screenFrag, screenVert } from './beam-shaders'
import { billboardVert, skyFrag, skyVert, steamFrag } from './steam-shaders'
import { recipeFor, rng } from './dishes'
import { clockT } from './Rig'
import { FEATURE_A, FEATURE_B, PAL, clamp, gradeAt, sm, win, type Film, type StoryData } from './timeline'

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
  vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vH = h;
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

const col = (h: string) => new THREE.Color(h)
const mixc = (a: string, b: string, t: number, out: THREE.Color) => out.set(a).lerp(col(b), t)
const burnAt = (T: number) => 1 - 0.55 * clamp((T - 19) / 6)

// ---- the table's things slide off at ~10:15pm ---------------------------------------------------
function Clearable({ i, dir, children, pos, rot = 0 }: { i: number; dir: [number, number, number]; pos: [number, number, number]; rot?: number; children: ReactNode }) {
  const g = useRef<THREE.Group>(null)
  useFrame(() => {
    const o = g.current
    if (!o) return
    const e = clamp((sm(22.05, 22.5, clockT.T) * 1.5) - i * 0.045)
    o.visible = e < 0.999
    const k = e * e * (3 - 2 * e)
    o.position.set(pos[0] - dir[0] * k * 1.7, pos[1] + Math.sin(Math.PI * Math.min(1, k * 1.15)) * 0.32 + k * 0.1, pos[2] - dir[2] * k * 1.7)
    o.rotation.set(0.3 * k, rot + k * (i % 2 ? 0.8 : -0.8), 0.25 * k)
  })
  return <group ref={g} position={pos} rotation={[0, rot, 0]}>{children}</group>
}

function Settings() {
  const g = useMemo(() => ({ plate: plateGeo(), charger: chargerGeo(), glass: glassGeo(), wine: wineGeo(), fork: forkGeo(), knife: knifeGeo(), spoon: spoonGeo(), napkin: napkinGeo() }), [])
  const m = useMemo(() => ({
    plate: new THREE.MeshPhysicalMaterial({ color: '#F4F1EA', roughness: 0.22, clearcoat: 0.7, clearcoatRoughness: 0.2, side: THREE.DoubleSide }),
    charger: new THREE.MeshStandardMaterial({ color: '#b98c47', metalness: 0.85, roughness: 0.34, side: THREE.DoubleSide }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.03, transparent: true, opacity: 0.2, clearcoat: 1, envMapIntensity: 2.2, side: THREE.DoubleSide, depthWrite: false }),
    wine: new THREE.MeshStandardMaterial({ color: '#7C2236', roughness: 0.08, emissive: '#3a0814', emissiveIntensity: 0.5 }),
    steel: new THREE.MeshStandardMaterial({ color: '#d9d9de', metalness: 1, roughness: 0.22 }),
    napkin: new THREE.MeshStandardMaterial({ color: '#A9C3AE', roughness: 1, envMapIntensity: 0.15 }),
    card: new THREE.MeshStandardMaterial({ color: '#F6F1E4', roughness: 0.9 }),
  }), [])
  return (
    <>
      {SEATS.map((s, i) => (
        <Clearable key={s.key} i={i} dir={s.dir} pos={s.pos} rot={Math.atan2(s.dir[0], s.dir[2])}>
          <mesh geometry={g.charger} material={m.charger} castShadow receiveShadow />
          <mesh geometry={g.plate} material={m.plate} position={[0, 0.012, 0]} castShadow receiveShadow />
          <mesh geometry={g.napkin} material={m.napkin} position={[0, 0.02, 0]} rotation={[0, 0.08 * (i % 3 - 1), 0]} castShadow />
          <mesh geometry={g.fork} material={m.steel} position={[0.27, 0, -0.01]} castShadow />
          <mesh geometry={g.knife} material={m.steel} position={[-0.26, 0, -0.01]} castShadow />
          <mesh geometry={g.spoon} material={m.steel} position={[-0.3, 0, -0.01]} castShadow />
          <group position={[-0.17, 0, 0.24]}>
            <mesh geometry={g.glass} material={m.glass} castShadow renderOrder={3} />
            <mesh geometry={g.wine} material={m.wine} />
          </group>
          <mesh material={m.card} position={[0.07, 0.034, 0.3]} rotation={[-0.28, Math.PI, 0]}><boxGeometry args={[0.11, 0.066, 0.003]} /></mesh>
        </Clearable>
      ))}
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
      <Clearable i={8} dir={[0, 0, 1]} pos={[-1.65, y, 0.02]} rot={0.12}>
        <mesh material={woodMat} position={[0, 0.01, 0]} castShadow receiveShadow><boxGeometry args={[0.5, 0.02, 0.23]} /></mesh>
        <mesh material={crust} position={[-0.06, 0.06, 0]} scale={[0.13, 0.062, 0.075]} castShadow><sphereGeometry args={[1, 24, 16]} /></mesh>
        <mesh material={crust} position={[0.13, 0.04, 0.05]} rotation={[0, 0.4, Math.PI / 2]} castShadow><cylinderGeometry args={[0.025, 0.025, 0.2, 16]} /></mesh>
      </Clearable>
      <Clearable i={9} dir={[0, 0, -1]} pos={[-0.3, y, 0.01]}>
        <mesh geometry={body} material={enamel} castShadow receiveShadow />
        <mesh geometry={lid} material={enamel} castShadow />
        <mesh material={enamel} position={[0, 0.215, 0]}><sphereGeometry args={[0.022, 16, 12]} /></mesh>
      </Clearable>
      <Clearable i={10} dir={[0, 0, -1]} pos={[0.92, y, -0.01]}>
        <mesh geometry={bowl} material={white} castShadow receiveShadow />
        <instancedMesh ref={leaves} args={[undefined, undefined, salad.leaves.length]} castShadow><sphereGeometry args={[1, 8, 6]} /><meshStandardMaterial roughness={0.6} /></instancedMesh>
        <instancedMesh ref={toms} args={[undefined, undefined, salad.toms.length]}><sphereGeometry args={[0.017, 10, 8]} /><meshStandardMaterial color="#c4361f" roughness={0.3} /></instancedMesh>
      </Clearable>
      <Clearable i={11} dir={[0, 0, 1]} pos={[1.95, y, 0.04]}>
        <mesh geometry={dec} material={glassM} castShadow renderOrder={3} />
        <mesh geometry={decW} material={wineM} />
      </Clearable>
    </>
  )
}

/** Rising steam: billboarded fbm planes. grow(T) 0..1. */
function Plume({ pos, grow, planes, size = [0.5, 1.0], int = 1.3 }: { pos: [number, number, number]; grow: (T: number) => number; planes: number; size?: [number, number]; int?: number }) {
  const mats = useMemo(() => Array.from({ length: planes }, (_, k) => new THREE.ShaderMaterial({
    vertexShader: billboardVert, fragmentShader: steamFrag, transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uGrow: { value: 0 }, uSeed: { value: (k * 0.37 + pos[0] * 0.21 + 1) % 1 }, uInt: { value: int }, uColor: { value: new THREE.Color('#F2D3A0') }, uSize: { value: new THREE.Vector2(...size) } },
  })), [planes, pos, size, int])
  useEffect(() => () => mats.forEach((m) => m.dispose()), [mats])
  useFrame(({ clock }) => {
    const gr = grow(clockT.T)
    mats.forEach((m, k) => { m.uniforms.uTime.value = clock.elapsedTime + k * 0.9; m.uniforms.uGrow.value = gr })
  })
  return (
    <group position={pos}>
      {mats.map((m, k) => {
        const a = (k / planes) * Math.PI * 2
        return <mesh key={k} position={[Math.cos(a) * 0.04, 0, Math.sin(a) * 0.03]} renderOrder={10 + k} frustumCulled={false}><planeGeometry args={[1, 1]} /><primitive object={m} attach="material" /></mesh>
      })}
    </group>
  )
}

/** The latest dish, plated: painted from its name, with steam over it. */
function Starter({ name, category, light }: { name: string; category: string; light: boolean }) {
  const r = useMemo(() => recipeFor(name, category), [name, category])
  const plate = useMemo(() => plateGeo(), [])
  const parts = useMemo(() => {
    const rn = rng(r.seed ^ 0x51ed)
    return Array.from({ length: 14 }, () => { const a = rn() * 6.28, d = Math.sqrt(rn()) * 0.1; return { p: [Math.cos(a) * d, 0.035 + rn() * 0.03, Math.sin(a) * d] as [number, number, number], s: 0.012 + rn() * 0.018, c: rn() > 0.55 ? r.herb : rn() > 0.5 ? r.food2 : r.food } })
  }, [r])
  const pos: [number, number, number] = [-0.95, TABLE_H + 0.004, 0.2]
  return (
    <>
      <Clearable i={12} dir={[0, 0, 1]} pos={pos}>
        <mesh geometry={plate} scale={0.82}><meshPhysicalMaterial color="#F4F1EA" roughness={0.22} clearcoat={0.7} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.1, 32]} /><meshStandardMaterial color={r.sauce} roughness={0.45} /></mesh>
        <mesh position={[0, 0.04, 0]} scale={[0.1, 0.045, 0.1]} castShadow><sphereGeometry args={[1, 24, 14]} /><meshStandardMaterial color={r.food} roughness={0.5} /></mesh>
        {parts.map((p, i) => <mesh key={i} position={p.p} scale={p.s}><sphereGeometry args={[1, 8, 6]} /><meshStandardMaterial color={p.c} roughness={0.55} /></mesh>)}
        <Plume pos={[0, 0.07, 0]} grow={(T) => win(T, 19.55, 22.1, 0.3)} planes={light ? 3 : 5} size={[0.42, 0.85]} />
      </Clearable>
    </>
  )
}

function Candles({ light }: { light: boolean }) {
  const wax = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FFF8EA', roughness: 0.5, emissive: '#ff9a40', emissiveIntensity: 0.3 }), [])
  const brass = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c79a4a', metalness: 0.9, roughness: 0.32 }), [])
  const holder = useMemo(() => holderGeo(), [])
  const flame = useMemo(() => flameGeo(), [])
  const mats = useMemo(() => CANDLES.map((_, i) => new THREE.ShaderMaterial({ vertexShader: FLAME_VERT, fragmentShader: FLAME_FRAG, uniforms: { uTime: { value: 0 }, uSeed: { value: i * 1.7 + 0.3 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide })), [])
  const bodies = useRef<(THREE.Mesh | null)[]>([])
  const flames = useRef<(THREE.Mesh | null)[]>([])
  const lights = useRef<(THREE.PointLight | null)[]>([])
  const lit = light ? [1, 3] : [0, 2, 4]
  useFrame(({ clock }) => {
    const t = clock.elapsedTime, T = clockT.T
    const burn = burnAt(T)
    const lowered = 1 - 0.45 * sm(22.3, 22.9, T) // candles sink low once the room turns
    CANDLES.forEach((c, i) => {
      const top = TABLE_H + 0.1 + c.h * burn
      const b = bodies.current[i]
      if (b) { b.scale.y = c.h * burn; b.position.y = TABLE_H + 0.1 + (c.h * burn) / 2 }
      const f = flames.current[i]
      if (f) { f.position.y = top - 0.002; f.scale.setScalar(1.5 * lowered) }
      mats[i].uniforms.uTime.value = t
      const l = lights.current[i]
      if (l) { l.intensity = (light ? 2.6 : 1.7) * lowered * (1 + 0.14 * Math.sin(t * 13 + i * 2.1) + 0.09 * Math.sin(t * 27.3 + i * 5.7)); l.position.y = top + 0.05 }
    })
  })
  return (
    <>
      {CANDLES.map((c, i) => (
        <group key={i} position={[c.x, 0, c.z]}>
          <mesh geometry={holder} material={brass} position={[0, TABLE_H, 0]} castShadow />
          <mesh ref={(m) => { bodies.current[i] = m }} material={wax}><cylinderGeometry args={[0.017, 0.019, 1, 20]} /></mesh>
          <mesh ref={(m) => { flames.current[i] = m }} geometry={flame} material={mats[i]} scale={[1.5, 1.5, 1.5]} renderOrder={5} />
          {lit.includes(i) && <pointLight ref={(l) => { lights.current[i] = l }} color="#ff9a3c" distance={9} decay={2} position={[0, TABLE_H + 0.5, 0]} />}
        </group>
      ))}
    </>
  )
}

const ROWS: [number, number][] = [-2.25, -0.75, 0.75, 2.25].flatMap((x) => [[x, 2.0], [x, 3.5]] as [number, number][])

function Furniture() {
  const ch = useMemo(() => chairGeos(), [])
  const wood = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4a2d1b', roughness: 0.5 }), [])
  const cush = useMemo(() => new THREE.MeshStandardMaterial({ color: '#7C2236', roughness: 0.9 }), [])
  const weave = useMemo(() => { const t = new THREE.CanvasTexture(weaveCanvas()); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(36, 12); return t }, [])
  const cloth = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#17352A', roughness: 0.92, sheen: 1, sheenColor: new THREE.Color('#5f8f73'), sheenRoughness: 0.5, bumpMap: weave, bumpScale: 0.6 }), [weave])
  const linen = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#cfc9b8', roughness: 0.95, sheen: 0.6, sheenColor: new THREE.Color('#e8dcc0'), sheenRoughness: 0.6 }), [])
  const dL = useMemo(() => drapeGeo(TABLE_L + 0.4, 0.55), [])
  const dW = useMemo(() => drapeGeo(TABLE_W + 0.4, 0.55), [])
  const hang = useMemo(() => new THREE.MeshStandardMaterial({ color: '#10281F', roughness: 0.95, side: THREE.DoubleSide }), [])
  const chairs = useRef<(THREE.Group | null)[]>([])
  const base = useMemo(() => SEATS.map((s, i) => {
    let r = Math.atan2(s.dir[0], s.dir[2]) + (s.key === 'b2' ? 0.05 : s.key === 'b3' ? -0.1 : 0)
    if (r > Math.PI) r -= Math.PI * 2
    return { x: s.pos[0] - s.dir[0] * 0.74, z: s.pos[2] - s.dir[2] * 0.74, r, to: ROWS[(i * 5) % 8 === 0 ? i : i] }
  }), [])
  useFrame(() => {
    const T = clockT.T
    base.forEach((b, i) => {
      const g = chairs.current[i]
      if (!g) return
      const e = clamp(sm(22.35, 22.95, T) * 1.35 - i * 0.05)
      const k = e * e * (3 - 2 * e)
      g.position.set(b.x + (b.to[0] - b.x) * k, Math.sin(Math.PI * k) * 0.08, b.z + (b.to[1] - b.z) * k)
      g.rotation.y = b.r * (1 - k)
    })
  })
  return (
    <>
      <mesh position={[0, TABLE_H - 0.012, 0]} receiveShadow material={cloth}><boxGeometry args={[TABLE_L + 0.4, 0.024, TABLE_W + 0.4]} /></mesh>
      <mesh geometry={dL} material={hang} position={[0, TABLE_H - 0.02, (TABLE_W + 0.4) / 2]} />
      <mesh geometry={dL} material={hang} position={[0, TABLE_H - 0.02, -(TABLE_W + 0.4) / 2]} rotation={[0, Math.PI, 0]} />
      <mesh geometry={dW} material={hang} position={[(TABLE_L + 0.4) / 2, TABLE_H - 0.02, 0]} rotation={[0, Math.PI / 2, 0]} />
      <mesh geometry={dW} material={hang} position={[-(TABLE_L + 0.4) / 2, TABLE_H - 0.02, 0]} rotation={[0, -Math.PI / 2, 0]} />
      <mesh position={[0, TABLE_H + 0.002, 0]} material={linen} receiveShadow><boxGeometry args={[TABLE_L - 0.7, 0.004, 0.3]} /></mesh>
      {SEATS.map((s, i) => (
        <group key={s.key} ref={(g) => { chairs.current[i] = g }} position={[base[i].x, 0, base[i].z]} rotation={[0, base[i].r, 0]}>
          <mesh geometry={ch.wood} material={wood} castShadow />
          <mesh geometry={ch.cushion} material={cush} />
        </group>
      ))}
    </>
  )
}

const SCREEN_W = 6.4, SCREEN_H = SCREEN_W / 1.846
const A = new THREE.Vector3(0, 2.6, -6.0) // lens
const TG = new THREE.Vector3(0, 2.3, 8.45) // screen centre
const BL = A.distanceTo(TG)
const R_END = 3.3, R0 = 0.12, SY = SCREEN_H / SCREEN_W
const BK = (R_END - R0) / BL
const AXIS = TG.clone().sub(A).normalize()
const hash = (x: number) => { const s = Math.sin(x * 12.9898) * 43758.5453; return s - Math.floor(s) }

function leaderTexture(n: number) {
  const c = document.createElement('canvas')
  c.width = 512; c.height = 277
  const g = c.getContext('2d')!
  g.fillStyle = '#c9bd9f'; g.fillRect(0, 0, 512, 277)
  g.strokeStyle = '#1a1411'; g.lineWidth = 5
  g.beginPath(); g.arc(256, 138, 112, 0, Math.PI * 2); g.stroke()
  g.lineWidth = 2.5; g.beginPath(); g.arc(256, 138, 90, 0, Math.PI * 2); g.stroke()
  g.beginPath(); g.moveTo(0, 138); g.lineTo(512, 138); g.moveTo(256, 0); g.lineTo(256, 277); g.stroke()
  g.fillStyle = '#1a1411'; g.font = 'bold 150px Impact, "Arial Black", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'
  g.fillText(String(n), 256, 146)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** Projector, beam, dust and the wall screen with the real posters. */
function Cinema({ films, light }: { films: Film[]; light: boolean }) {
  const textures = useTexture(films.map((f) => f.posterUrl)) as THREE.Texture[]
  const leaders = useMemo(() => [1, 2, 3].map(leaderTexture), [])
  const N = films.length
  useMemo(() => textures.forEach((t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.needsUpdate = true }), [textures])
  const avg = useMemo(() => textures.map((t) => {
    try {
      const c = document.createElement('canvas'); c.width = c.height = 4
      const g = c.getContext('2d')!
      g.drawImage(t.image as CanvasImageSource, 0, 0, 4, 4)
      const d = g.getImageData(0, 0, 4, 4).data
      let r = 0, gg = 0, b = 0
      for (let i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; b += d[i + 2] }
      const n = (d.length / 4) * 255
      return new THREE.Color(r / n, gg / n, b / n).lerp(new THREE.Color('#FFF3D6'), 0.55)
    } catch { return new THREE.Color('#FFF3D6') }
  }), [textures])
  const inv = useMemo(() => { const o = new THREE.Object3D(); o.position.copy(A); o.lookAt(TG); o.updateMatrixWorld(true); return { quat: o.quaternion.clone(), inv: o.matrixWorld.clone().invert() } }, [])
  const beamGeo = useMemo(() => { const g = new THREE.CylinderGeometry(R_END * 1.18, R0 * 1.18, BL, 48, 1, false); g.rotateX(Math.PI / 2); g.scale(1, SY, 1); g.translate(0, 0, BL / 2); return g }, [])
  const beamMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: beamVert, fragmentShader: beamFrag, defines: { STEPS: light ? 18 : 36 },
    uniforms: { uInv: { value: inv.inv }, uL: { value: BL }, uR0: { value: R0 }, uK: { value: BK }, uSy: { value: SY }, uTime: { value: 0 }, uFlick: { value: 1 }, uGain: { value: 0 }, uFrame: { value: 0 }, uBeam: { value: new THREE.Color('#FFF3D6') }, uWarm: { value: new THREE.Color('#FF9F43') } },
    side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  }), [light, inv])
  const dust = useMemo(() => {
    const count = light ? 500 : 1800
    const rnd = rng(7)
    const pos = new Float32Array(count * 3), seed = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) { pos[i * 3] = (rnd() - 0.5) * 9; pos[i * 3 + 1] = 0.3 + rnd() * 4.6; pos[i * 3 + 2] = -9 + rnd() * 18; seed[i * 3] = rnd(); seed[i * 3 + 1] = rnd(); seed[i * 3 + 2] = rnd() }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 3))
    const m = new THREE.ShaderMaterial({
      vertexShader: dustVert, fragmentShader: dustFrag,
      uniforms: { uTime: { value: 0 }, uScale: { value: 800 }, uFlick: { value: 1 }, uPtrR: { value: 0.01 }, uPtr: { value: new THREE.Vector3(0, -50, 0) }, uAxis: { value: AXIS.clone() }, uInv: { value: inv.inv }, uL: { value: BL }, uR0: { value: R0 }, uK: { value: BK }, uSy: { value: SY }, uBeam: { value: new THREE.Color('#FFF3D6') } },
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
    })
    return { g, m }
  }, [light, inv])
  const screenMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: screenVert, fragmentShader: screenFrag,
    uniforms: { uTex: { value: textures[0] ?? leaders[2] }, uLeader: { value: leaders[2] }, uTexAspect: { value: 0.667 }, uFlick: { value: 0 }, uFrame: { value: 0 }, uMode: { value: textures[0] ? 0 : 1 }, uLeaderT: { value: 0 }, uBurst: { value: 0 }, uWeave: { value: new THREE.Vector2() } },
    toneMapped: false,
  }), [textures, leaders])
  useEffect(() => () => { beamGeo.dispose(); beamMat.dispose(); dust.g.dispose(); dust.m.dispose(); screenMat.dispose(); leaders.forEach((l) => l.dispose()) }, [beamGeo, beamMat, dust, screenMat, leaders])

  const bounce = useRef<THREE.PointLight>(null)
  const lens = useRef<THREE.Mesh>(null)
  const lensLight = useRef<THREE.PointLight>(null)
  const st = useRef({ shown: -1, to: -1, transStart: 0, frame: -1, flick: 1, burst: 0, weave: new THREE.Vector2(), tint: new THREE.Color('#FFF3D6'), last: 0, lastNum: 0 })
  const setPoster = (i: number) => {
    const tx = textures[i]
    if (tx) { screenMat.uniforms.uTex.value = tx; const im = tx.image as { width: number; height: number }; screenMat.uniforms.uTexAspect.value = im.width / im.height }
    screenMat.uniforms.uMode.value = tx ? 0 : 1
  }
  useFrame(({ clock, camera, size, viewport }, dt) => {
    const s = st.current, T = clockT.T, t = clock.elapsedTime
    const on = sm(22.55, 22.95, T) * (1 - sm(24.6, 24.85, T))
    const fr = Math.floor(t * 24)
    if (fr !== s.frame) {
      s.frame = fr
      const r = hash(fr), r2 = hash(fr + 77.7)
      s.flick = 0.92 + 0.14 * r - (r2 > 0.93 ? 0.28 : 0) + 0.04 * Math.sin(t * 3)
      s.weave.set((hash(fr + 1) - 0.5) * 0.004, (hash(fr + 2) - 0.5) * 0.007)
    }
    s.burst = Math.max(0, s.burst - dt * 5)
    const seg = (FEATURE_B - FEATURE_A) / Math.max(1, N)
    const want = N ? Math.min(N - 1, Math.max(0, Math.floor((T - FEATURE_A) / seg))) : 0
    if (T < FEATURE_A - 0.02) {
      // film leader countdown while the projector warms up
      const num = T < 22.8 ? 3 : T < 22.9 ? 2 : 1
      screenMat.uniforms.uLeader.value = leaders[num - 1]; screenMat.uniforms.uMode.value = 1; screenMat.uniforms.uLeaderT.value = t
      if (num !== s.lastNum) { s.lastNum = num; s.burst = Math.max(s.burst, 0.5) }
      s.shown = -1
    } else {
      if (s.shown < 0) { s.shown = want; setPoster(want); s.burst = 1; s.to = -1 }
      if (want !== s.shown && s.to !== want) { s.to = want; s.transStart = t; s.burst = 1 }
      if (s.to >= 0) {
        const lt = t - s.transStart
        if (lt < 0.45) { screenMat.uniforms.uLeader.value = leaders[lt < 0.15 ? 2 : lt < 0.3 ? 1 : 0]; screenMat.uniforms.uMode.value = 1; screenMat.uniforms.uLeaderT.value = lt } else { s.shown = s.to; s.to = -1; setPoster(s.shown); s.burst = 1 }
      }
    }
    beamMat.uniforms.uTime.value = t; beamMat.uniforms.uFlick.value = s.flick; beamMat.uniforms.uFrame.value = s.frame
    beamMat.uniforms.uGain.value = sm(22.5, 22.95, T) * (1 - sm(24.55, 24.85, T)) * 0.9
    const du = dust.m.uniforms
    du.uTime.value = t; du.uFlick.value = (0.25 + 0.75 * on) * s.flick
    du.uScale.value = (size.height * viewport.dpr) / (2 * Math.tan(((camera as THREE.PerspectiveCamera).fov * Math.PI) / 360))
    const su = screenMat.uniforms
    su.uFlick.value = s.flick * on; su.uFrame.value = s.frame % 997; su.uBurst.value = s.burst * 0.35 * on; su.uWeave.value.copy(s.weave)
    const c = avg[Math.max(0, s.shown)] ?? avg[0]
    if (c) s.tint.lerp(c, 1 - Math.exp(-dt * 4))
    if (bounce.current) { bounce.current.intensity = 80 * s.flick * on; bounce.current.color.copy(s.tint) }
    if (lensLight.current) lensLight.current.intensity = 6 * s.flick * on
    if (lens.current) (lens.current.material as THREE.MeshBasicMaterial).color.setRGB(3 * on + 0.15, 2.4 * on + 0.12, 1.4 * on + 0.1)
  })
  return (
    <>
      {/* screen on the +z wall, framed by claret drapes */}
      <mesh position={[0, 2.3, 8.5]} rotation={[0, Math.PI, 0]} material={screenMat}><planeGeometry args={[SCREEN_W, SCREEN_H]} /></mesh>
      <mesh position={[0, 2.3, 8.55]} rotation={[0, Math.PI, 0]}><planeGeometry args={[SCREEN_W + 0.5, SCREEN_H + 0.5]} /><meshStandardMaterial color="#0a0a0c" roughness={0.9} /></mesh>
      {[-1, 1].map((sx) => <mesh key={sx} position={[sx * (SCREEN_W / 2 + 1.1), 2.6, 8.3]} castShadow><boxGeometry args={[1.4, 5, 0.3]} /><meshStandardMaterial color="#6B1A2B" roughness={0.95} /></mesh>)}
      <mesh geometry={beamGeo} material={beamMat} position={A} quaternion={inv.quat} frustumCulled={false} renderOrder={3} />
      <points geometry={dust.g} material={dust.m} frustumCulled={false} renderOrder={4} />
      <pointLight ref={bounce} position={[0, 2.3, 7.0]} color="#FFF3D6" intensity={0} distance={22} decay={2} />
      {/* the projector, hung from the ceiling beam */}
      <group position={[A.x, A.y + 0.2, A.z - 0.45]}>
        <mesh position={[0, 0.9, 0]}><cylinderGeometry args={[0.03, 0.03, 1.4, 8]} /><meshStandardMaterial color="#222" /></mesh>
        <mesh><boxGeometry args={[0.7, 0.35, 0.9]} /><meshStandardMaterial color="#2c2622" metalness={0.55} roughness={0.42} /></mesh>
        <mesh position={[0, -0.05, 0.5]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.13, 0.16, 0.2, 20]} /><meshStandardMaterial color="#D8A84E" metalness={0.85} roughness={0.3} /></mesh>
        <mesh ref={lens} position={[0, -0.05, 0.62]}><circleGeometry args={[0.11, 20]} /><meshBasicMaterial color="#222" toneMapped={false} /></mesh>
        <pointLight ref={lensLight} position={[0, -0.05, 0.8]} color="#FFD9A0" intensity={0} distance={8} decay={2} />
      </group>
    </>
  )
}

function Sky() {
  const mat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: skyVert, fragmentShader: skyFrag, uniforms: { uTop: { value: new THREE.Color() }, uHorizon: { value: new THREE.Color() }, uGlow: { value: new THREE.Color('#ff9a5a') }, uNight: { value: 0 }, uTime: { value: 0 } }, toneMapped: false, fog: false }), [])
  useEffect(() => () => mat.dispose(), [mat])
  const a = useMemo(() => new THREE.Color(), [])
  useFrame(({ clock }) => {
    const g = gradeAt(clockT.T), u = mat.uniforms
    if (g < 1) { mixc('#8a6f9e', '#3B4F7A', g, u.uTop.value); mixc(PAL.dusk, '#7a86b0', g, u.uHorizon.value) } else { mixc('#3B4F7A', PAL.night, g - 1, u.uTop.value); mixc('#7a86b0', '#1c2c4a', g - 1, u.uHorizon.value) }
    void a
    u.uNight.value = clamp(g - 0.7, 0, 1.3) / 1.3
    u.uTime.value = clock.elapsedTime
  })
  return <mesh position={[0, 2.3, -8.5]} material={mat}><planeGeometry args={[6.4, 3.6]} /></mesh>
}

function Room({ light }: { light: boolean }) {
  const floorMap = useMemo(() => { const t = new THREE.CanvasTexture(plankCanvas()); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 5); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t }, [])
  const wall = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2b3150', roughness: 0.95 }), [])
  const frame = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a1412', roughness: 0.6 }), [])
  const doorGlow = useRef<THREE.MeshBasicMaterial>(null)
  const doorLight = useRef<THREE.PointLight>(null)
  useFrame(() => {
    const k = sm(24.5, 24.95, clockT.T)
    if (doorGlow.current) doorGlow.current.color.setRGB(3 * k + 0.05, 2 * k + 0.05, 1 * k + 0.05)
    if (doorLight.current) doorLight.current.intensity = 14 * k
  })
  void light
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[40, 40]} /><meshStandardMaterial map={floorMap} roughness={0.55} metalness={0.05} /></mesh>
      <mesh material={wall} position={[0, 3, -8.6]}><planeGeometry args={[30, 8]} /></mesh>
      <mesh material={wall} position={[0, 3, 8.6]} rotation={[0, Math.PI, 0]}><planeGeometry args={[30, 8]} /></mesh>
      <mesh material={wall} position={[9, 3, 0]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[30, 8]} /></mesh>
      <mesh material={wall} position={[-9, 3, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[30, 8]} /></mesh>
      <mesh material={wall} position={[0, 4.6, 0]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[30, 30]} /></mesh>
      <Sky />
      {[[0, 0, 6.5, 0.12], [0, 1.74, 6.5, 0.14], [0, -1.74, 6.5, 0.14]].map(([x, y, w, h], i) => <mesh key={i} material={frame} position={[x, 2.3 + y, -8.46]}><boxGeometry args={[w, h, 0.08]} /></mesh>)}
      {[-3.2, 0, 3.2].map((x, i) => <mesh key={i} material={frame} position={[x, 2.3, -8.46]}><boxGeometry args={[0.14, 3.6, 0.08]} /></mesh>)}
      <mesh material={frame} position={[0, 0.46, -8.35]}><boxGeometry args={[6.8, 0.1, 0.3]} /></mesh>
      {/* the door on the left wall */}
      <group position={[-8.92, 0, 3.0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 1.15, 0]}><boxGeometry args={[1.1, 2.3, 0.08]} /><meshStandardMaterial color="#4a2d1b" roughness={0.6} /></mesh>
        <mesh position={[0, 1.15, -0.05]}><boxGeometry args={[1.3, 2.45, 0.05]} /><meshStandardMaterial color="#1a1412" roughness={0.6} /></mesh>
        <mesh position={[0.4, 1.05, 0.06]}><sphereGeometry args={[0.04, 12, 10]} /><meshStandardMaterial color="#D8A84E" metalness={0.9} roughness={0.3} /></mesh>
        <mesh position={[0, 0.02, 0.05]}><boxGeometry args={[1.08, 0.035, 0.02]} /><meshBasicMaterial ref={doorGlow} color="#0b0b10" toneMapped={false} /></mesh>
        <pointLight ref={doorLight} position={[0, 1.5, 1.2]} color="#ffb867" intensity={0} distance={9} decay={2} />
      </group>
    </>
  )
}

/** Time-graded light: ambient, window light and the table spot follow the story clock. */
function Grade({ light }: { light: boolean }) {
  const amb = useRef<THREE.AmbientLight>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const win1 = useRef<THREE.DirectionalLight>(null)
  const spot = useRef<THREE.SpotLight>(null)
  const scene = useThree((s) => s.scene)
  useEffect(() => { scene.background = new THREE.Color('#2A2234'); scene.fog = new THREE.Fog('#2A2234', 10, 34); return () => { scene.fog = null } }, [scene])
  const tmp = useMemo(() => new THREE.Color(), [])
  useFrame(() => {
    const T = clockT.T, g = gradeAt(T)
    const tone = g < 1 ? mixc(PAL.dusk, PAL.blue, g, tmp) : mixc(PAL.blue, PAL.night, g - 1, tmp)
    if (amb.current) { amb.current.color.copy(tone).lerp(col('#ffffff'), 0.25); amb.current.intensity = (0.95 - 0.8 * clamp(g, 0, 2) / 2 + 0.45 * sm(24.7, 25, T)) }
    if (hemi.current) { hemi.current.color.copy(tone); hemi.current.intensity = 0.55 - 0.32 * clamp(g / 2) }
    if (win1.current) { win1.current.color.copy(tone).lerp(col('#ffffff'), 0.3); win1.current.intensity = 1.1 * (1 - 0.9 * clamp(g / 1.6)) }
    if (spot.current) spot.current.intensity = (light ? 22 : 16) * (1 - 0.88 * sm(22.2, 22.85, T)) * (1 - 0.0 * g)
    const bg = scene.background as THREE.Color
    const fogc = g < 1 ? mixc('#4a3a46', '#2b3150', g, bg) : mixc('#2b3150', '#0F1A2E', g - 1, bg)
    ;(scene.fog as THREE.Fog | null)?.color.copy(fogc)
  })
  return (
    <>
      <ambientLight ref={amb} intensity={0.5} />
      <hemisphereLight ref={hemi} args={['#E9A66B', '#2a1a10', 0.5]} />
      <directionalLight ref={win1} position={[0, 4, -9]} intensity={1} />
      <spotLight ref={spot} position={[0.5, 4.2, 0.8]} angle={0.62} penumbra={1} intensity={16} decay={2} color="#ffcf94" castShadow={!light} shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
    </>
  )
}

export default function World({ data, light }: { data: StoryData; light: boolean }) {
  const starter = data.dishes[0]
  return (
    <>
      <Grade light={light} />
      <Environment resolution={64} environmentIntensity={0.4}>
        <Lightformer form="rect" intensity={2} color="#ffd0a0" position={[0, 2, -7]} scale={[8, 4, 1]} />
        <Lightformer form="ring" intensity={2.5} color="#ffb867" position={[0, 3.5, 0]} rotation-x={Math.PI / 2} scale={3} />
      </Environment>
      <Room light={light} />
      <Furniture />
      <Settings />
      <Dishes />
      {starter && <Starter name={starter.name} category={starter.category} light={light} />}
      <Plume pos={[-0.3, TABLE_H + 0.2, 0.01]} grow={(T) => win(T, 20.55, 22.1, 0.3)} planes={light ? 2 : 3} size={[0.35, 0.7]} int={0.9} />
      <Candles light={light} />
      <Suspense fallback={null}><Cinema films={data.films} light={light} /></Suspense>
    </>
  )
}
