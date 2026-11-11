'use client'
// Ported from components/lab/fx/tilt-shift/ (run 2 home).
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { DOOR_X, smooth, type Shared } from './types'
import { HOST_CX } from './Street'
import { arrivalOf, useGlowTexture } from './Life'

type SH = React.MutableRefObject<Shared>
const R = (dx: number) => HOST_CX + dx // room-relative x -> world x
const TABLE_Y = 0.5
const BACK_Z = -1.29
const SCR = { x: R(-0.55), y: 0.78, w: 0.36, h: 0.54 }
const LENS = new THREE.Vector3(R(-0.9), 0.62, -0.5)
const SCR_POINT = new THREE.Vector3(SCR.x, SCR.y, BACK_Z + 0.02)

/** The poster on the tiny screen; falls back to a plain light panel when a film has no poster. */
function Screen({ url, mat }: { url: string | null; mat: React.MutableRefObject<THREE.MeshBasicMaterial | null> }) {
  return url ? <Poster url={url} mat={mat} /> : <meshBasicMaterial ref={(m) => { mat.current = m }} color="#cfd6e4" toneMapped={false} />
}
function Poster({ url, mat }: { url: string; mat: React.MutableRefObject<THREE.MeshBasicMaterial | null> }) {
  const tex = useTexture(url)
  useLayoutEffect(() => { tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; tex.needsUpdate = true }, [tex])
  return <meshBasicMaterial ref={(m) => { mat.current = m }} map={tex} toneMapped={false} />
}

const GUESTS = [
  { dx: -0.98, c: '#2C8FD6', skin: '#C68E64' },
  { dx: -0.12, c: '#E0657A', skin: '#F1C9A5' },
  { dx: -1.2, c: '#F2B134', skin: '#8D5A3B', front: true },
]

