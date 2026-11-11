'use client'
// The home story stage: one sticky 100dvh stage inside the tall [data-story] wrapper, one <Canvas>, one ScrollTrigger (scrub)
// writing progress p (0..1). One beat is mounted at a time:
//   dusk   p 0 - 0.33     the tilt-shift street, lamps and windows, then the dolly through Number 14's window (warm flood 0.30 - 0.38)
//   table  p 0.33 - 0.855 the candle-lit table, seat to seat (dim 0.80 - 0.85)
//   late   p 0.855 - 1    the projector, the beam, real posters on the screen
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { dprFor, useInView, useReducedMotion, useTier } from '@/components/site/hooks'
import Rating from '@/components/site/Rating'
import Dusk from './Dusk'
import TableBeat from './TableBeat'
import Late from './Late'
import SeatCards from './SeatCards'
import type { StageProps } from './content'

gsap.registerPlugin(ScrollTrigger, useGSAP)

type Beat = 'dusk' | 'table' | 'late'
const sstep = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const beatOf = (p: number): Beat => (p < 0.33 ? 'dusk' : p < 0.855 ? 'table' : 'late')
const TABLE_FROM = 0.34
const TABLE_SPAN = 0.5

/** Fires once after a few frames have been drawn (the poster frame then fades out). */
function Ready({ onReady }: { onReady: () => void }) {
  const n = useRef(0)
  useFrame(() => { if (++n.current === 4) onReady() })
  return null
}

