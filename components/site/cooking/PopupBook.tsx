'use client'
// Ported from components/lab/fx/popup-book/PopupBook.tsx. Window scroll turns the pages (GSAP ScrollTrigger scrub on the
// [data-story] wrapper). Captions are real HTML links; the paper text is drawn from the dishes passed in.
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { dprFor, useInView, useReducedMotion, useTier } from '@/components/site/hooks'
import { buildAssets, type Assets, type BookData } from './art'
import type { BookState } from './book'
import Scene from './Scene'
import { fmtRating } from '@/lib/format'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function PopupBook({ data }: { data: BookData }) {
  const reduced = useReducedMotion()
  const tier = useTier()
  const light = tier === 'light'
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const root = useRef<HTMLDivElement>(null)
  const inView = useInView(root, '100px')
  const shared = useRef({ p: 0 })
  const [assets, setAssets] = useState<Assets | null>(null)
  const [ready, setReady] = useState(false)
  const [settled, setSettled] = useState(false)
  const caps = useRef<(HTMLElement | null)[]>([])

  // paint every page and pop-up on canvases once the fonts are in
  useEffect(() => {
    if (!mounted) return
    let dead = false
    ;(async () => {
      const cs = getComputedStyle(root.current!)
      const fam = { gilda: cs.getPropertyValue('--font-gilda').trim() || 'serif', hanken: cs.getPropertyValue('--font-hanken').trim() || 'sans-serif', pinyon: cs.getPropertyValue('--font-pinyon').trim() || 'cursive' }
      const fonts = Promise.all([`48px ${fam.gilda}`, `40px ${fam.hanken}`, `600 40px ${fam.hanken}`].map((f) => document.fonts.load(f).catch(() => [])))
      await Promise.race([fonts, new Promise((r) => setTimeout(r, 3500))])
      if (dead) return
      setAssets(buildAssets(data, fam, light ? 150 : 230))
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
    const vis = reduced ? [0, 1, ...s.r.slice(1).map(() => 0)] : [1 - Math.min(1, s.turn[0] * 2.5), ...s.r]
    vis.forEach((a, i) => {
      const el = caps.current[i]
      if (!el) return
      el.style.opacity = String(Math.min(1, a * 1.4))
      el.style.visibility = a < 0.02 ? 'hidden' : 'visible'
      el.style.transform = `translate3d(0, ${((1 - a) * 18).toFixed(1)}px, 0)`
    })
  }, [reduced])

  const shown = data.dishes.slice(0, 3)
  const frameloop = reduced ? (settled ? 'demand' : 'always') : inView ? 'always' : 'never'
  return (
    <div ref={root} className="absolute inset-0 z-[1]">
      <div className="absolute inset-0 transition-opacity duration-700" style={{ opacity: ready ? 1 : 0 }}>
        {mounted && assets && (
          <Canvas
            frameloop={frameloop}
            shadows
            dpr={dprFor(tier)}
            camera={{ fov: 34, near: 0.1, far: 60, position: [0, 6, 4] }}
            gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
            style={{ touchAction: 'pan-y' }}
            aria-hidden
          >
            <Scene assets={assets} shared={shared} still={reduced} light={light} onFrame={onFrame} onReady={() => setReady(true)} />
          </Canvas>
        )}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0) 55%, rgba(16,40,31,.85) 100%)' }} />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[rgb(16_40_31/0.92)] via-[rgb(16_40_31/0.6)] to-transparent px-4 pb-5 pt-20 sm:px-6 sm:pb-8">
        <div className="relative mx-auto h-[5.5rem] max-w-6xl">
          <div ref={(el) => { caps.current[0] = el }} className="absolute inset-x-0 bottom-0">
            <p className="ev-title text-[var(--wax)] [text-shadow:0_2px_14px_rgb(0_0_0/0.8)]">From the kitchen</p>
            <p className="mt-1 text-[var(--wax)] [text-shadow:0_1px_10px_rgb(0_0_0/0.9)]">Scroll to open the book on the latest dishes.</p>
          </div>
          {shown.map((d, i) => (
            <div key={d.slug} ref={(el) => { caps.current[i + 1] = el }} className="absolute inset-x-0 bottom-0" style={{ opacity: 0, visibility: 'hidden' }}>
              <p className="ev-title text-[var(--wax)] [text-shadow:0_2px_14px_rgb(0_0_0/0.8)]">
                <Link href={`/cooking/${d.slug}`} className="pointer-events-auto ev-link inline-flex min-h-[44px] items-center">{d.name}</Link>
              </p>
              <p className="ev-meta text-base text-[var(--wax)] [text-shadow:0_1px_10px_rgb(0_0_0/0.9)]">{d.category}, rated {fmtRating(d.rating)} of 5{i === 0 ? ', the latest' : ''}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
