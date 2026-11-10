'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useInView, useReducedMotion, useTier } from '@/components/lab/kit/hooks'
import { buildAssets, type Assets, type BookData } from './art'
import type { BookState } from './book'
import Scene from './Scene'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const CAPS = [
  { t: 'Supper is at eight.', b: 'Pull the paper tab, then scroll to turn the page.' },
  { t: 'The house', b: 'Lights on from six. The door is open.' },
  { t: 'The table', b: 'Eight chairs, three candles, one pulled out for you.' },
  { t: 'Movie night', b: 'After supper the chairs turn to the screen.' },
  { t: 'The kitchen', b: 'Dishes from the stove, named on paper tabs.' },
]

export default function PopupBook({ data }: { data: BookData }) {
  const reduced = useReducedMotion()
  const light = useTier() === 'light'
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const root = useRef<HTMLDivElement>(null)
  const inView = useInView(root, '100px')
  const shared = useRef({ p: 0 })
  const [assets, setAssets] = useState<Assets | null>(null)
  const [ready, setReady] = useState(false)
  const [settled, setSettled] = useState(false)
  const caps = useRef<(HTMLElement | null)[]>([])
  const wrap = useRef<HTMLElement | null>(null)

  useEffect(() => { wrap.current = root.current?.closest('[data-story]') as HTMLElement | null }, [mounted])

  // paint every page and pop-up on canvases once the fonts and the poster are in
  useEffect(() => {
    if (!mounted) return
    let dead = false
    let built: Assets | null = null
    ;(async () => {
      const cs = getComputedStyle(root.current!)
      const fam = { gilda: cs.getPropertyValue('--font-gilda').trim() || 'serif', hanken: cs.getPropertyValue('--font-hanken').trim() || 'sans-serif', pinyon: cs.getPropertyValue('--font-pinyon').trim() || 'cursive' }
      const fonts = Promise.all([`48px ${fam.gilda}`, `40px ${fam.hanken}`, `700 40px ${fam.hanken}`, `40px ${fam.pinyon}`].map((f) => document.fonts.load(f).catch(() => [])))
      await Promise.race([fonts, new Promise((r) => setTimeout(r, 3500))])
      const poster = await new Promise<HTMLImageElement | null>((res) => {
        if (!data.poster) return res(null)
        const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = data.poster
        setTimeout(() => res(null), 6000)
      })
      if (dead) return
      built = buildAssets(data, fam, poster, light ? 150 : 230)
      setAssets(built)
    })()
    return () => { dead = true }
  }, [mounted, data, light])

  useEffect(() => { if (!reduced || !ready) return; const id = setTimeout(() => setSettled(true), 2500); return () => clearTimeout(id) }, [reduced, ready])

  useGSAP(() => {
    if (reduced) return
    const w = root.current?.closest('[data-story]') as HTMLElement | null
    if (!w) return
    const trig = ScrollTrigger.create({ trigger: w, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: (self) => { shared.current.p = self.progress } })
    shared.current.p = trig.progress
    return () => trig.kill()
  }, { scope: root, dependencies: [reduced, mounted] })

  const onFrame = useCallback((s: BookState) => {
    const vis = reduced ? [0, 0, 1, 0, 0] : [1 - Math.min(1, s.turn[0] * 2.5), s.r[0], s.r[1], s.r[2], s.r[3]]
    vis.forEach((a, i) => {
      const el = caps.current[i]
      if (!el) return
      el.style.opacity = String(Math.min(1, a * 1.4))
      el.style.visibility = a < 0.02 ? 'hidden' : 'visible'
      el.style.transform = `translate3d(0, ${((1 - a) * 18).toFixed(1)}px, 0)`
    })
    if (!reduced) wrap.current?.style.setProperty('--hero', String(1 - Math.min(1, s.turn[0] * 2)))
  }, [reduced])

  const frameloop = reduced ? (settled ? 'demand' : 'always') : inView ? 'always' : 'never'
  return (
    <div ref={root} className="absolute inset-0 z-[1]">
      <div className="absolute inset-0 transition-opacity duration-700" style={{ opacity: ready ? 1 : 0 }}>
        {mounted && assets && (
          <Canvas
            frameloop={frameloop}
            shadows
            dpr={light ? [1, 1.5] : [1, 2]}
            camera={{ fov: 34, near: 0.1, far: 60, position: [0, 6, 4] }}
            gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
            style={{ touchAction: 'pan-y' }}
            aria-hidden
          >
            <Scene assets={assets} shared={shared} still={reduced} light={light} onFrame={onFrame} onReady={() => setReady(true)} />
          </Canvas>
        )}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0) 55%, rgba(4,10,7,.65) 100%)' }} />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 via-black/35 to-transparent px-6 pb-7 pt-24 sm:px-12 sm:pb-10">
        <div className="relative h-[5.6rem] max-w-md sm:h-24">
          {CAPS.map((c, i) => (
            <div key={c.t} ref={(el) => { caps.current[i] = el }} className="absolute inset-x-0 bottom-0" style={{ opacity: 0, visibility: 'hidden' }}>
              <p className="text-3xl leading-tight text-[#FFF8EA] sm:text-4xl" style={{ fontFamily: 'var(--font-gilda), serif', textShadow: '0 2px 18px rgba(0,0,0,.8)' }}>{c.t}</p>
              <p className="mt-1 text-base text-[#F1EEE6]" style={{ textShadow: '0 1px 12px rgba(0,0,0,.9)' }}>{c.b}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
