'use client'
// Ported from components/lab/fx/tilt-shift/ (run 2 home).
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { DOOR_X, HOST, N_HOUSES, WARM, clamp01, houseX, lerp, rng, smooth, type Shared } from './types'

type SH = React.MutableRefObject<Shared>
export const nightOf = (p: number) => smooth(0.02, 0.5, p)

/** Soft radial glow, used for lamp halos and light pools on the road. */
export function useGlowTexture() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 128
    const g = c.getContext('2d') as CanvasRenderingContext2D
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128)
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  useLayoutEffect(() => () => tex.dispose(), [tex])
  return tex
}

/* ---------------------------------------------------------------- sky */
const skyFrag = /* glsl */ `
uniform float night; uniform float aspect; uniform float time;
varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
void main(){
  float y = vUv.y;
  vec3 zenD = vec3(0.12,0.26,0.58), midD = vec3(0.86,0.38,0.46), horD = vec3(1.0,0.66,0.30);
  vec3 zenN = vec3(0.015,0.035,0.14), midN = vec3(0.06,0.10,0.30), horN = vec3(0.12,0.19,0.44);
  vec3 zen = mix(zenD, zenN, night), mid = mix(midD, midN, night), hor = mix(horD, horN, night);
  vec3 col = mix(hor, mid, smoothstep(0.18, 0.5, y));
  col = mix(col, zen, smoothstep(0.45, 1.0, y));
  vec2 sc = vec2(0.68, mix(0.50, 0.26, night));
  float ds = length((vUv - sc) * vec2(aspect, 1.0));
  col += vec3(1.0,0.62,0.25) * exp(-ds * 3.2) * (1.0 - night) * 0.8;
  col += vec3(1.0,0.9,0.6) * smoothstep(0.07, 0.06, ds) * (1.0 - night) * 1.4;
  vec2 mc = vec2(0.2, 0.84);
  float dm = length((vUv - mc) * vec2(aspect, 1.0));
  col += vec3(0.75,0.85,1.0) * smoothstep(0.03, 0.024, dm) * night * 2.0 + vec3(0.35,0.5,0.9) * exp(-dm * 10.0) * night * 0.3;
  vec2 g = vUv * vec2(aspect, 1.0) * 70.0; vec2 id = floor(g);
  float hh = hash(id);
  float star = step(0.975, hh) * smoothstep(0.4, 0.8, y) * night * (0.6 + 0.4 * sin(time * 2.0 + hh * 40.0));
  star *= smoothstep(0.3, 0.0, length(fract(g) - 0.5));
  col += vec3(star) * 1.2;
  gl_FragColor = vec4(col, 1.0);
}`
export function Sky({ sh }: { sh: SH }) {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const size = useThree((s) => s.size)
  useFrame(({ clock }) => {
    const m = mat.current; if (!m) return
    m.uniforms.night.value = nightOf(sh.current.p)
    m.uniforms.time.value = sh.current.reduced ? 0 : clock.elapsedTime
    m.uniforms.aspect.value = size.width / size.height
  })
  return (
    <mesh renderOrder={-100} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial ref={mat} depthTest={false} depthWrite={false} toneMapped={false}
        uniforms={{ night: { value: 0 }, aspect: { value: 1 }, time: { value: 0 } }}
        vertexShader="varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy * 2.0, 0.9999, 1.0); }"
        fragmentShader={skyFrag} />
    </mesh>
  )
}

