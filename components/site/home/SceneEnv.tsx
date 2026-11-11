'use client'
import { useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'

/** Sets the scene background and fog for one beat and clears them on unmount (beats share one Canvas). */
export function SceneEnv({ bg, fog }: { bg: string; fog?: [string, number, number] }) {
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    scene.background = new THREE.Color(bg)
    scene.fog = fog ? new THREE.Fog(fog[0], fog[1], fog[2]) : null
    return () => { scene.background = null; scene.fog = null }
  }, [scene, bg, fog])
  return null
}
