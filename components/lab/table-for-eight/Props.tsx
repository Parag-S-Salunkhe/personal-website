'use client'
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { labImg } from '@/components/lab/kit/img'
import { SEATS, TABLE_H, type Seat } from './seats'
import { lathe } from './parts'
import { billboardVert, steamFrag } from './steamShaders'
import type { StageData } from './content'

type Shared = MutableRefObject<{ p: number; s: number }>
const sm = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
const lay = (alpha: number): [number, number, number] => [-(Math.PI / 2 + alpha), 0, Math.PI] // lies on the table, top edge away from the diner, face up and tilted to them
const ang = (s: Seat) => Math.atan2(s.dir[0], s.dir[2])

function wrap(x: CanvasRenderingContext2D, text: string, cx: number, y: number, maxW: number, lh: number, maxLines: number) {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let cur = ''
  for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (x.measureText(t).width > maxW && cur) { lines.push(cur); cur = w } else cur = t }
  if (cur) lines.push(cur)
  lines.slice(0, maxLines).forEach((l, i, a) => x.fillText(i === a.length - 1 && lines.length > maxLines ? `${l}…` : l, cx, y + i * lh))
  return Math.min(lines.length, maxLines)
}

/** A canvas texture redrawn once the fonts exist. */
function useTextTex(w: number, h: number, draw: (x: CanvasRenderingContext2D, fam: { serif: string; script: string }) => void, key: string) {
  const gl = useThree((s) => s.gl)
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = w; c.height = h
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8
    return t
  }, [w, h])
  const drawRef = useRef(draw)
  drawRef.current = draw
  useEffect(() => {
    let alive = true
    const cs = getComputedStyle(gl.domElement)
    const fam = { serif: cs.getPropertyValue('--font-gilda').trim() || 'serif', script: cs.getPropertyValue('--font-pinyon').trim() || 'cursive' }
    const go = () => { const x = (tex.image as HTMLCanvasElement).getContext('2d')!; drawRef.current(x, fam); tex.needsUpdate = true }
    go()
    Promise.all([document.fonts.load(`40px ${fam.serif}`), document.fonts.load(`60px ${fam.script}`)]).then(() => { if (alive) go() }).catch(() => {})
    return () => { alive = false }
  }, [gl, tex, key])
  useEffect(() => () => tex.dispose(), [tex])
  return tex
}

function paper(x: CanvasRenderingContext2D, w: number, h: number) {
  x.fillStyle = '#F6F1E4'; x.fillRect(0, 0, w, h)
  x.strokeStyle = '#B88A44'; x.lineWidth = 3; x.strokeRect(12, 12, w - 24, h - 24)
}

function Poster({ stage }: { stage: StageData }) {
  const [map, setMap] = useState<THREE.Texture | null>(null)
  useEffect(() => {
    if (!stage.posterUrl) return
    const src = labImg(stage.posterUrl, 384)
    if (!src) return
    let dead = false
    new THREE.TextureLoader().load(src, (t) => { if (dead) { t.dispose(); return } t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; setMap(t) })
    return () => { dead = true }
  }, [stage.posterUrl])
  useEffect(() => () => map?.dispose(), [map])
  const fallback = useTextTex(256, 384, (x, f) => { paper(x, 256, 384); x.fillStyle = '#17352A'; x.textAlign = 'center'; x.font = `34px ${f.serif}`; wrap(x, stage.movieTitle, 128, 170, 200, 40, 5) }, stage.movieTitle)
  return (
    <>
      <mesh position={[0, 0, -0.001]}><planeGeometry args={[0.218, 0.318]} /><meshStandardMaterial color="#F6F1E4" roughness={0.9} /></mesh>
      <mesh castShadow>
        <planeGeometry args={[0.2, 0.3]} />
        <meshStandardMaterial map={map ?? fallback} emissiveMap={map ?? fallback} emissive="#ffffff" emissiveIntensity={0.35} roughness={0.7} />
      </mesh>
    </>
  )
}

function Letter({ title, body }: { title: string; body: string }) {
  const tex = useTextTex(384, 480, (x, f) => {
    paper(x, 384, 480)
    x.fillStyle = '#7C2236'; x.textAlign = 'center'; x.font = `64px ${f.script}`; x.fillText('You are invited', 192, 92)
    x.fillStyle = '#17352A'; x.font = `34px ${f.serif}`
    const n = wrap(x, title, 192, 160, 316, 42, 4)
    x.font = `22px sans-serif`; x.fillStyle = 'rgba(23,53,42,.75)'
    wrap(x, body, 192, 160 + n * 42 + 26, 316, 28, 5)
  }, title + body)
  return <mesh castShadow><planeGeometry args={[0.15, 0.188]} /><meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.4} roughness={0.85} side={THREE.DoubleSide} /></mesh>
}

