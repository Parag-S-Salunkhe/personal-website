'use client'
import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, ShaderMaterial, Vector2 } from 'three'
import { billboardVert, steamFrag } from './shaders'
import type { Sim } from './story'

/** A few billboarded planes with a rising, curling fbm shader. Parent group sits at the dish centre. */
export default function Steam({ sim, index, count, baseY }: { sim: Sim; index: number; count: number; baseY: number }) {
  const mats = useMemo(
    () => Array.from({ length: count }, (_, k) => new ShaderMaterial({
      vertexShader: billboardVert, fragmentShader: steamFrag, transparent: true, depthWrite: false,
      uniforms: { uTime: { value: 0 }, uGrow: { value: 0 }, uSeed: { value: (k * 0.37 + index * 0.21) % 1 }, uInt: { value: 1 }, uColor: { value: new Color('#F2D3A0') }, uSize: { value: new Vector2(1.6, 3.0) } },
    })),
    [count, index],
  )
  useEffect(() => () => mats.forEach((m) => m.dispose()), [mats])
  useFrame(() => {
    const pl = sim.plates[index]
    mats.forEach((m, k) => {
      m.uniforms.uTime.value = sim.t + k * 0.9
      m.uniforms.uGrow.value = pl.grow
      m.uniforms.uInt.value = 0.15 + 0.95 * pl.heat
    })
  })
  return (
    <group position={[0, baseY, 0]}>
      {mats.map((m, k) => {
        const a = (k / count) * Math.PI * 2 + index
        return (
          <mesh key={k} position={[Math.cos(a) * 0.38, 0, Math.sin(a) * 0.3]} renderOrder={10 + k} frustumCulled={false}>
            <planeGeometry args={[1, 1]} />
            <primitive object={m} attach="material" />
          </mesh>
        )
      })}
    </group>
  )
}
