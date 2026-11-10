'use client'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { AdditiveBlending, BufferGeometry, CanvasTexture, Color, MeshStandardMaterial, Float32BufferAttribute, Object3D, SRGBColorSpace, Shape, ShapeGeometry, TextureLoader, type InstancedMesh, type MeshBasicMaterial, type PointLight, type Texture } from 'three'
import Bulbs from './Bulbs'
import Board from './Board'
import Blade from './Blade'
import { smooth, type Story } from './timeline'

const BG = '#14070d'
const BRASS = '#D8A84E'

function usePoster(url: string | undefined) {
  const [tex, setTex] = useState<Texture | null>(null)
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    if (!url) return
    let live = true
    new TextureLoader().load(url, (t) => { t.colorSpace = SRGBColorSpace; if (live) { setTex(t); invalidate() } }, undefined, () => {})
    return () => { live = false }
  }, [url, invalidate])
  return tex
}

function Poster({ url, x }: { url?: string; x: number }) {
  const tex = usePoster(url)
  return (
    <group position={[x, 1.85, 0.64]}>
      <mesh position={[0, 0, -0.02]}><boxGeometry args={[1.12, 1.62, 0.06]} /><meshStandardMaterial color={BRASS} metalness={0.9} roughness={0.35} /></mesh>
      <mesh position={[0, 0, 0.02]}><planeGeometry args={[0.96, 1.44]} />{tex ? <meshBasicMaterial map={tex} color="#cfc2aa" toneMapped={false} /> : <meshStandardMaterial color="#2B0B14" />}</mesh>
    </group>
  )
}

function radialTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, 'rgba(255,159,67,.9)'); g.addColorStop(0.5, 'rgba(255,159,67,.25)'); g.addColorStop(1, 'rgba(255,159,67,0)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256)
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t
}
function skyTex() {
  const c = document.createElement('canvas'); c.width = 4; c.height = 256
  const ctx = c.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, 0, 256)
  g.addColorStop(0, '#08040c'); g.addColorStop(0.55, '#1a0a1c'); g.addColorStop(0.86, '#10353a'); g.addColorStop(1, '#1d5a56')
  ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 256)
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t
}
function rng(seed: number) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }

function Sunburst({ brass }: { brass: MeshStandardMaterial }) {
  const ref = useRef<InstancedMesh>(null)
  const geo = useMemo(() => { const s = new Shape(); s.moveTo(-0.05, 0.62); s.lineTo(0.05, 0.62); s.lineTo(0.14, 2.15); s.lineTo(-0.14, 2.15); return new ShapeGeometry(s) }, [])
  useLayoutEffect(() => {
    const m = ref.current; if (!m) return
    const o = new Object3D()
    for (let i = 0; i < 17; i++) { o.position.set(0, 0, 0); o.rotation.set(0, 0, ((-85 + i * 10.625) * Math.PI) / 180); o.updateMatrix(); m.setMatrixAt(i, o.matrix) }
    m.instanceMatrix.needsUpdate = true
  }, [])
  return (
    <group position={[0, 8.05, 0.64]}>
      <mesh><circleGeometry args={[2.35, 48, 0, Math.PI]} /><meshStandardMaterial color="#123a39" roughness={0.6} metalness={0.2} /></mesh>
      <instancedMesh ref={ref} args={[geo, brass, 17]} position={[0, 0, 0.02]} />
      <mesh position={[0, 0, 0.03]}><circleGeometry args={[0.5, 32, 0, Math.PI]} /><primitive object={brass} attach="material" /></mesh>
    </group>
  )
}

