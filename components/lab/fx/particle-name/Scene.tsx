'use client'
import { useEffect, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import Backdrop from './Backdrop'
import Bucket from './Bucket'
import Particles from './Particles'
import { CAM, computeLayout } from './layout'
import type { Shared } from './types'

interface Props { family: string; shared: Shared; light: boolean; rm: boolean; paused: boolean }

function World({ family, shared, light, rm }: Omit<Props, 'paused'>) {
  const size = useThree((s) => s.size)
  const invalidate = useThree((s) => s.invalidate)
  const aspect = Math.round((size.width / Math.max(1, size.height)) * 50) / 50
  const n = light ? 900 : 2600
  const layout = useMemo(() => computeLayout(aspect, n, family), [aspect, n, family])
  useEffect(() => { shared.onReady(); invalidate() }, [layout, shared, invalidate])
  return (
    <>
      <Backdrop aspect={aspect} />
      <ambientLight color="#ffd9b0" intensity={0.55} />
      <hemisphereLight args={['#ffe6c0', '#6B1A2B', 0.7]} />
      <directionalLight color="#FFE8BE" intensity={2.6} position={[-4, 7, 9]} />
      <directionalLight color="#FF9F43" intensity={2.2} position={[5, 2, -6]} />
      <pointLight color="#FFF3D6" intensity={30} distance={22} position={[0, 1, 8]} />
      <Particles layout={layout} shared={shared} rm={rm} />
      {!rm && <Bucket layout={layout} shared={shared} />}
      <EffectComposer multisampling={light ? 0 : 4} enableNormalPass={false}>
        <Bloom mipmapBlur intensity={light ? 0.55 : 0.85} luminanceThreshold={0.72} luminanceSmoothing={0.25} />
        <Vignette offset={0.25} darkness={0.75} />
      </EffectComposer>
    </>
  )
}

export default function Scene({ family, shared, light, rm, paused }: Props) {
  return (
    <Canvas
      dpr={light ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 0, CAM.z], fov: CAM.fov, near: 0.1, far: 60 }}
      frameloop={rm ? 'demand' : paused ? 'never' : 'always'}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden
    >
      <World family={family} shared={shared} light={light} rm={rm} />
    </Canvas>
  )
}
