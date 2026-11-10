'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

const BRASS = '#D8A84E'

export function Projector({ pos }: { pos: [number, number, number] }) {
  const reelA = useRef<THREE.Group>(null)
  const reelB = useRef<THREE.Group>(null)
  const frozen = useRef(false)
  useFrame((s, dt) => {
    if (frozen.current) return
    if (reelA.current) reelA.current.rotation.x -= dt * 2.2
    if (reelB.current) reelB.current.rotation.x -= dt * 2.2
  })
  const reel = (z: number, r: React.Ref<THREE.Group>) => (
    <group position={[0, 1.0, z]} ref={r}>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.46, 0.035, 8, 40]} />
        <meshStandardMaterial color={BRASS} metalness={0.8} roughness={0.35} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} rotation={[(i * Math.PI) / 3, 0, 0]}>
          <boxGeometry args={[0.05, 0.84, 0.04]} />
          <meshStandardMaterial color="#4a3f36" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, 0.14, 16]} />
        <meshStandardMaterial color={BRASS} metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  )
  return (
    <group position={pos}>
      {/* stand: brass-legged table */}
      <mesh position={[0, -0.42, 0]}>
        <boxGeometry args={[1.9, 0.09, 2.3]} />
        <meshStandardMaterial color="#24100c" roughness={0.6} metalness={0.1} />
      </mesh>
      {[[-0.8, -1], [0.8, -1], [-0.8, 1], [0.8, 1]].map(([x, z], i) => (
        <mesh key={i} position={[x, -1.18, z]}>
          <cylinderGeometry args={[0.05, 0.035, 1.44, 10]} />
          <meshStandardMaterial color={BRASS} metalness={0.85} roughness={0.35} />
        </mesh>
      ))}
      {/* body */}
      <RoundedBox args={[1.2, 0.8, 1.6]} radius={0.08} smoothness={3} position={[0, 0, 0.2]}>
        <meshStandardMaterial color="#2c2622" metalness={0.55} roughness={0.42} />
      </RoundedBox>
      <mesh position={[0, 0.42, 0.2]}>
        <boxGeometry args={[1.22, 0.05, 1.4]} />
        <meshStandardMaterial color="#3a2f28" metalness={0.6} roughness={0.45} />
      </mesh>
      <mesh position={[0.61, 0, 0.2]}>
        <boxGeometry args={[0.02, 0.5, 1.2]} />
        <meshStandardMaterial color={BRASS} metalness={0.85} roughness={0.3} />
      </mesh>
      {/* lens barrel */}
      <mesh position={[0, 0.0, -0.95]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.34, 0.5, 28]} />
        <meshStandardMaterial color="#201b18" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, -1.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.24, 0.3, 0.3, 28]} />
        <meshStandardMaterial color={BRASS} metalness={0.9} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0, -1.46]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.21, 28]} />
        <meshBasicMaterial color="#FFF3D6" toneMapped={false} />
      </mesh>
      {/* uprights + reels */}
      {[-0.1, 0.9].map((z, i) => (
        <mesh key={i} position={[0, 0.7, z + 0.2]}>
          <boxGeometry args={[0.06, 0.5, 0.06]} />
          <meshStandardMaterial color="#4a3f36" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
      {reel(0.0 + 0.1 - 0.1, reelA)}
      {reel(1.0, reelB)}
    </group>
  )
}

function Chair({ x, z, s = 1, tint }: { x: number; z: number; s?: number; tint: string }) {
  const m = <meshStandardMaterial color={tint} roughness={0.9} metalness={0.02} />
  return (
    <group position={[x, 0, z]} scale={s} rotation={[0, x * 0.012, 0]}>
      <RoundedBox args={[1.1, 0.9, 0.3]} radius={0.14} smoothness={3} position={[0, 0.95, 0.35]}>{m}</RoundedBox>
      <RoundedBox args={[1.1, 0.4, 0.9]} radius={0.1} smoothness={3} position={[0, 0.4, 0]}>{m}</RoundedBox>
      <RoundedBox args={[0.2, 0.6, 0.95]} radius={0.08} smoothness={3} position={[-0.6, 0.6, 0]}>{m}</RoundedBox>
      <RoundedBox args={[0.2, 0.6, 0.95]} radius={0.08} smoothness={3} position={[0.6, 0.6, 0]}>{m}</RoundedBox>
    </group>
  )
}

export function Seats() {
  const row1 = [-4.9, -3.4, -1.9, 1.9, 3.4, 4.9]
  const row2 = [-4.1, -2.6, 2.6, 4.1]
  return (
    <group>
      {row1.map((x) => <Chair key={x} x={x} z={0.4} tint="#1e5453" />)}
      {row2.map((x) => <Chair key={x} x={x} z={2.7} s={1.05} tint="#183e3e" />)}
    </group>
  )
}

function useCurtainGeo(w: number, h: number) {
  return useMemo(() => {
    const g = new THREE.PlaneGeometry(w, h, 48, 1)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 7.5) * 0.16)
    g.computeVertexNormals()
    return g
  }, [w, h])
}