export default function Stage({ data }: { data: StageProps }) {
  const reduced = useReducedMotion()
  const light = useTier() === 'light'
  const tier = light ? 'light' : 'full'
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const host = useRef<HTMLDivElement>(null)
  const inView = useInView(host, '100px')
  const prog = useRef(0)
  const tableShared = useRef<{ p: number; s: number; lit?: number }>({ p: 0, s: 0 })
  const [beat, setBeat] = useState<Beat>('dusk')
  const [ready, setReady] = useState(false)
  const [settled, setSettled] = useState(false)
  const [film, setFilm] = useState(-1)
  const flood = useRef<HTMLDivElement>(null)
  const dim = useRef<HTMLDivElement>(null)
  const capDusk = useRef<HTMLDivElement>(null)
  const filmsOk = data.films.length > 0

  useEffect(() => { if (!reduced || !ready) return; const id = setTimeout(() => setSettled(true), 3200); return () => clearTimeout(id) }, [reduced, ready])

  useGSAP(() => {
    if (reduced) return
    const wrap = host.current?.closest('[data-story]') as HTMLElement | null
    if (!wrap) return
    const apply = (p: number) => {
      prog.current = p
      tableShared.current.p = clamp01((p - TABLE_FROM) / TABLE_SPAN)
      setBeat((b) => { const n = beatOf(p); return n === b ? b : n })
      const f = p < 0.335 ? sstep(0.3, 0.33, p) : 1 - sstep(0.34, 0.38, p)
      if (flood.current) flood.current.style.opacity = String(f)
      const d = p < 0.85 ? sstep(0.8, 0.85, p) : 1 - sstep(0.86, 0.89, p)
      if (dim.current) dim.current.style.opacity = String(d)
      if (capDusk.current) capDusk.current.style.opacity = String(sstep(0.02, 0.05, p) * (1 - sstep(0.2, 0.24, p)))
      wrap.style.setProperty('--hero', String(1 - sstep(0.0, 0.05, p)))
    }
    const trig = ScrollTrigger.create({ trigger: wrap, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: (self) => apply(self.progress) })
    apply(trig.progress)
    return () => trig.kill()
  }, { dependencies: [reduced] })

  const onFilm = useCallback((i: number) => setFilm(i), [])
  const onReady = useCallback(() => setReady(true), [])

  const frameloop = reduced ? (settled ? 'demand' : 'always') : inView ? 'always' : 'never'
  const current = !reduced && beat === 'late' && film >= 0 ? data.films[film] ?? null : null
  const lateOn = !reduced && beat === 'late'

  return (
    <div ref={host} className="absolute inset-0">
      <div className="absolute inset-0 z-[1] transition-opacity duration-700" style={{ opacity: ready ? 1 : 0 }}>
        {mounted && (
          <Canvas
            frameloop={frameloop}
            shadows={!light}
            dpr={dprFor(tier)}
            camera={{ fov: light ? 32 : 24, near: 0.5, far: 150, position: [-10, 6, 16] }}
            gl={{ antialias: false, powerPreference: 'high-performance', toneMapping: THREE.NoToneMapping }}
            aria-hidden
            onCreated={({ invalidate }) => { for (const ms of [150, 600, 1500, 3000]) setTimeout(invalidate, ms) }}
          >
            <Ready onReady={onReady} />
            {reduced ? (
              <TableBeat key="still" cards={data.cards} stage={data.stage} shared={tableShared} light={light} still onReady={onReady} />
            ) : beat === 'dusk' ? (
              <Dusk key="dusk" prog={prog} light={light} posterUrl={data.stage.posterUrl} />
            ) : beat === 'table' ? (
              <TableBeat key="table" cards={data.cards} stage={data.stage} shared={tableShared} light={light} still={false} onReady={() => {}} />
            ) : (
              <Late key="late" films={data.films} prog={prog} light={light} onFilm={onFilm} />
            )}
          </Canvas>
        )}
      </div>

      {/* scrims keep the text readable over the scene */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-48 bg-gradient-to-t from-[rgb(8_14_26/0.7)] to-transparent" />

      {!reduced && (
        <>
          <div ref={capDusk} className="pointer-events-none absolute bottom-20 left-4 z-10 max-w-sm opacity-0 sm:bottom-14 sm:left-12" aria-hidden>
            <p className="ev-serif text-3xl text-[var(--wax)] sm:text-4xl" style={{ textShadow: '0 2px 20px rgba(0,0,0,.85)' }}>Number 14, about seven.</p>
            <p className="mt-1 text-[var(--wax)]" style={{ textShadow: '0 1px 14px rgba(0,0,0,.9)' }}>Lamps first, then the windows.</p>
          </div>
          <SeatCards cards={data.cards} shared={tableShared} active={beat === 'table'} />
          {lateOn && (
            <div className="absolute bottom-20 left-4 right-4 z-10 max-w-md sm:bottom-14 sm:left-12">
              {current ? (
                <>
                  <p className="ev-serif text-3xl text-[var(--wax)] sm:text-4xl" style={{ textShadow: '0 2px 20px rgba(0,0,0,.85)' }}>{current.title}</p>
                  <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[var(--wax)]" style={{ textShadow: '0 1px 14px rgba(0,0,0,.9)' }}>
                    <Rating n={current.rating} size="md" className="text-[var(--wax)]" />
                    <span className="ev-meta">watched {current.watched}</span>
                  </p>
                </>
              ) : (
                <p className="ev-serif text-3xl text-[var(--wax)] sm:text-4xl" style={{ textShadow: '0 2px 20px rgba(0,0,0,.85)' }}>{filmsOk ? 'The lamp is warming up.' : 'Nothing on the projector yet'}</p>
              )}
              <Link href="/movies" className="ev-link mt-1 inline-flex min-h-[44px] items-center">Everything on the projector</Link>
            </div>
          )}
          <div ref={flood} aria-hidden className="pointer-events-none absolute inset-0 z-20 opacity-0" style={{ background: 'radial-gradient(circle at 46% 56%, #FFE3A8 0%, #F6B94F 38%, #B8741F 100%)' }} />
          <div ref={dim} aria-hidden className="pointer-events-none absolute inset-0 z-20 bg-[var(--night)] opacity-0" />
        </>
      )}

      {reduced && (
        <nav aria-label="The table, seat by seat" className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[rgb(8_14_26/0.85)] to-transparent px-4 pb-6 pt-16 sm:px-12">
          <ul className="flex flex-wrap gap-x-2 gap-y-1">
            {data.cards.filter((c) => c.key !== "you-a").map((c) => (
              <li key={c.key}>
                {c.href?.startsWith('#') ? (
                  <a href={c.href} className="ev-link inline-flex min-h-[44px] items-center px-2">{c.name}: {c.headline}</a>
                ) : (
                  <Link href={c.href ?? '/'} className="ev-link inline-flex min-h-[44px] items-center px-2">{c.name}: {c.headline}</Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