function Chevrons({ brass }: { brass: MeshStandardMaterial }) {
  const ref = useRef<InstancedMesh>(null)
  useLayoutEffect(() => {
    const m = ref.current; if (!m) return
    const o = new Object3D(); let i = 0
    for (const sx of [-1, 1]) for (let r = 0; r < 6; r++) for (const sd of [-1, 1]) {
      o.position.set(sx * 5.0 + sd * 0.3, 3.9 + r * 0.46, 0.55); o.rotation.set(0, 0, sd * 0.6); o.updateMatrix(); m.setMatrixAt(i++, o.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  }, [])
  return <instancedMesh ref={ref} args={[undefined, brass, 24]}><boxGeometry args={[0.09, 0.82, 0.05]} /></instancedMesh>
}

function Stars() {
  const geo = useMemo(() => {
    const r = rng(7), a: number[] = []
    for (let i = 0; i < 160; i++) a.push((r() - 0.5) * 100, 12 + r() * 34, -17.8)
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(a, 3)); return g
  }, [])
  return <points geometry={geo}><pointsMaterial size={0.14} color="#FFF3D6" sizeAttenuation fog={false} transparent opacity={0.75} /></points>
}

export default function World({ story, light, posters, texts, family }: { story: MutableRefObject<Story>; light: boolean; posters: string[]; texts: string[]; family: string }) {
  const brassM = useMemo(() => new MeshStandardMaterial({ color: BRASS, metalness: 0.95, roughness: 0.3, emissive: new Color(BRASS), emissiveIntensity: 0.04 }), [])
  useEffect(() => () => brassM.dispose(), [brassM])
  const glowTex = useMemo(radialTex, [])
  const sky = useMemo(skyTex, [])
  const lCanopy = useRef<PointLight>(null), lBoard = useRef<PointLight>(null), lBlade = useRef<PointLight>(null)
  const doorMat = useRef<MeshBasicMaterial>(null), glowMat = useRef<MeshBasicMaterial>(null)
  useFrame(() => {
    const p = story.current.p
    const pw = smooth(0.06, 0.26, p), bp = smooth(0.2, 0.3, p), blp = smooth(0.14, 0.27, p)
    if (lCanopy.current) lCanopy.current.intensity = 95 * pw
    if (lBoard.current) lBoard.current.intensity = 40 * bp
    if (lBlade.current) lBlade.current.intensity = 9 * blp
    brassM.emissiveIntensity = 0.02 + 0.09 * pw
    if (doorMat.current) doorMat.current.color.set('#FF9F43').multiplyScalar(0.03 + 0.7 * pw)
    if (glowMat.current) glowMat.current.opacity = 0.62 * pw
  })
  const lacq = '#3a1220', wing = '#2B0B14'
  const B = (props: { p: [number, number, number]; s: [number, number, number] }) => (
    <mesh position={props.p}><boxGeometry args={props.s} /><primitive object={brassM} attach="material" /></mesh>
  )
  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 34, 100]} />
      <Environment resolution={128} frames={1} environmentIntensity={0.7}>
        <Lightformer form="rect" intensity={2.2} color="#FF9F43" position={[0, 3, 9]} scale={[10, 2.5, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#7fbab6" position={[-9, 8, 5]} scale={[6, 8, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#FFF3D6" position={[0, 12, 2]} rotation={[Math.PI / 2, 0, 0]} scale={[12, 6, 1]} />
      </Environment>
      <ambientLight intensity={0.35} color="#4a6a72" />
      <directionalLight position={[-8, 12, 10]} intensity={1.1} color="#8fc3c4" />
      <pointLight ref={lCanopy} position={[0, 2.6, 3.4]} color="#FF9F43" decay={2} />
      <pointLight ref={lBoard} position={[0, 6, 3.2]} color="#FFD9A0" decay={2} />
      <pointLight ref={lBlade} position={[-3.6, 8, 3]} color="#FFB45E" decay={2} />

      {/* sky + street */}
      <mesh position={[0, 24, -18]}><planeGeometry args={[150, 48]} /><meshBasicMaterial map={sky} fog={false} toneMapped={false} /></mesh>
      <Stars />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 11]}><planeGeometry args={[150, 58]} /><meshStandardMaterial color="#241219" roughness={0.28} metalness={0.55} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 6.5]}><planeGeometry args={[18, 11]} /><meshBasicMaterial ref={glowMat} map={glowTex} transparent opacity={0} depthWrite={false} blending={AdditiveBlending} toneMapped={false} /></mesh>

      {/* stepped facade */}
      <mesh position={[0, 4.75, 0]}><boxGeometry args={[6.4, 9.5, 1.2]} /><meshStandardMaterial color={lacq} roughness={0.55} metalness={0.15} /></mesh>
      <mesh position={[0, 9.95, 0]}><boxGeometry args={[5.0, 0.9, 1.2]} /><meshStandardMaterial color={lacq} roughness={0.55} metalness={0.15} /></mesh>
      <mesh position={[0, 10.8, 0]}><boxGeometry args={[3.6, 0.8, 1.2]} /><meshStandardMaterial color={lacq} roughness={0.55} metalness={0.15} /></mesh>
      <mesh position={[0, 11.6, 0]}><boxGeometry args={[2.2, 0.8, 1.2]} /><meshStandardMaterial color={lacq} roughness={0.55} metalness={0.15} /></mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 4.8, 3.25, -0.05]}><boxGeometry args={[3.2, 6.5, 1.1]} /><meshStandardMaterial color={wing} roughness={0.55} metalness={0.15} /></mesh>
          <mesh position={[s * 6.7, 2.6, -0.1]}><boxGeometry args={[1.0, 5.2, 1.0]} /><meshStandardMaterial color="#1f0a12" roughness={0.55} metalness={0.15} /></mesh>
        </group>
      ))}
      {(
        <>
          <B p={[0, 12.55, 0.1]} s={[0.22, 1.5, 0.22]} />
          {[-1, 1].map((s) => (
            <group key={s}>
              <B p={[s * 3.12, 4.75, 0.62]} s={[0.1, 9.5, 0.06]} />
              <B p={[s * 2.9, 4.75, 0.62]} s={[0.05, 9.5, 0.05]} />
              <B p={[s * 4.8, 6.55, 0.55]} s={[3.3, 0.12, 0.12]} />
              <B p={[s * 6.7, 5.25, 0.45]} s={[1.1, 0.1, 0.1]} />
              <B p={[s * 2.2, 0.08, 0.64]} s={[1.5, 0.08, 0.05]} />
            </group>
          ))}
          <B p={[0, 9.5, 0.62]} s={[6.5, 0.12, 0.1]} />
          <B p={[0, 10.4, 0.62]} s={[5.1, 0.1, 0.08]} />
          <B p={[0, 11.2, 0.62]} s={[3.7, 0.1, 0.08]} />
          <B p={[0, 12.0, 0.62]} s={[2.3, 0.1, 0.08]} />
          {/* canopy edging */}
          <B p={[0, 3.68, 3.44]} s={[7.72, 0.07, 0.07]} />
          <B p={[0, 3.12, 3.44]} s={[7.72, 0.07, 0.07]} />
          <B p={[-3.84, 3.68, 2.03]} s={[0.07, 0.07, 2.84]} />
          <B p={[3.84, 3.68, 2.03]} s={[0.07, 0.07, 2.84]} />
          <B p={[-3.84, 3.12, 2.03]} s={[0.07, 0.07, 2.84]} />
          <B p={[3.84, 3.12, 2.03]} s={[0.07, 0.07, 2.84]} />
          {/* door frame */}
          <B p={[0, 2.64, 0.66]} s={[2.0, 0.1, 0.08]} />
          <B p={[-0.95, 1.3, 0.66]} s={[0.1, 2.7, 0.08]} />
          <B p={[0.95, 1.3, 0.66]} s={[0.1, 2.7, 0.08]} />
          {/* bracket arms to blade */}
          <B p={[-3.4, 4.7, 1.12]} s={[0.12, 0.12, 1.1]} />
          <B p={[-3.4, 9.8, 1.12]} s={[0.12, 0.12, 1.1]} />
          <Sunburst brass={brassM} />
          <Chevrons brass={brassM} />
        </>
      )}
      <mesh position={[0, 3.4, 2.03]}><boxGeometry args={[7.64, 0.5, 2.82]} /><meshStandardMaterial color="#6B1A2B" roughness={0.5} metalness={0.2} /></mesh>
      <mesh position={[0, 1.35, 0.62]}><planeGeometry args={[1.8, 2.6]} /><meshBasicMaterial ref={doorMat} color="#FF9F43" toneMapped={false} /></mesh>
      <Poster url={posters[0]} x={-2.2} />
      <Poster url={posters[1]} x={2.2} />

      <Board story={story} texts={texts} family={family} />
      <Blade story={story} family={family} />
      <Bulbs key={light ? 'l' : 'f'} story={story} light={light} />
    </>
  )
}
