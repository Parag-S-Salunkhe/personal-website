'use client'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, DoubleSide, Group, LatheGeometry, SRGBColorSpace, Vector2 } from 'three'
import Steam from './Steam'
import { rng, type Recipe } from './dishes'
import type { Sim } from './story'

const PLATE = [[0, 0.03], [0.85, 0.03], [1.15, 0.07], [1.45, 0.15], [1.5, 0.17], [1.52, 0.15], [1.48, 0.12], [1.1, 0.03], [0.7, 0], [0, 0]]
const BOWL = [[0, 0.02], [0.5, 0.03], [1.0, 0.25], [1.3, 0.6], [1.4, 0.78], [1.43, 0.8], [1.38, 0.76], [1.2, 0.45], [0.9, 0.12], [0.5, 0], [0, 0]]
export const dishHeight = (k: number) => (k === 1 ? 0.62 : 0.28)

/** Top-down painted food texture: blotches of the recipe colours, drizzle and specks. */
function paint(recipe: Recipe, base: string, alt: string, swirl: boolean): CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 384
  const g = c.getContext('2d')!
  const r = rng(recipe.seed ^ 0x9e3779b9)
  g.fillStyle = base; g.fillRect(0, 0, 384, 384)
  for (let i = 0; i < 90; i++) {
    const x = r() * 384, y = r() * 384, rad = 10 + r() * 40
    const gr = g.createRadialGradient(x, y, 0, x, y, rad)
    gr.addColorStop(0, (r() > 0.5 ? alt : recipe.herb) + (r() > 0.7 ? 'cc' : '55')); gr.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2)
  }
  if (swirl) {
    g.strokeStyle = 'rgba(255,248,234,.75)'; g.lineWidth = 6; g.lineCap = 'round'
    g.beginPath()
    for (let a = 0; a < 18; a += 0.15) { const rr = 8 + a * 9; g.lineTo(192 + Math.cos(a) * rr * (0.9 + 0.1 * Math.sin(a * 3)), 192 + Math.sin(a) * rr) }
    g.stroke()
  }
  for (let i = 0; i < 160; i++) { g.fillStyle = r() > 0.5 ? recipe.herb : '#FFF8EA'; g.globalAlpha = 0.5 + r() * 0.4; g.fillRect(r() * 384, r() * 384, 2 + r() * 3, 2 + r() * 3) }
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  return t
}

type Lump = { p: [number, number, number]; s: [number, number, number]; r: [number, number, number]; c: string }

function lumps(recipe: Recipe): Lump[] {
  const r = rng(recipe.seed ^ 0x51ed)
  const out: Lump[] = []
  if (recipe.kind === 2) {
    for (let i = 0; i < 3; i++) { const a = -0.9 + i * 0.9 + r() * 0.2; out.push({ p: [Math.sin(a) * 0.55, 0.2, -Math.cos(a) * 0.35 + 0.05], s: [0.3 + r() * 0.06, 0.22, 0.3 + r() * 0.06], r: [0, r() * 3, 0], c: i === 1 ? recipe.food2 : recipe.food }) }
  } else if (recipe.kind === 3) {
    for (let i = 0; i < 20; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 0.7; out.push({ p: [Math.cos(a) * d, 0.1 + r() * 0.22, Math.sin(a) * d], s: [0.2 + r() * 0.12, 0.05, 0.12 + r() * 0.06], r: [r() * 0.8, r() * 6.28, r() * 0.8], c: r() > 0.8 ? '#A5382F' : r() > 0.5 ? recipe.herb : '#7FA86A' }) }
    for (let i = 0; i < 4; i++) out.push({ p: [(r() - 0.5) * 1.0, 0.3, (r() - 0.5) * 0.9], s: [0.11, 0.11, 0.11], r: [0, 0, 0], c: '#B5352B' })
  }
  for (let i = 0; i < (recipe.kind === 1 ? 7 : 12); i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 0.7; out.push({ p: [Math.cos(a) * d, recipe.kind === 1 ? 0.6 : 0.34 + r() * 0.1, Math.sin(a) * d], s: [0.05, 0.02, 0.09], r: [0, r() * 6.28, 0], c: recipe.herb }) }
  return out
}

export default function Dish3D({ recipe, index, sim, tier }: { recipe: Recipe; index: number; sim: Sim; tier: 'full' | 'light' }) {
  const group = useRef<Group>(null)
  const kind = recipe.kind
  const plate = useMemo(() => new LatheGeometry((kind === 1 ? BOWL : PLATE).map(([x, y]) => new Vector2(x, y)), 64), [kind])
  const tex = useMemo(() => paint(recipe, kind === 1 ? recipe.sauce : kind === 0 ? recipe.sauce : kind === 2 ? '#F1EEE6' : '#2F5B2E', kind === 2 ? recipe.sauce : recipe.food, kind === 1), [recipe, kind])
  const parts = useMemo(() => lumps(recipe), [recipe])
  useEffect(() => () => { plate.dispose(); tex.dispose() }, [plate, tex])

  useFrame(() => {
    const g = group.current
    if (!g) return
    const pl = sim.plates[index]
    g.visible = pl.vis
    g.position.set(pl.x, pl.lift, 0)
    g.rotation.set(0, pl.ry, pl.rz)
  })

  return (
    <group ref={group} visible={false}>
      <mesh geometry={plate}><meshStandardMaterial color="#F1EEE6" roughness={0.2} metalness={0.02} side={DoubleSide} /></mesh>
      {kind !== 1 && <mesh position={[0, 0.103, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.27, 0.014, 8, 80]} /><meshStandardMaterial color={recipe.seed % 2 ? '#7C2236' : '#A9C3AE'} roughness={0.4} /></mesh>}
      {/* the food itself */}
      {kind === 0 && (<>
        <mesh position={[0, 0.036, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.86, 48]} /><meshStandardMaterial map={tex} roughness={0.5} /></mesh>
        <mesh position={[0, 0.2, 0]} scale={[1, 0.62, 1]}><torusKnotGeometry args={[0.38, 0.17, 140, 12, 2, 5]} /><meshStandardMaterial color={recipe.food} roughness={0.42} /></mesh>
      </>)}
      {kind === 1 && (
        <mesh position={[0, 0.56, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[1.12, 56]} /><meshStandardMaterial map={tex} roughness={0.28} /></mesh>
      )}
      {kind === 2 && (<>
        <mesh position={[0.05, 0.036, 0.05]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.85, 48]} /><meshStandardMaterial map={tex} roughness={0.35} /></mesh>
      </>)}
      {kind === 3 && (
        <mesh position={[0, 0.036, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.8, 48]} /><meshStandardMaterial map={tex} roughness={0.5} /></mesh>
      )}
      {parts.map((l, i) => (
        <mesh key={i} position={l.p} scale={l.s} rotation={l.r}>
          <sphereGeometry args={[1, tier === 'light' ? 10 : 18, tier === 'light' ? 8 : 14]} />
          <meshStandardMaterial color={l.c} roughness={0.55} />
        </mesh>
      ))}
      <Steam sim={sim} index={index} count={tier === 'light' ? 3 : 6} baseY={dishHeight(kind) + 0.15} />
    </group>
  )
}