export function Room({ light }: { light: boolean }) {
  const cur = useCurtainGeo(3.0, 5.2)
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4a1426', roughness: 0.9 }), [])
  return (
    <group>
      {/* floor, ceiling, walls */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1]}>
        <planeGeometry args={[16, 26]} />
        <meshStandardMaterial color="#5a1a2a" roughness={0.95} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5.2, -1]}>
        <planeGeometry args={[16, 26]} />
        <meshStandardMaterial color="#2b0b14" roughness={1} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-7, 2.6, -1]} material={wallMat}><planeGeometry args={[26, 5.2]} /></mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[7, 2.6, -1]} material={wallMat}><planeGeometry args={[26, 5.2]} /></mesh>
      <mesh position={[0, 2.6, -9.6]} material={wallMat}><planeGeometry args={[16, 5.2]} /></mesh>
      <mesh position={[0, 2.6, 11]} rotation={[0, Math.PI, 0]} material={wallMat}><planeGeometry args={[16, 5.2]} /></mesh>
      {/* brass dado rails */}
      {[-6.92, 6.92].map((x) => (
        <mesh key={x} position={[x, 1.3, -1]}>
          <boxGeometry args={[0.06, 0.07, 26]} />
          <meshStandardMaterial color={BRASS} metalness={0.85} roughness={0.3} emissive="#7a5a20" emissiveIntensity={0.35} />
        </mesh>
      ))}
      {/* screen frame + stage */}
      <mesh position={[0, 1.95, -9.52]}>
        <boxGeometry args={[7.6, 4.3, 0.1]} />
        <meshStandardMaterial color={BRASS} metalness={0.9} roughness={0.3} emissive="#7a5a20" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.12, -8.4]}>
        <boxGeometry args={[11, 0.24, 2.4]} />
        <meshStandardMaterial color="#3a1c14" roughness={0.6} />
      </mesh>
      {/* velvet curtains */}
      {[-5.5, 5.5].map((x) => (
        <mesh key={x} geometry={cur} position={[x, 2.6, -9.2]}>
          <meshStandardMaterial color="#7a1f33" roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh position={[0, 5.0, -9.1]}>
        <boxGeometry args={[14, 0.5, 0.5]} />
        <meshStandardMaterial color="#6B1A2B" roughness={0.85} />
      </mesh>
      {/* sconces */}
      {(light ? [[-6.7, 3.0, -2]] : [[-6.7, 3.0, -2], [6.7, 3.0, -2], [-6.7, 3.0, 5], [6.7, 3.0, 5]]).map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh><sphereGeometry args={[0.12, 12, 12]} /><meshBasicMaterial color="#FFB868" toneMapped={false} /></mesh>
          <pointLight color="#FF9F43" intensity={light ? 18 : 12} distance={11} decay={2} />
        </group>
      ))}
    </group>
  )
}