/* ------------------------------------------------------------ lighting */
export function Lighting({ sh, cast }: { sh: SH; cast: boolean }) {
  const hemi = useRef<THREE.HemisphereLight>(null)
  const sun = useRef<THREE.DirectionalLight>(null)
  const c = useMemo(() => ({ a: new THREE.Color(), b: new THREE.Color(), d: new THREE.Color('#8fa7e0'), n: new THREE.Color('#3a52a0'), gd: new THREE.Color('#6a4a44'), gn: new THREE.Color('#1c2038'), sd: new THREE.Color('#FFA466'), sn: new THREE.Color('#7E9BFF') }), [])
  useFrame(() => {
    const n = nightOf(sh.current.p)
    if (hemi.current) {
      hemi.current.color.copy(c.d).lerp(c.n, n)
      hemi.current.groundColor.copy(c.gd).lerp(c.gn, n)
      hemi.current.intensity = lerp(0.85, 0.7, n)
    }
    if (sun.current) {
      sun.current.color.copy(c.sd).lerp(c.sn, n)
      sun.current.intensity = lerp(2.4, 0.75, n)
      sun.current.position.set(lerp(14, -8, n), lerp(5, 12, n), lerp(9, 10, n))
    }
  })
  return (
    <>
      <hemisphereLight ref={hemi} args={['#8fa7e0', '#6a4a44', 0.85]} />
      <directionalLight ref={sun} position={[14, 5, 9]} intensity={2.4} castShadow={cast} shadow-mapSize={[2048, 2048]} shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-camera-near={1} shadow-camera-far={50} shadow-bias={-0.0006} />
    </>
  )
}

/* ------------------------------------------------------------- windows */
type Win = { x: number; y: number; w: number; h: number; rank: number; tv: boolean; transom: boolean }
function buildWindows(): Win[] {
  const raw: Omit<Win, 'rank'>[] = []
  for (let i = 0; i < N_HOUSES; i++) {
    const cx = houseX(i)
    if (i !== HOST) raw.push({ x: cx - 0.8, y: 0.95, w: 0.8, h: 1.0, tv: false, transom: false })
    raw.push({ x: cx - 0.8, y: 2.25, w: 0.8, h: 1.0, tv: i === 1, transom: false })
    raw.push({ x: cx + 0.85, y: 2.25, w: 0.8, h: 1.0, tv: false, transom: false })
    raw.push({ x: cx + 0.85, y: 1.36, w: 0.6, h: 0.2, tv: false, transom: true })
  }
  const order = raw.map((_, i) => i)
  const r = rng(5)
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]] }
  return raw.map((w, i) => ({ ...w, rank: order.indexOf(i) }))
}

