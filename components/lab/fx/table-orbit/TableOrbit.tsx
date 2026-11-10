'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { Bloom, DepthOfField, EffectComposer, Noise, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useInView, useReducedMotion, useTier } from '@/components/lab/kit/hooks'
import type { SeatCard } from './seats'
import World from './World'
import Rig from './Rig'

gsap.registerPlugin(ScrollTrigger, useGSAP)
const sstep = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

export default function TableOrbit({ cards }: { cards: SeatCard[] }) {
  const reduced = useReducedMotion()
  const tier = useTier()
  const light = tier === 'light'
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const root = useRef<HTMLDivElement>(null)
  const inView = useInView(root, '100px')
  const shared = useRef({ p: 0 })
  const cardEls = useRef<(HTMLElement | null)[]>([])
  const finale = useRef<HTMLParagraphElement>(null)
  const [ready, setReady] = useState(false)
  const [settled, setSettled] = useState(false)
  const dof = useMemo(() => new THREE.Vector3(), [])
  const wrap = useRef<HTMLElement | null>(null)

  useEffect(() => { wrap.current = root.current?.closest('[data-story]') as HTMLElement | null }, [mounted])
  useEffect(() => { if (!reduced || !ready) return; const id = setTimeout(() => setSettled(true), 3200); return () => clearTimeout(id) }, [reduced, ready])

  useGSAP(() => {
    if (reduced) return
    const w = root.current?.closest('[data-story]') as HTMLElement | null
    if (!w) return
    const trig = ScrollTrigger.create({ trigger: w, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: (self) => { shared.current.p = self.progress } })
    shared.current.p = trig.progress
    return () => trig.kill()
  }, { scope: root, dependencies: [reduced, mounted] })

  const onFrame = useCallback((s: number) => {
    cardEls.current.forEach((el, i) => {
      if (!el) return
      const d = s - (i + 1)
      const a = 1 - sstep(0.1, 0.34, Math.abs(d))
      el.style.opacity = String(a)
      el.style.visibility = a < 0.01 ? 'hidden' : 'visible'
      el.style.transform = `translate3d(0, ${(d * 46).toFixed(1)}px, 0) rotate(${-1.4 + d * 1.5}deg)`
    })
    const f = finale.current
    if (f && !reduced) { const a = sstep(8.35, 8.95, s); f.style.opacity = String(a); f.style.visibility = a < 0.01 ? 'hidden' : 'visible' }
    if (!reduced) wrap.current?.style.setProperty('--hero', String(1 - sstep(0.04, 0.55, s)))
  }, [reduced])

  const frameloop = reduced ? (settled ? 'demand' : 'always') : inView ? 'always' : 'never'
  return (
    <div ref={root} className="absolute inset-0 z-[1]">
      <div className="absolute inset-0 transition-opacity duration-700" style={{ opacity: ready ? 1 : 0 }}>
        {mounted && (
          <Canvas
            frameloop={frameloop}
            shadows={!light}
            dpr={light ? [1, 1.5] : [1, 2]}
            camera={{ fov: 36, near: 0.05, far: 60, position: [0, 7, 3] }}
            gl={{ antialias: false, powerPreference: 'high-performance', toneMapping: THREE.NoToneMapping }}
            aria-hidden
          >
            <World cards={cards} shared={shared} light={light} still={reduced} />
            <Rig shared={shared} still={reduced} onFrame={onFrame} onReady={() => setReady(true)} dof={dof} />
            <EffectComposer multisampling={light ? 2 : 4} enableNormalPass={false}>
              {light ? <></> : <DepthOfField target={dof} focalLength={0.06} bokehScale={1.3} height={480} />}
              <Bloom intensity={light ? 0.8 : 1.0} luminanceThreshold={1.0} luminanceSmoothing={0.25} mipmapBlur radius={0.7} />
              <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
              <Vignette eskil={false} offset={0.25} darkness={0.75} />
              <Noise opacity={0.045} />
            </EffectComposer>
          </Canvas>
        )}
      </div>

      {/* place cards, synced to the camera (the full list is also in the page below) */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-4 pb-6 sm:justify-start sm:px-12 sm:pb-14">
        <div className="relative h-[190px] w-full max-w-[26rem]">
          {cards.map((c, i) => (
            <article
              key={c.key}
              ref={(el) => { cardEls.current[i] = el }}
              className="absolute inset-x-0 bottom-0 rounded-[3px] bg-[#F6F1E4] px-6 py-5 text-[#17352A] shadow-[0_18px_40px_rgba(0,0,0,.55)]"
              style={{ opacity: 0, visibility: 'hidden', outline: '1px solid #B88A44', outlineOffset: '-7px' }}
            >
              <p className="flex items-baseline justify-between">
                <span className="text-[2.6rem] leading-none text-[#5a1626]" style={{ fontFamily: 'var(--font-pinyon), cursive' }}>{c.name}</span>
                <span className="text-sm text-[#17352A]/70">seat {i + 1} of 8</span>
              </p>
              <p className="mt-2 text-[1.35rem] leading-snug" style={{ fontFamily: 'var(--font-gilda), serif' }}>{c.headline}</p>
              {c.meta && <p className="mt-1 text-sm text-[#17352A]/80">{c.meta}</p>}
            </article>
          ))}
          {!reduced && <p ref={finale} className="absolute inset-x-0 bottom-2 px-2 text-center text-3xl text-[#FFF8EA] sm:text-left sm:text-4xl" style={{ opacity: 0, visibility: 'hidden', fontFamily: 'var(--font-gilda), serif', textShadow: '0 2px 22px rgba(0,0,0,.9)' }}>
            Pull up a chair.
          </p>}
        </div>
      </div>

      {reduced && (
        <ul className="absolute inset-x-0 bottom-0 z-10 flex flex-wrap gap-x-5 gap-y-1 bg-gradient-to-t from-black/80 to-transparent px-6 pb-5 pt-12 text-lg text-[#FFF8EA] sm:px-12" style={{ fontFamily: 'var(--font-pinyon), cursive' }}>
          {cards.map((c) => <li key={c.key}>{c.name}</li>)}
        </ul>
      )}
    </div>
  )
}
