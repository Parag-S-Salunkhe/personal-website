'use client'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, Group, Mesh, PointLight, ShaderMaterial, Vector2 } from 'three'
import { billboardVert, flameFrag, haloFrag, haloVert } from './shaders'
import type { Sim } from './story'

export const CANDLE_H = 1.5
/** Candle height and flame tip height for a burn level 1 -> 0 (used by the haze to find the flame). */
export const candleTop = (level: number) => CANDLE_H * (0.36 + 0.64 * level)

export default function Candle({ sim, position }: { sim: Sim; position: [number, number, number] }) {
  const wax = useRef<Mesh>(null)
  const top = useRef<Group>(null)
  const light = useRef<PointLight>(null)
  const flame = useMemo(() => new ShaderMaterial({ vertexShader: billboardVert, fragmentShader: flameFrag, transparent: true, depthWrite: false, blending: AdditiveBlending, uniforms: { uTime: { value: 0 }, uFlick: { value: 1 }, uSize: { value: new Vector2(0.5, 0.85) } } }), [])
  const halo = useMemo(() => new ShaderMaterial({ vertexShader: haloVert, fragmentShader: haloFrag, transparent: true, depthWrite: false, blending: AdditiveBlending, uniforms: { uColor: { value: new Color('#F6B94F') }, uInt: { value: 0.5 }, uSize: { value: new Vector2(3, 3) } } }), [])
  useEffect(() => () => { flame.dispose(); halo.dispose() }, [flame, halo])

  useFrame(() => {
    const t = sim.t
    const lv = sim.level
    const h = candleTop(lv)
    // layered flicker: slow breathing + quick shimmer + occasional gutter
    const f = 0.86 + 0.07 * Math.sin(t * 9.3) + 0.05 * Math.sin(t * 23.1 + 1.3) + 0.04 * Math.sin(t * 3.1) - 0.08 * Math.max(0, Math.sin(t * 1.7 + 2) - 0.85) * 5
    sim.flick = f
    if (wax.current) { wax.current.scale.y = h / CANDLE_H; wax.current.position.y = h / 2 }
    if (top.current) top.current.position.y = h + 0.04
    const sz = 0.35 + 0.65 * lv
    flame.uniforms.uTime.value = t
    flame.uniforms.uFlick.value = f * (0.7 + 0.3 * lv)
    flame.uniforms.uSize.value.set(0.52 * sz, 0.95 * sz)
    halo.uniforms.uInt.value = 0.5 * f * lv
    halo.uniforms.uSize.value.set(3.2 * (0.5 + 0.5 * lv), 3.2 * (0.5 + 0.5 * lv))
    if (light.current) light.current.intensity = 11 * f * (0.25 + 0.75 * lv)
  })

  return (
    <group position={position}>
      {/* brass holder */}
      <mesh position={[0, 0.06, 0]}><cylinderGeometry args={[0.55, 0.62, 0.12, 40]} /><meshStandardMaterial color="#D8A84E" metalness={0.85} roughness={0.32} /></mesh>
      <mesh position={[0, 0.16, 0]}><cylinderGeometry args={[0.3, 0.4, 0.1, 32]} /><meshStandardMaterial color="#D8A84E" metalness={0.85} roughness={0.3} /></mesh>
      <mesh ref={wax} position={[0, CANDLE_H / 2, 0]}><cylinderGeometry args={[0.22, 0.24, CANDLE_H, 36]} /><meshStandardMaterial color="#FFF8EA" roughness={0.55} emissive="#F6B94F" emissiveIntensity={0.28} /></mesh>
      <group ref={top} position={[0, CANDLE_H, 0]}>
        <mesh position={[0, 0.03, 0]}><cylinderGeometry args={[0.012, 0.012, 0.1, 6]} /><meshBasicMaterial color="#1a1410" /></mesh>
        <mesh position={[0, 0.12, 0]} renderOrder={20} frustumCulled={false}><planeGeometry args={[1, 1]} /><primitive object={flame} attach="material" /></mesh>
        <mesh position={[0, 0.4, 0]} renderOrder={19} frustumCulled={false}><planeGeometry args={[1, 1]} /><primitive object={halo} attach="material" /></mesh>
        <pointLight ref={light} position={[0, 0.45, 0]} color="#FFB347" distance={12} decay={1.6} />
      </group>
    </group>
  )
}
