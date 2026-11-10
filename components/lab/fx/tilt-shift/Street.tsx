'use client'
import { useLayoutEffect, useMemo } from 'react'
import * as THREE from 'three'
import { BRICKS, DOORS, DOOR_DX, HEIGHTS, HOST, HOST_WIN_DX, HOUSE_D, HOUSE_W, N_HOUSES, houseX, rng } from './types'

const CREAM = '#EDE6D6'
const STONE = '#A8A29B'
export const FLOOR1 = 1.55
export const HOST_CX = houseX(HOST)
export const HOST_H = HEIGHTS[HOST]

/** Static diorama: slab, road, pavement, terraced houses, roofs, doors, trees, cars. No per-frame work. */
export default function Street({ cast }: { cast: boolean }) {
  const roofGeo = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-1.45, 0); s.lineTo(1.45, 0); s.lineTo(0, 0.95); s.closePath()
    const g = new THREE.ExtrudeGeometry(s, { depth: HOUSE_W, bevelEnabled: false })
    g.translate(0, 0, -HOUSE_W / 2)
    return g
  }, [])
  useLayoutEffect(() => () => roofGeo.dispose(), [roofGeo])

  const trees = useMemo(() => {
    const r = rng(11)
    const out: { x: number; z: number; s: number; c: string }[] = []
    const greens = ['#3E9B5B', '#2F7D4E', '#5BAE5A', '#E08A3C', '#4C9A62']
    for (let x = -12; x <= 12; x += 2.4) out.push({ x: x + (r() - 0.5) * 1.2, z: -5.2 - r() * 1.6, s: 0.8 + r() * 0.6, c: greens[Math.floor(r() * greens.length)] })
    for (const x of [-11, -8.4, 10.8, 12.2]) out.push({ x, z: 4.0, s: 0.7 + r() * 0.3, c: greens[Math.floor(r() * greens.length)] })
    return out
  }, [])

  const lane = useMemo(() => Array.from({ length: 12 }, (_, i) => -12.5 + i * 2.3), [])

  return (
    <group>
      {/* the diorama table: slab, back garden, pavement, road */}
      <mesh position={[0, -0.3, -1.6]} receiveShadow><boxGeometry args={[28, 0.6, 13.2]} /><meshStandardMaterial color="#6B4A38" roughness={0.9} /></mesh>
      <mesh position={[0, -0.9, 0]}><boxGeometry args={[120, 0.6, 80]} /><meshStandardMaterial color="#2A3262" roughness={1} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, -5.4]} receiveShadow><planeGeometry args={[28, 6]} /><meshStandardMaterial color="#58A05A" roughness={1} /></mesh>
      <mesh position={[0, 0.03, 0.5]} receiveShadow><boxGeometry args={[28, 0.06, 1.0]} /><meshStandardMaterial color={STONE} roughness={0.9} /></mesh>
      <mesh position={[0, 0.02, 2.4]} receiveShadow><boxGeometry args={[28, 0.04, 2.6]} /><meshStandardMaterial color="#454B5E" roughness={0.95} /></mesh>
      <mesh position={[0, 0.03, 4.0]} receiveShadow><boxGeometry args={[28, 0.06, 0.6]} /><meshStandardMaterial color={STONE} roughness={0.9} /></mesh>
      <mesh position={[0, 0.065, 1.03]}><boxGeometry args={[28, 0.05, 0.06]} /><meshStandardMaterial color="#8d8780" roughness={0.9} /></mesh>
      {lane.map((x) => (
        <mesh key={x} position={[x, 0.045, 2.4]}><boxGeometry args={[1.1, 0.01, 0.08]} /><meshStandardMaterial color="#E9DFC0" roughness={0.9} /></mesh>
      ))}

      {Array.from({ length: N_HOUSES }, (_, i) => {
        const cx = houseX(i)
        const h = HEIGHTS[i]
        const brick = BRICKS[i % BRICKS.length]
        const host = i === HOST
        return (
          <group key={i}>
            {host ? (
              <group>
                <mesh position={[cx, FLOOR1 + (h - FLOOR1) / 2, -HOUSE_D / 2]} castShadow={cast} receiveShadow><boxGeometry args={[HOUSE_W, h - FLOOR1, HOUSE_D]} /><meshStandardMaterial color={brick} roughness={0.85} /></mesh>
                <mesh position={[cx + 0.975, FLOOR1 / 2, -HOUSE_D / 2]} castShadow={cast} receiveShadow><boxGeometry args={[1.05, FLOOR1, HOUSE_D]} /><meshStandardMaterial color={brick} roughness={0.85} /></mesh>
                <mesh position={[cx - 0.525, FLOOR1 / 2, -1.3 - 0.55]} receiveShadow><boxGeometry args={[1.95, FLOOR1, 1.1]} /><meshStandardMaterial color={brick} roughness={0.85} /></mesh>
                {/* front wall around the bay opening (x -1.3..0.2, y 0.3..1.45) */}
                <mesh position={[cx - 1.4, FLOOR1 / 2, -0.06]} castShadow={cast}><boxGeometry args={[0.2, FLOOR1, 0.12]} /><meshStandardMaterial color={brick} roughness={0.85} /></mesh>
                <mesh position={[cx + 0.325, FLOOR1 / 2, -0.06]} castShadow={cast}><boxGeometry args={[0.25, FLOOR1, 0.12]} /><meshStandardMaterial color={brick} roughness={0.85} /></mesh>
                <mesh position={[cx - 0.55, 0.15, -0.06]} castShadow={cast}><boxGeometry args={[1.5, 0.3, 0.12]} /><meshStandardMaterial color={brick} roughness={0.85} /></mesh>
                <mesh position={[cx - 0.525, 1.5, -0.65]}><boxGeometry args={[1.95, 0.1, 1.2]} /><meshStandardMaterial color={CREAM} roughness={0.9} /></mesh>
                <mesh position={[cx - 0.525, 1.5, -0.06]} castShadow={cast}><boxGeometry args={[1.95, 0.1, 0.12]} /><meshStandardMaterial color={brick} roughness={0.85} /></mesh>
                {/* bay window frame */}
                {[[HOST_WIN_DX, 0.3, 1.5, 0.07], [HOST_WIN_DX, 1.45, 1.5, 0.07]].map(([dx, y, w, t], k) => (
                  <mesh key={k} position={[cx + dx, y, 0.03]}><boxGeometry args={[w, t, 0.1]} /><meshStandardMaterial color={CREAM} roughness={0.7} /></mesh>
                ))}
                {[HOST_WIN_DX - 0.75, HOST_WIN_DX + 0.75].map((dx, k) => (
                  <mesh key={k} position={[cx + dx, 0.875, 0.03]}><boxGeometry args={[0.07, 1.2, 0.1]} /><meshStandardMaterial color={CREAM} roughness={0.7} /></mesh>
                ))}
                <mesh position={[cx + HOST_WIN_DX, 0.28, 0.12]}><boxGeometry args={[1.7, 0.06, 0.2]} /><meshStandardMaterial color={CREAM} roughness={0.7} /></mesh>
              </group>
            ) : (
              <mesh position={[cx, h / 2, -HOUSE_D / 2]} castShadow={cast} receiveShadow><boxGeometry args={[HOUSE_W, h, HOUSE_D]} /><meshStandardMaterial color={brick} roughness={0.85} /></mesh>
            )}
            {/* string course and cornice */}
            <mesh position={[cx, FLOOR1 + 0.03, 0.03]}><boxGeometry args={[HOUSE_W, 0.07, 0.07]} /><meshStandardMaterial color={CREAM} roughness={0.8} /></mesh>
            <mesh position={[cx, h - 0.05, 0.06]} castShadow={cast}><boxGeometry args={[HOUSE_W + 0.02, 0.12, 0.18]} /><meshStandardMaterial color={CREAM} roughness={0.8} /></mesh>
            {/* slate roof */}
            <mesh geometry={roofGeo} position={[cx, h, -1.25]} rotation-y={-Math.PI / 2} castShadow={cast}><meshStandardMaterial color={i % 2 ? '#46546A' : '#3C4859'} roughness={0.7} flatShading /></mesh>
            <mesh position={[cx + 1.3, h + 0.85, -1.7]} castShadow={cast}><boxGeometry args={[0.32, 0.9, 0.32]} /><meshStandardMaterial color="#9C4A38" roughness={0.9} /></mesh>
            <mesh position={[cx + 1.3, h + 1.38, -1.7]}><cylinderGeometry args={[0.08, 0.1, 0.22, 8]} /><meshStandardMaterial color="#C56B45" roughness={0.9} /></mesh>
            {/* door */}
            <mesh position={[cx + DOOR_DX, 0.6, 0.03]}><boxGeometry args={[0.76, 1.22, 0.05]} /><meshStandardMaterial color={CREAM} roughness={0.8} /></mesh>
            <mesh position={[cx + DOOR_DX, 0.58, 0.07]}><boxGeometry args={[0.6, 1.15, 0.05]} /><meshStandardMaterial color={DOORS[i % DOORS.length]} roughness={0.5} /></mesh>
            <mesh position={[cx + DOOR_DX + 0.2, 0.6, 0.11]}><sphereGeometry args={[0.032, 8, 8]} /><meshStandardMaterial color="#D8A84E" metalness={0.8} roughness={0.3} /></mesh>
            <mesh position={[cx + DOOR_DX, 0.04, 0.22]} receiveShadow><boxGeometry args={[0.85, 0.08, 0.34]} /><meshStandardMaterial color="#B9B3AA" roughness={0.9} /></mesh>
          </group>
        )
      })}
      <mesh position={[houseX(0) - 1.3, HEIGHTS[0] + 0.85, -1.7]}><boxGeometry args={[0.32, 0.9, 0.32]} /><meshStandardMaterial color="#9C4A38" roughness={0.9} /></mesh>

      {/* parked cars */}
      {[[-4.8, '#E0657A'], [8.2, '#2C8FD6'], [-0.4, '#F2B134']].map(([x, c], k) => (
        <group key={k} position={[x as number, 0.04, 3.0]} rotation-y={k === 1 ? Math.PI : 0}>
          <mesh position={[0, 0.2, 0]} castShadow={cast}><boxGeometry args={[1.25, 0.3, 0.58]} /><meshStandardMaterial color={c as string} roughness={0.4} /></mesh>
          <mesh position={[-0.05, 0.42, 0]} castShadow={cast}><boxGeometry args={[0.65, 0.2, 0.5]} /><meshStandardMaterial color="#DCE6F2" roughness={0.3} /></mesh>
          {[[-0.4, 0.3], [0.4, 0.3], [-0.4, -0.3], [0.4, -0.3]].map(([wx, wz], j) => (
            <mesh key={j} position={[wx, 0.08, wz]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.1, 0.1, 0.06, 10]} /><meshStandardMaterial color="#1b1d28" roughness={0.8} /></mesh>
          ))}
        </group>
      ))}

      {/* trees */}
      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0.02, t.z]} scale={t.s}>
          <mesh position={[0, 0.3, 0]} castShadow={cast}><cylinderGeometry args={[0.07, 0.1, 0.6, 6]} /><meshStandardMaterial color="#5A3E2B" roughness={1} /></mesh>
          <mesh position={[0, 0.95, 0]} castShadow={cast}><icosahedronGeometry args={[0.55, 0]} /><meshStandardMaterial color={t.c} roughness={0.9} flatShading /></mesh>
          <mesh position={[0.05, 1.45, 0]} castShadow={cast}><icosahedronGeometry args={[0.36, 0]} /><meshStandardMaterial color={t.c} roughness={0.9} flatShading /></mesh>
        </group>
      ))}
    </group>
  )
}