/** The host's ground-floor bay: sage walls, laid table, candles, tiny poster screen, projector beam. */
export default function Room({ sh, posterUrl, lights }: { sh: SH; posterUrl: string | null; lights: boolean }) {
  const glow = useGlowTexture()
  const tableLight = useRef<THREE.PointLight>(null)
  const projLight = useRef<THREE.PointLight>(null)
  const flames = useRef<(THREE.Mesh | null)[]>([])
  const screenMat = useRef<THREE.MeshBasicMaterial | null>(null)
  const beamMat = useRef<THREE.MeshBasicMaterial>(null)
  const wallGlow = useRef<THREE.MeshBasicMaterial>(null)
  const doorGlow = useRef<THREE.MeshBasicMaterial>(null)
  const guestRefs = useRef<(THREE.Group | null)[]>([])
  const cloth = useRef<THREE.MeshStandardMaterial>(null)

  const beamGeo = useMemo(() => {
    const len = LENS.distanceTo(SCR_POINT)
    const g = new THREE.CylinderGeometry(0.2, 0.012, len, 20, 1, true)
    g.translate(0, len / 2, 0); g.rotateX(Math.PI / 2)
    return g
  }, [])
  useLayoutEffect(() => () => beamGeo.dispose(), [beamGeo])
  const beamRef = useRef<THREE.Mesh>(null)
  useLayoutEffect(() => { beamRef.current?.lookAt(SCR_POINT) }, [])

  useFrame(({ clock }) => {
    const p = sh.current.p
    const t = sh.current.reduced ? 0 : clock.elapsedTime
    // dinner: candles and the ceiling lamp come up, 0.46 -> 0.6
    const table = smooth(0.46, 0.6, p)
    // film: projector flickers on from 0.66, with a stutter at first
    let film = smooth(0.66, 0.72, p)
    if (film > 0 && film < 1 && !sh.current.reduced) film *= Math.floor(t * 16) % 3 === 0 ? 0.3 : 1
    const flick = sh.current.reduced ? 1 : 0.88 + 0.12 * Math.sin(Math.floor(t * 24) * 12.9898) * Math.sin(Math.floor(t * 24) * 3.7) + (Math.floor(t * 24) % 17 === 0 ? -0.2 : 0)
    if (tableLight.current) tableLight.current.intensity = table * (3.2 + 0.25 * Math.sin(t * 9)) * (1 - 0.35 * film)
    if (projLight.current) projLight.current.intensity = film * 1.5 * flick
    flames.current.forEach((f, i) => { if (f) f.scale.setScalar(Math.max(0.001, table * (1 + 0.18 * Math.sin(t * 11 + i * 2.3) + 0.08 * Math.sin(t * 23 + i)))) })
    if (screenMat.current) screenMat.current.color.setScalar((0.12 + film * 0.8) * (0.85 + 0.15 * flick))
    if (beamMat.current) beamMat.current.opacity = film * 0.2 * flick
    if (wallGlow.current) wallGlow.current.opacity = film * 0.28 * flick
    if (cloth.current) cloth.current.emissiveIntensity = table * 0.25
    guestRefs.current.forEach((g, i) => { if (g) g.scale.setScalar(Math.max(0.001, smooth(0.56 + i * 0.025, 0.61 + i * 0.025, p))) })
    // door glow pulses as each guest steps in
    let pulse = 0
    for (let k = 0; k < 6; k++) { const a = arrivalOf(k); const u = (p - a) / 0.025; if (u > 0 && u < 1) pulse = Math.max(pulse, Math.sin(Math.PI * u)) }
    if (doorGlow.current) doorGlow.current.opacity = pulse * 0.8
  })

  const plates: [number, number][] = [[-0.85, -0.54], [-0.25, -0.54], [-0.85, -0.78], [-0.25, -0.78], [-0.55, -0.54]]
  return (
    <group>
      {/* walls, floor, ceiling */}
      <mesh position={[R(-0.525), 0.125, -0.7]} rotation-x={-Math.PI / 2}><planeGeometry args={[1.95, 1.2]} /><meshStandardMaterial color="#9B6B43" roughness={0.8} /></mesh>
      <mesh position={[R(-0.525), 0.75 + 0.1, BACK_Z]}><planeGeometry args={[1.95, 1.4]} /><meshStandardMaterial color="#A9C3AE" roughness={0.9} /></mesh>
      <mesh position={[R(-1.499), 0.85, -0.7]} rotation-y={Math.PI / 2}><planeGeometry args={[1.2, 1.4]} /><meshStandardMaterial color="#9DB8A3" roughness={0.9} /></mesh>
      <mesh position={[R(0.449), 0.85, -0.7]} rotation-y={-Math.PI / 2}><planeGeometry args={[1.2, 1.4]} /><meshStandardMaterial color="#9DB8A3" roughness={0.9} /></mesh>
      <mesh position={[R(-0.525), 1.448, -0.7]} rotation-x={Math.PI / 2}><planeGeometry args={[1.95, 1.2]} /><meshStandardMaterial color="#F1EEE6" roughness={0.9} /></mesh>
      <mesh position={[R(-0.525), 0.14, BACK_Z + 0.02]}><boxGeometry args={[1.95, 0.05, 0.03]} /><meshStandardMaterial color="#F1EEE6" roughness={0.8} /></mesh>

      {/* table */}
      <mesh position={[R(-0.55), TABLE_Y - 0.015, -0.65]}><boxGeometry args={[1.0, 0.03, 0.5]} /><meshStandardMaterial ref={cloth} color="#7C2236" roughness={0.85} emissive="#7C2236" emissiveIntensity={0} /></mesh>
      {[[-1.0, -0.45], [-0.1, -0.45], [-1.0, -0.85], [-0.1, -0.85]].map(([dx, z], i) => (
        <mesh key={i} position={[R(dx), TABLE_Y / 2 - 0.02, z]}><boxGeometry args={[0.035, TABLE_Y - 0.04, 0.035]} /><meshStandardMaterial color="#4A3324" roughness={0.8} /></mesh>
      ))}
      {plates.map(([dx, z], i) => (
        <mesh key={i} position={[R(dx), TABLE_Y + 0.008, z]}><cylinderGeometry args={[0.06, 0.055, 0.012, 14]} /><meshStandardMaterial color="#FFF8EA" roughness={0.4} /></mesh>
      ))}
      <mesh position={[R(-0.55), TABLE_Y + 0.025, -0.68]}><sphereGeometry args={[0.075, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#D8A84E" metalness={0.6} roughness={0.35} /></mesh>
      {[-0.72, -0.38].map((dx, i) => (
        <group key={dx} position={[R(dx), TABLE_Y, -0.66]}>
          <mesh position={[0, 0.05, 0]}><cylinderGeometry args={[0.014, 0.014, 0.1, 8]} /><meshStandardMaterial color="#FFF8EA" roughness={0.6} /></mesh>
          <mesh ref={(m) => { flames.current[i] = m }} position={[0, 0.125, 0]} scale={0.001}><sphereGeometry args={[0.022, 8, 8]} /><meshBasicMaterial color={new THREE.Color('#FFC25A').multiplyScalar(2.6)} toneMapped={false} /></mesh>
        </group>
      ))}

      {/* seated guests */}
      {GUESTS.map((g, i) => (
        <group key={i} ref={(o) => { guestRefs.current[i] = o }} position={[R(g.dx), 0.13, g.front ? -0.4 : -1.0]} scale={0.001}>
          <mesh position={[0, 0.2, 0]}><capsuleGeometry args={[0.09, 0.14, 4, 10]} /><meshStandardMaterial color={g.c} roughness={0.55} /></mesh>
          <mesh position={[0, 0.45, 0]}><sphereGeometry args={[0.078, 12, 10]} /><meshStandardMaterial color={g.skin} roughness={0.6} /></mesh>
        </group>
      ))}

      {/* tiny screen on the back wall, with the poster */}
      <mesh position={[SCR.x, SCR.y, BACK_Z + 0.012]}><boxGeometry args={[SCR.w + 0.05, SCR.h + 0.05, 0.02]} /><meshStandardMaterial color="#1b1b24" roughness={0.6} /></mesh>
      <mesh position={[SCR.x, SCR.y, BACK_Z + 0.025]}><planeGeometry args={[SCR.w, SCR.h]} /><Screen url={posterUrl} mat={screenMat} /></mesh>
      <mesh position={[SCR.x, SCR.y, BACK_Z + 0.03]}><planeGeometry args={[1.5, 1.2]} /><meshBasicMaterial ref={wallGlow} map={glow} color="#FFE9B8" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></mesh>

      {/* projector on the table + its beam */}
      <mesh position={[LENS.x, LENS.y - 0.07, LENS.z + 0.05]}><boxGeometry args={[0.16, 0.09, 0.14]} /><meshStandardMaterial color="#D8A84E" metalness={0.5} roughness={0.4} /></mesh>
      <mesh ref={beamRef} geometry={beamGeo} position={LENS}><meshBasicMaterial ref={beamMat} color="#FFF3D6" transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} toneMapped={false} /></mesh>

      {lights && <pointLight ref={tableLight} position={[R(-0.55), 1.3, -0.65]} color="#FFB04A" intensity={0} distance={3.2} decay={2} />}
      {lights && <pointLight ref={projLight} position={[R(-0.55), 0.85, -1.0]} color="#FFF3D6" intensity={0} distance={2.6} decay={2} />}

      {/* the door the guests walk to: a warm wash when it opens */}
      <mesh position={[DOOR_X, 0.62, 0.16]}><planeGeometry args={[1.3, 1.5]} /><meshBasicMaterial ref={doorGlow} map={glow} color="#FFB347" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></mesh>
    </group>
  )
}
