'use client'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { CanvasTexture, SRGBColorSpace, type MeshBasicMaterial } from 'three'
import { smooth, type Story } from './timeline'

const LETTERS = ['L', 'A', 'T', 'E', '*', 'S', 'H', 'O', 'W']

/** Vertical blade sign "LATE SHOW", letters stacked, brass frame, bulbs added by Bulbs. */
export default function Blade({ story, family }: { story: MutableRefObject<Story>; family: string }) {
  const mat = useRef<MeshBasicMaterial>(null)
  const invalidate = useThree((s) => s.invalidate)
  const { canvas, tex } = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 200; c.height = 1200
    const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; t.anisotropy = 4
    return { canvas: c, tex: t }
  }, [])
  useEffect(() => {
    let live = true
    const draw = () => {
      const ctx = canvas.getContext('2d'); if (!ctx) return
      ctx.fillStyle = '#1c0810'; ctx.fillRect(0, 0, 200, 1200)
      ctx.strokeStyle = '#D8A84E'; ctx.lineWidth = 6; ctx.strokeRect(12, 12, 176, 1176)
      ctx.lineWidth = 2; ctx.strokeRect(24, 24, 152, 1152)
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      LETTERS.forEach((l, i) => {
        const y = 80 + i * 130
        if (l === '*') { ctx.fillStyle = '#FF9F43'; ctx.beginPath(); ctx.moveTo(100, y - 26); ctx.lineTo(120, y); ctx.lineTo(100, y + 26); ctx.lineTo(80, y); ctx.fill(); return }
        ctx.font = `900 124px ${family}, Impact, sans-serif`; ctx.fillStyle = '#FFF3D6'; ctx.fillText(l, 100, y + 6)
      })
      tex.needsUpdate = true; invalidate()
    }
    document.fonts?.load(`900 124px ${family}`).finally(() => live && draw())
    draw()
    return () => { live = false; tex.dispose() }
  }, [canvas, tex, family, invalidate])
  useFrame(() => { if (mat.current) mat.current.color.setScalar(0.12 + 1.6 * smooth(0.14, 0.27, story.current.p)) })
  return (
    <group position={[-3.75, 7.3, 1.64]}>
      <mesh position={[0, 0, -0.14]}><boxGeometry args={[1.2, 6.2, 0.22]} /><meshStandardMaterial color="#1c0810" roughness={0.5} metalness={0.3} /></mesh>
      <mesh><planeGeometry args={[1, 6]} /><meshBasicMaterial ref={mat} map={tex} toneMapped={false} /></mesh>
    </group>
  )
}