export function Windows({ sh }: { sh: SH }) {
  const wins = useMemo(buildWindows, [])
  const n = wins.length
  const frames = useRef<THREE.InstancedMesh>(null)
  const panes = useRef<THREE.InstancedMesh>(null)
  const vbars = useRef<THREE.InstancedMesh>(null)
  const hbars = useRef<THREE.InstancedMesh>(null)
  const sills = useRef<THREE.InstancedMesh>(null)
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), c: new THREE.Color(), dark: new THREE.Color(), darkD: new THREE.Color('#7d93c0'), darkN: new THREE.Color('#16214a'), warm: new THREE.Color(WARM).multiplyScalar(1.55), tv: new THREE.Color('#9CC0FF').multiplyScalar(1.3) }), [])

  useLayoutEffect(() => {
    const { o } = tmp
    const put = (m: THREE.InstancedMesh | null, i: number, x: number, y: number, z: number, sx: number, sy: number, sz: number) => {
      if (!m) return
      o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.updateMatrix(); m.setMatrixAt(i, o.matrix)
    }
    wins.forEach((w, i) => {
      put(frames.current, i, w.x, w.y, 0.015, w.w + 0.14, w.h + 0.14, 0.05)
      put(panes.current, i, w.x, w.y, 0.045, w.w, w.h, 1)
      put(vbars.current, i, w.x, w.y, 0.055, w.transom ? 0.001 : 0.04, w.h, 0.02)
      put(hbars.current, i, w.x, w.y, 0.055, w.w, w.transom ? 0.001 : 0.04, 0.02)
      put(sills.current, i, w.x, w.y - w.h / 2 - 0.09, 0.07, w.w + 0.22, w.transom ? 0.001 : 0.06, 0.15)
      panes.current?.setColorAt(i, tmp.darkD)
    })
    for (const m of [frames, panes, vbars, hbars, sills]) if (m.current) m.current.instanceMatrix.needsUpdate = true
    if (panes.current?.instanceColor) panes.current.instanceColor.needsUpdate = true
  }, [wins, tmp])

  useFrame(({ clock }) => {
    const m = panes.current; if (!m) return
    const p = sh.current.p, t = sh.current.reduced ? 0 : clock.elapsedTime
    tmp.dark.copy(tmp.darkD).lerp(tmp.darkN, nightOf(p))
    wins.forEach((w, i) => {
      const t0 = 0.02 + (w.rank / (n - 1)) * 0.36
      let on = smooth(t0, t0 + 0.03, p)
      if (on > 0 && on < 1 && !sh.current.reduced) on *= Math.floor(t * 14 + i * 3) % 3 === 0 ? 0.2 : 1
      const lit = w.tv ? tmp.tv : tmp.warm
      tmp.c.copy(tmp.dark).lerp(lit, on)
      if (on > 0.99) tmp.c.multiplyScalar(w.tv ? 0.8 + 0.25 * Math.sin(t * 7 + i) * Math.sin(t * 3.1) : 1 + 0.05 * Math.sin(t * 1.3 + i * 2))
      m.setColorAt(i, tmp.c)
    })
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh ref={frames} args={[undefined, undefined, n]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#EDE6D6" roughness={0.7} /></instancedMesh>
      <instancedMesh ref={panes} args={[undefined, undefined, n]} frustumCulled={false}><planeGeometry args={[1, 1]} /><meshBasicMaterial toneMapped={false} /></instancedMesh>
      <instancedMesh ref={vbars} args={[undefined, undefined, n]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#EDE6D6" roughness={0.7} /></instancedMesh>
      <instancedMesh ref={hbars} args={[undefined, undefined, n]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#EDE6D6" roughness={0.7} /></instancedMesh>
      <instancedMesh ref={sills} args={[undefined, undefined, n]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#D3CBB9" roughness={0.8} /></instancedMesh>
    </group>
  )
}

/* ---------------------------------------------------------------- lamps */
const LAMPS = [-9, -6, -3, 0, 3, 6, 9]
export function Lamps({ sh, cast, lights }: { sh: SH; cast: boolean; lights: boolean }) {
  const glow = useGlowTexture()
  const bulbs = useRef<(THREE.MeshBasicMaterial | null)[]>([])
  const halos = useRef<(THREE.SpriteMaterial | null)[]>([])
  const pools = useRef<(THREE.MeshBasicMaterial | null)[]>([])
  const pl = useRef<(THREE.PointLight | null)[]>([])
  const hdr = useMemo(() => new THREE.Color('#FFC66B'), [])
  useFrame(({ clock }) => {
    const p = sh.current.p, t = sh.current.reduced ? 0 : clock.elapsedTime
    LAMPS.forEach((_, j) => {
      const t0 = 0.05 + j * 0.04
      let on = smooth(t0, t0 + 0.03, p)
      if (on > 0 && on < 1 && !sh.current.reduced) on *= Math.floor(t * 12 + j * 5) % 3 === 0 ? 0.25 : 1
      const b = bulbs.current[j]; if (b) b.color.copy(hdr).multiplyScalar(0.25 + on * 2.1)
      const h = halos.current[j]; if (h) h.opacity = on * 0.85
      const g = pools.current[j]; if (g) g.opacity = on * 0.5
      const l = pl.current[j]; if (l) l.intensity = on * 5
    })
  })
  return (
    <group>
      {LAMPS.map((x, j) => (
        <group key={x} position={[x, 0.06, 0.9]}>
          <mesh position={[0, 0.8, 0]} castShadow={cast}><cylinderGeometry args={[0.03, 0.045, 1.6, 8]} /><meshStandardMaterial color="#2B3A34" roughness={0.6} /></mesh>
          <mesh position={[0, 0.06, 0]}><cylinderGeometry args={[0.09, 0.11, 0.12, 8]} /><meshStandardMaterial color="#2B3A34" roughness={0.6} /></mesh>
          <mesh position={[0, 1.72, 0]} castShadow={cast}><coneGeometry args={[0.15, 0.12, 8]} /><meshStandardMaterial color="#2B3A34" roughness={0.6} /></mesh>
          <mesh position={[0, 1.6, 0]}><sphereGeometry args={[0.075, 10, 8]} /><meshBasicMaterial ref={(m) => { bulbs.current[j] = m }} toneMapped={false} color="#FFC66B" /></mesh>
          <sprite position={[0, 1.6, 0.02]} scale={[0.95, 0.95, 1]}><spriteMaterial ref={(m) => { halos.current[j] = m }} map={glow} color="#FFB347" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></sprite>
          <mesh rotation-x={-Math.PI / 2} position={[0, -0.03, 0.9]}><planeGeometry args={[3.4, 3.4]} /><meshBasicMaterial ref={(m) => { pools.current[j] = m }} map={glow} color="#FFB347" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></mesh>
          {lights && (j === 4 || j === 5) && <pointLight ref={(l) => { pl.current[j] = l }} position={[0, 1.5, 0.5]} color="#FFB662" intensity={0} distance={5} decay={2} />}
        </group>
      ))}
    </group>
  )
}

/* --------------------------------------------------------------- people */
const SHIRTS = ['#E0657A', '#2C8FD6', '#F2B134', '#3E9B5B', '#FF7A3D', '#1F8A8A']
const SKIN = ['#F1C9A5', '#C68E64', '#8D5A3B', '#F1C9A5', '#D9A47A', '#A8714D']
export const arrivalOf = (k: number) => 0.34 + k * 0.04
export function People({ sh, cast }: { sh: SH; cast: boolean }) {
  const refs = useRef<(THREE.Group | null)[]>([])
  useFrame(() => {
    const p = sh.current.p
    refs.current.forEach((g, k) => {
      if (!g) return
      const a = arrivalOf(k)
      const s = 0.02
      const sx = DOOR_X - 8.2 - k * 1.15
      const u = clamp01((p - s) / (a - s))
      const x = lerp(sx, DOOR_X - 0.05 + (k % 2) * 0.1, u)
      const z = lerp(0.42 + (k % 3) * 0.14, 0.3, smooth(0.85, 1, u))
      const walking = u > 0 && u < 1 ? 1 : 0
      g.visible = p < a + 0.004
      const sc = 1 - smooth(a - 0.006, a + 0.004, p)
      g.scale.setScalar(Math.max(0.001, sc))
      g.position.set(x, 0.06 + Math.abs(Math.sin(x * 5.5 + k)) * 0.06 * walking, z)
      g.rotation.z = Math.sin(x * 5.5 + k) * 0.1 * walking
      g.rotation.y = Math.PI / 2 * 0.0
    })
  })
  return (
    <group>
      {SHIRTS.map((c, k) => (
        <group key={k} ref={(g) => { refs.current[k] = g }}>
          <mesh position={[0, 0.22, 0]} castShadow={cast}><capsuleGeometry args={[0.1, 0.22, 4, 10]} /><meshStandardMaterial color={c} roughness={0.55} /></mesh>
          <mesh position={[0, 0.52, 0]} castShadow={cast}><sphereGeometry args={[0.085, 12, 10]} /><meshStandardMaterial color={SKIN[k]} roughness={0.6} /></mesh>
          {k % 2 === 0 && <mesh position={[0, 0.6, 0]}><cylinderGeometry args={[0.09, 0.09, 0.05, 10]} /><meshStandardMaterial color="#2B2F45" roughness={0.7} /></mesh>}
        </group>
      ))}
    </group>
  )
}

