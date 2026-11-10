'use client'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useThree } from '@react-three/fiber'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useInView, useReducedMotion, useTier } from '@/components/lab/kit/hooks'
import { makeLayout, type DishInfo } from './layout'
import World from './World'

gsap.registerPlugin(ScrollTrigger, useGSAP)

function Kick({ on }: { on: boolean }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => { if (!on) return; const ids = [200, 700, 1500, 2500].map((t) => setTimeout(invalidate, t)); return () => ids.forEach(clearTimeout) }, [on, invalidate])
  return null
}

export default function Scene({ dishes }: { dishes: DishInfo[] }) {
  const reduced = useReducedMotion()
  const light = useTier() === 'light'
  const root = useRef<HTMLDivElement>(null)
  const inView = useInView(root, '100px')
  const [compact, setCompact] = useState<boolean | null>(null)
  useEffect(() => {
    const f = () => setCompact(window.innerWidth / window.innerHeight < 1)
    f(); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f)
  }, [])
  const n = Math.min(4, dishes.length)
  const [dropped, setDropped] = useState(0)
  const [cleared, setCleared] = useState(false)
  const [epoch, setEpoch] = useState(0)
  const ctl = useRef<{ grab: (id: string) => void }>({ grab: () => {} })
  const layout = useMemo(() => makeLayout(!!compact, light), [compact, light])
  const shown = reduced ? n : dropped

  const setDemo = useCallback((steps: NonNullable<Window['__labDemoSteps']>) => { window.__labDemoSteps = steps }, [])
  useEffect(() => () => { delete window.__labDemoSteps }, [])

  useGSAP(() => {
    if (reduced || compact === null) return
    const w = root.current?.closest('[data-story]') as HTMLElement | null
    if (!w) return
    const marks = Array.from({ length: n }, (_, i) => 0.1 + i * 0.15)
    const clearAt = 0.72
    let d = 0, c = false
    const st = ScrollTrigger.create({
      trigger: w, start: 'top top', end: 'bottom bottom',
      onUpdate: (self) => {
        const p = self.progress
        const want = marks.filter((m) => p >= m).length
        if (want > d) { d = want; setDropped(want) }
        if (p >= clearAt && !c) { c = true; setCleared(true) }
        else if (c && p < clearAt - 0.1) { c = false; d = want; setCleared(false); setDropped(want); setEpoch((e) => e + 1) }
      },
    })
    return () => st.kill()
  }, { dependencies: [reduced, compact, n], scope: root })

  const caption = cleared ? 'The table is cleared.' : shown === 0 ? 'The first places are laid.' : `Course ${shown} of ${n}`
  const paused = !inView
  return (
    <div ref={root} className="absolute inset-0">
      <style>{`
        .pp-label{background:#FFF8EA;color:#10281F;padding:8px 12px 9px;border-radius:3px;border:1px solid #F6B94F;box-shadow:0 8px 22px rgba(0,0,0,.45);text-align:center;transition:opacity .5s;animation:pp-in .6s .75s both}
        .pp-label::after{content:'';position:absolute;left:50%;bottom:-9px;width:1px;height:9px;background:#F6B94F}
        @keyframes pp-in{from{opacity:0;margin-top:14px}to{opacity:1;margin-top:0}}
        @media (prefers-reduced-motion: reduce){.pp-label{animation:none}}
      `}</style>
      {compact !== null && (
        <Canvas
          key={epoch}
          shadows frameloop={reduced ? 'demand' : inView ? 'always' : 'never'}
          dpr={light ? [1, 1.5] : [1, 2]} camera={{ fov: 40, near: 0.1, far: 90 }}
          gl={{ antialias: !light, powerPreference: 'high-performance' }}
          style={{ touchAction: 'pan-y' }} aria-label="A dinner table where plates and cutlery drop, settle and can be tossed"
          onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05 }}
        >
          <Suspense fallback={null}>
            <World layout={layout} dishes={dishes} dropped={shown} cleared={cleared} reduced={reduced} light={light} compact={compact} paused={paused} ctl={ctl} setDemo={setDemo} />
          </Suspense>
          <Kick on={reduced} />
        </Canvas>
      )}
      <p aria-live="polite" className="pointer-events-none absolute inset-x-0 bottom-6 z-10 text-center text-lg text-[#FFF8EA] sm:bottom-9 sm:text-2xl" style={{ fontFamily: 'var(--font-gilda), serif', textShadow: '0 2px 16px rgba(0,0,0,.85)' }}>{caption}</p>
    </div>
  )
}
