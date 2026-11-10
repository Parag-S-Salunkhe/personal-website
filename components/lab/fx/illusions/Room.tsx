'use client'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { AdditiveBlending, DoubleSide, SRGBColorSpace, type Mesh, type Texture } from 'three'
import { COL, SUBJECT_FLAMES, TABLE_FLAMES, farRoomTexture, farTableTexture, flameTexture, foregroundTexture, menuTexture, subjectTexture, tableTexture, wallDecorTexture, wallpaperTexture, type Fonts } from './paint'

export const OFF_Y = -200
export type Layout = { portrait: boolean; k: number; lookY: number; menu: { x: number; y: number; z: number; w: number; h: number }; poster: { x: number; y: number; w: number; h: number } }
export const layoutFor = (portrait: boolean): Layout => portrait
  ? { portrait, k: 4.3, lookY: 1.9, menu: { x: 0, y: 4.6, z: -5, w: 4.2, h: 4 }, poster: { x: -1.3, y: 8.4, w: 3.2, h: 4.7 } }
  : { portrait, k: 2.4, lookY: 0, menu: { x: 3.1, y: 0.7, z: -6, w: 3.4, h: 4.6 }, poster: { x: -7.4, y: 3.9, w: 3.4, h: 5 } }

const halfH = (z: number, k: number) => k * Math.max(1 - z / 16, 1 - z / 4.5)

function Layer({ z, x = 0, y = 0, w, h, map, order, repeat }: { z: number; x?: number; y?: number; w: number; h: number; map: Texture; order: number; repeat?: [number, number] }) {
  useEffect(() => { if (repeat) { map.repeat.set(repeat[0], repeat[1]); map.needsUpdate = true } }, [map, repeat])
  return (
    <mesh position={[x, OFF_Y + y, z]} scale={[w, h, 1]} renderOrder={order}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={map} transparent={order > 0} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

function Poster({ src, x, y, w, h }: { src: string; x: number; y: number; w: number; h: number }) {
  const tex = useTexture(src)
  tex.colorSpace = SRGBColorSpace
  const gl = useThree((st) => st.gl)
  useEffect(() => { gl.initTexture(tex) }, [tex, gl])
  return (
    <group position={[x, OFF_Y + y, -20.9]}>
      <mesh position={[0.08, -0.08, -0.01]} scale={[w + 0.5, h + 0.5, 1]} renderOrder={2}><planeGeometry /><meshBasicMaterial color="#050f0a" transparent opacity={0.5} depthWrite={false} /></mesh>
      <mesh scale={[w + 0.36, h + 0.36, 1]} renderOrder={3}><planeGeometry /><meshBasicMaterial color={COL.brass} transparent depthWrite={false} toneMapped={false} /></mesh>
      <mesh scale={[w, h, 1]} renderOrder={4}><planeGeometry /><meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} /></mesh>
    </group>
  )
}

function Flames({ list, flame }: { list: [number, number, number, number][]; flame: Texture }) {
  const refs = useRef<(Mesh | null)[]>([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    refs.current.forEach((m, i) => {
      if (!m) return
      const f = 1 + Math.sin(t * 11 + i * 2.3) * 0.1 + Math.sin(t * 23 + i * 5.1) * 0.06
      m.scale.set(0.34 * (1 / f) * list[i][3], 0.51 * f * list[i][3], 1)
      m.rotation.z = Math.sin(t * 7 + i) * 0.06
    })
  })
  return (
    <>
      {list.map(([x, y, z], i) => (
        <mesh key={i} ref={(m) => { refs.current[i] = m }} position={[x, OFF_Y + y, z]} renderOrder={20}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={flame} transparent blending={AdditiveBlending} depthWrite={false} toneMapped={false} side={DoubleSide} />
        </mesh>
      ))}
    </>
  )
}

export default function Room({ layout, aspect, fonts, dishes, posterSrc }: { layout: Layout; aspect: number; fonts: Fonts; dishes: { name: string; category: string }[]; posterSrc: string | null }) {
  const { k, menu, poster } = layout
  const tex = useMemo(() => ({
    wall: wallpaperTexture(), decor: wallDecorTexture(), far: farRoomTexture(), farTable: farTableTexture(),
    table: tableTexture(), subject: subjectTexture(), fg: foregroundTexture(), flame: flameTexture(),
  }), [])
  const menuTex = useMemo(() => menuTexture(menu.w, menu.h, fonts, dishes), [menu.w, menu.h, fonts, dishes])
  const gl = useThree((st) => st.gl)
  useEffect(() => { Object.values(tex).forEach((t) => gl.initTexture(t)) }, [tex, gl])
  useEffect(() => { gl.initTexture(menuTex) }, [menuTex, gl])
  useEffect(() => () => { Object.values(tex).forEach((t) => t.dispose()) }, [tex])
  useEffect(() => () => menuTex.dispose(), [menuTex])

  const wallH = 2 * halfH(-26, k) * 1.12 + 4
  const wallW = wallH * Math.max(aspect, 0.4) * 1.1 + 6
  const flames: [number, number, number, number][] = [
    ...SUBJECT_FLAMES.map(([x, y]) => [x, y, 0.12, 1] as [number, number, number, number]),
    ...TABLE_FLAMES.map((x) => [x, -4.6 + 4.15, -2.1, 1.1] as [number, number, number, number]),
  ]
  return (
    <group>
      <Layer z={-26} w={wallW} h={wallH} map={tex.wall} order={0} repeat={[wallW / 1.6, wallH / 1.6]} />
      <Layer z={-21} w={44} h={18} y={0.5} map={tex.decor} order={1} />
      {posterSrc && <Suspense fallback={null}><Poster src={posterSrc} {...poster} /></Suspense>}
      <Layer z={-15} w={50} h={16} y={0.5} map={tex.far} order={5} />
      <Layer z={-10} w={40} h={9} y={-2} map={tex.farTable} order={6} />
      <Layer z={menu.z} x={menu.x} w={menu.w} h={menu.h} y={menu.y} map={menuTex} order={7} />
      <Layer z={-2.2} w={40} h={9} y={-4.6} map={tex.table} order={8} />
      <Layer z={0} w={4.4} h={3.6} y={-0.05} map={tex.subject} order={9} />
      <Flames list={flames} flame={tex.flame} />
      <Layer z={2.2} w={12} h={7} y={0} map={tex.fg} order={30} />
    </group>
  )
}
