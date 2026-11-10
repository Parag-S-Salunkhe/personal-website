'use client'
import { useMemo } from 'react'
import * as THREE from 'three'
import type { Kind } from './layout'

export const COL = { cloth: '#17352A', deep: '#10281F', linen: '#F1EEE6', candle: '#F6B94F', claret: '#7C2236', sage: '#A9C3AE', wax: '#FFF8EA' }
export const RIM = ['#7C2236', '#A9C3AE', '#F6B94F', '#3E6B5A']
const FOOD = ['#C8803A', '#6E8F5A', '#8E2B3E', '#E2BE7B']

/** Rest height of each kind (body centre above the cloth) and collider half extents. */
export const REST: Record<Kind, number> = { plate: 0.07, bowl: 0.2, glass: 0.35, fork: 0.03, knife: 0.03, spoon: 0.03 }

const lathe = (pts: [number, number][], seg = 40) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg)

export const ceramic = new THREE.MeshPhysicalMaterial({ color: COL.linen, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12, side: THREE.DoubleSide })
export const silver = new THREE.MeshStandardMaterial({ color: '#d7dbde', metalness: 1, roughness: 0.2, envMapIntensity: 1.4 })
const glassMat = new THREE.MeshPhysicalMaterial({ color: '#dfeee6', roughness: 0.03, metalness: 0, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 2 })
const wineMat = new THREE.MeshStandardMaterial({ color: COL.claret, roughness: 0.2 })

export function Plate({ dish }: { dish?: number }) {
  const geo = useMemo(() => lathe([[0, 0.02], [0.45, 0.02], [0.6, 0.06], [0.82, 0.13], [0.87, 0.14], [0.86, 0.145], [0.8, 0.14], [0.6, 0.075], [0.45, 0.045], [0, 0.045]].map(([r, y]) => [r, y - 0.07] as [number, number]), 48), [])
  const rim = dish === undefined ? COL.sage : RIM[dish % RIM.length]
  const food = dish === undefined ? null : FOOD[dish % FOOD.length]
  return (
    <group>
      <mesh geometry={geo} material={ceramic} castShadow receiveShadow />
      <mesh position={[0, 0.058, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.75, 48]} />
        <meshStandardMaterial color={rim} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
      {food && (
        <group position={[0, -0.01, 0]}>
          <mesh position={[0, 0.07, 0]} scale={[1, 0.55, 1]} castShadow><sphereGeometry args={[0.3, 20, 14]} /><meshStandardMaterial color={food} roughness={0.7} /></mesh>
          <mesh position={[0.28, 0.05, 0.12]} scale={[1, 0.6, 1]} castShadow><sphereGeometry args={[0.17, 16, 12]} /><meshStandardMaterial color={RIM[(dish! + 1) % 4]} roughness={0.6} /></mesh>
          <mesh position={[-0.25, 0.045, -0.15]} scale={[1, 0.5, 1]} castShadow><sphereGeometry args={[0.15, 16, 12]} /><meshStandardMaterial color={COL.wax} roughness={0.6} /></mesh>
        </group>
      )}
    </group>
  )
}

export function Bowl() {
  const geo = useMemo(() => lathe([[0, 0], [0.2, 0.0], [0.38, 0.07], [0.5, 0.22], [0.56, 0.4], [0.545, 0.405], [0.49, 0.25], [0.37, 0.12], [0.2, 0.075], [0, 0.07]].map(([r, y]) => [r, y - 0.2] as [number, number]), 40), [])
  return (
    <group>
      <mesh geometry={geo} material={ceramic} castShadow receiveShadow />
      <mesh position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.36, 32]} /><meshStandardMaterial color={COL.sage} roughness={0.5} /></mesh>
    </group>
  )
}

export function Glass({ wine }: { wine?: boolean }) {
  const geo = useMemo(() => lathe([[0, 0.02], [0.17, 0.02], [0.22, 0.7], [0.205, 0.7], [0.155, 0.08], [0, 0.08]].map(([r, y]) => [r, y - 0.35] as [number, number]), 28), [])
  return (
    <group>
      <mesh geometry={geo} material={glassMat} castShadow renderOrder={2} />
      {wine && <mesh position={[0, -0.12, 0]} material={wineMat}><cylinderGeometry args={[0.185, 0.15, 0.38, 24]} /></mesh>}
    </group>
  )
}

export function Cutlery({ kind }: { kind: 'fork' | 'knife' | 'spoon' }) {
  return (
    <group>
      <mesh material={silver} castShadow><boxGeometry args={[0.1, 0.05, 0.6]} /></mesh>
      {kind === 'knife' && <mesh material={silver} position={[0.005, 0, -0.52]} castShadow><boxGeometry args={[0.13, 0.03, 0.5]} /></mesh>}
      {kind === 'spoon' && <mesh material={silver} position={[0, 0, -0.62]} scale={[1, 0.22, 1.5]} castShadow><sphereGeometry args={[0.15, 18, 12]} /></mesh>}
      {kind === 'fork' && (
        <group position={[0, 0, -0.5]}>
          <mesh material={silver} castShadow><boxGeometry args={[0.24, 0.04, 0.12]} /></mesh>
          {[-0.09, 0, 0.09].map((x) => <mesh key={x} material={silver} position={[x, 0, -0.17]} castShadow><boxGeometry args={[0.04, 0.035, 0.26]} /></mesh>)}
        </group>
      )}
    </group>
  )
}