function NoteCard({ title }: { title: string }) {
  const tex = useTextTex(384, 256, (x, f) => { paper(x, 384, 256); x.fillStyle = '#17352A'; x.textAlign = 'center'; x.font = `38px ${f.serif}`; wrap(x, title, 192, 100, 300, 46, 3) }, title)
  return <mesh castShadow><planeGeometry args={[0.15, 0.1]} /><meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.45} roughness={0.85} side={THREE.DoubleSide} /></mesh>
}

function InviteCard() {
  const tex = useTextTex(384, 256, (x, f) => {
    paper(x, 384, 256); x.fillStyle = '#7C2236'; x.textAlign = 'center'; x.font = `62px ${f.script}`; x.fillText('For you', 192, 84)
    x.fillStyle = '#17352A'; x.font = `32px ${f.serif}`; wrap(x, 'Leave a note at the table', 192, 150, 300, 40, 2)
  }, 'invite')
  return <mesh castShadow><planeGeometry args={[0.15, 0.1]} /><meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.5} roughness={0.85} /></mesh>
}

export default function Props({ shared, stage, still, light }: { shared: Shared; stage: StageData; still: boolean; light: boolean }) {
  const seat = SEATS
  const cloche = useRef<THREE.Group>(null)
  const flap = useRef<THREE.Group>(null)
  const letter = useRef<THREE.Group>(null)
  const poster = useRef<THREE.Group>(null)
  const fan = useRef<(THREE.Group | null)[]>([])
  const invite = useRef<THREE.Group>(null)
  const pen = useRef<THREE.Mesh>(null)
  const steam = useMemo(() => Array.from({ length: light ? 2 : 3 }, (_, k) => new THREE.ShaderMaterial({
    vertexShader: billboardVert, fragmentShader: steamFrag, transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uGrow: { value: 0 }, uSeed: { value: k * 0.37 + 0.11 }, uInt: { value: 3.2 }, uColor: { value: new THREE.Color('#F7E3BC') }, uSize: { value: new THREE.Vector2(0.42, 0.8) } },
  })), [light])
  useEffect(() => () => steam.forEach((m) => m.dispose()), [steam])
  const domeGeo = useMemo(() => lathe([[0.0, 0.2], [0.04, 0.198], [0.09, 0.18], [0.13, 0.13], [0.155, 0.07], [0.165, 0.012], [0.172, 0.004], [0.16, 0.0], [0.15, 0.01], [0.12, 0.065], [0.085, 0.12], [0.04, 0.15], [0.0, 0.155]], 40), [])
  const silver = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e8eaf0', metalness: 0.85, roughness: 0.3, emissive: '#6a5a48', emissiveIntensity: 0.55, envMapIntensity: 2.2, side: THREE.DoubleSide }), [])
  const food = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c2531f', roughness: 0.6 }), [])
  const green = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4d7a45', roughness: 0.7 }), [])
  const env = useMemo(() => new THREE.MeshStandardMaterial({ color: '#E9DFC8', roughness: 0.95 }), [])
  const flapGeo = useMemo(() => { const g = new THREE.BufferGeometry(); g.setFromPoints([new THREE.Vector3(-0.1, 0, 0), new THREE.Vector3(0.1, 0, 0), new THREE.Vector3(0, 0.07, 0)]); g.setIndex([0, 1, 2]); g.computeVertexNormals(); return g }, [])
  const claret = useMemo(() => new THREE.MeshStandardMaterial({ color: '#7C2236', roughness: 0.5 }), [])
  const brass = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c79a4a', metalness: 0.9, roughness: 0.3 }), [])
  const noteTitles = stage.noteTitles.slice(0, light ? 3 : 4)

  useFrame(({ clock }) => {
    const s = still ? 9 : shared.current.s
    const t = clock.elapsedTime
    const pk = sm(0.55, 1.0, s) // poster slides onto the plate
    if (poster.current) { poster.current.position.set(0, 0.1 + (1 - pk) * 0.35, 0.02 - (1 - pk) * 0.12); poster.current.scale.setScalar(0.4 + 0.6 * pk) }
    const k = sm(1.5, 2.25, s) // cloche lifts
    if (cloche.current) { cloche.current.position.set(k * 0.3, 0.012 + k * 0.2 + Math.sin(t * 1.3) * 0.004 * k, k * 0.04); cloche.current.rotation.set(0, 0, -k * 0.7) }
    steam.forEach((m, i) => { m.uniforms.uTime.value = t + i * 0.9; m.uniforms.uGrow.value = sm(1.8, 2.5, s) })
    const e = sm(2.25, 2.75, s), l = sm(2.55, 3.25, s) // envelope flap, then letter
    if (flap.current) flap.current.rotation.x = e * 2.7
    if (letter.current) { letter.current.scale.setScalar(0.6 + 0.4 * l); letter.current.position.set(0, 0.016 + l * 0.095, -0.01 + l * 0.01); letter.current.rotation.set(-(Math.PI / 2 + 0.25) * (1 - l * 0.35) - l * 0.35, 0, Math.PI) }
    const fk = sm(3.45, 4.1, s) // notes fan
    fan.current.forEach((g, i) => { if (g) g.rotation.y = (i - (noteTitles.length - 1) / 2) * 0.36 * fk })
    const ik = sm(7.4, 8.0, s)
    if (invite.current) invite.current.position.set(0, 0.03 + (1 - ik) * 0.25, 0.0)
    if (pen.current) pen.current.rotation.z = Math.PI / 2 + Math.sin(t * 0.9) * 0.02
  })

  return (
    <>
      {/* seat 1: the poster lies on the plate like a printed menu card */}
      <group position={seat[0].pos} rotation={[0, ang(seat[0]), 0]}>
        <group ref={poster} rotation={lay(0.55)}><Poster stage={stage} /></group>
      </group>

      {/* seat 2: a cloche lifts off the dish, steam rises */}
      <group position={seat[1].pos} rotation={[0, ang(seat[1]), 0]}>
        <mesh material={food} position={[0, 0.045, 0]} scale={[0.1, 0.035, 0.1]} castShadow><sphereGeometry args={[1, 20, 14]} /></mesh>
        {[0, 1, 2, 3, 4].map((i) => <mesh key={i} material={green} position={[Math.cos(i * 1.26) * 0.06, 0.07, Math.sin(i * 1.26) * 0.06]} scale={[0.03, 0.012, 0.022]} rotation={[0, i, 0]}><sphereGeometry args={[1, 8, 6]} /></mesh>)}
        <group ref={cloche}><mesh geometry={domeGeo} material={silver} castShadow /></group>
        <group position={[0, 0.1, 0]}>
          {steam.map((m, i) => (
            <mesh key={i} position={[Math.cos(i * 2.1) * 0.05, 0, Math.sin(i * 2.1) * 0.04]} material={m} renderOrder={10 + i} frustumCulled={false}><planeGeometry args={[1, 1]} /></mesh>
          ))}
        </group>
      </group>

      {/* seat 3: an invitation envelope opens to the latest post */}
      <group position={seat[2].pos} rotation={[0, ang(seat[2]), 0]} scale={1.35}>
        <mesh material={env} position={[0, 0.019, 0]} castShadow receiveShadow><boxGeometry args={[0.2, 0.01, 0.13]} /></mesh>
        <group ref={letter} position={[0, 0.02, 0]} rotation={lay(0.25)}><Letter title={stage.postTitle} body={stage.postExcerpt} /></group>
        <group ref={flap} position={[0, 0.0245, 0.065]}>
          <group rotation={[-Math.PI / 2, 0, 0]}>
            <mesh geometry={flapGeo} castShadow><meshStandardMaterial color="#E1D5B8" roughness={0.95} side={THREE.DoubleSide} /></mesh>
            <mesh position={[0, 0.062, 0.001]} material={claret}><circleGeometry args={[0.011, 16]} /></mesh>
          </group>
        </group>
      </group>

      {/* seat 4: place cards in a fan */}
      <group position={[seat[3].pos[0], seat[3].pos[1], seat[3].pos[2]]} rotation={[0, ang(seat[3]), 0]}>
        {noteTitles.map((n, i) => (
          <group key={i} ref={(g) => { fan.current[i] = g }} position={[0, 0.02, -0.1]}>
            <group position={[0, 0.002 * i, 0.1]} rotation={lay(0.3)}><NoteCard title={n} /></group>
          </group>
        ))}
      </group>

      {/* seat 5: a closed book for the projects */}
      <group position={seat[4].pos} rotation={[0, ang(seat[4]) + 0.3, 0]}>
        <mesh material={claret} position={[0, 0.03, 0.0]} castShadow><boxGeometry args={[0.15, 0.03, 0.2]} /></mesh>
        <mesh material={brass} position={[0, 0.0455, 0]}><boxGeometry args={[0.09, 0.001, 0.12]} /></mesh>
      </group>

      {/* the ninth place: a card and a pen, "for you" */}
      <group position={seat[7].pos} rotation={[0, ang(seat[7]), 0]}>
        <group ref={invite} rotation={lay(0.3)}><InviteCard /></group>
        <mesh ref={pen} material={brass} position={[0.2, 0.012, 0.02]} rotation={[0, 0.5, Math.PI / 2]} castShadow><cylinderGeometry args={[0.005, 0.004, 0.15, 10]} /></mesh>
      </group>
    </>
  )
}
