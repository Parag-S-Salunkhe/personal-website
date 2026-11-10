'use client'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useInView, useReducedMotion, useTier } from '@/components/lab/kit/hooks'
import Scene from './Scene'
import type { Shared } from './types'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const CAPTIONS = [
  'Hosting supper clubs and movie nights in Dublin.',
  'Scroll on. It pops.',
  'Movie nights, from the top.',
  'Grab a bucket. Here is what I watched lately.',
]

export default function Story() {
  const rm = useReducedMotion()
  const light = useTier() === 'light'
  const root = useRef<HTMLDivElement>(null)
  const inView = useInView(root, '100px')
  const [family, setFamily] = useState<string | null>(null)
  const [phase, setPhase] = useState(0)
  const shared = useRef<Shared>({ progress: 0, sp: 0, pointer: { x: 0, y: 0, active: false }, onPhase: () => {}, onReady: () => {} })
  shared.current.onPhase = (p) => setPhase(p)
  shared.current.onReady = () => {
    const st = document.getElementById('pn-stage')
    if (st) st.dataset.ready = '1'
  }

  // font first (next/font), then the canvas can draw the word
  useEffect(() => {
    let dead = false
    const el = root.current
    if (!el) return
    const fam = getComputedStyle(el).getPropertyValue('--pn-display').trim() || 'sans-serif'
    ;(async () => {
      try {
        await document.fonts.load(`900 120px ${fam}`, 'PARAGMOVIES')
        await document.fonts.ready
      } catch { /* fall through with whatever loaded */ }
      if (!dead) setFamily(fam)
    })()
    return () => { dead = true }
  }, [])

  useEffect(() => {
    const s = shared.current
    const move = (e: PointerEvent) => {
      s.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      s.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
      s.pointer.active = true
    }
    const leave = () => { s.pointer.active = false }
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    // recorder demo: sweep the cursor through the name, there and back
    const y = 0.4
    window.__labDemoSteps = [
      { type: 'move', x: 0.12, y: 0.62, ms: 0 },
      { type: 'move', x: 0.22, y, ms: 350 },
      { type: 'move', x: 0.36, y: y + 0.03, ms: 450 },
      { type: 'move', x: 0.5, y: y - 0.02, ms: 450 },
      { type: 'move', x: 0.64, y: y + 0.03, ms: 450 },
      { type: 'move', x: 0.78, y, ms: 450 },
      { type: 'move', x: 0.5, y: y - 0.04, ms: 600 },
      { type: 'move', x: 0.3, y: y + 0.02, ms: 600 },
      { type: 'wait', ms: 400 },
      { type: 'move', x: 0.5, y: 0.9, ms: 300 },
    ]
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
      delete window.__labDemoSteps
    }
  }, [])

  useGSAP(() => {
    const wrap = document.getElementById('pn-wrap')
    if (!wrap || rm) return
    const hint = document.getElementById('pn-hint')
    ScrollTrigger.create({
      trigger: wrap, start: 'top top', end: 'bottom bottom',
      onUpdate: (self) => {
        shared.current.progress = self.progress
        if (hint) hint.style.opacity = String(1 - Math.min(1, self.progress / 0.05))
      },
    })
  }, { dependencies: [rm] })

  return (
    <div ref={root} style={{ position: 'absolute', inset: 0 }}>
      {family && <Scene family={family} shared={shared.current} light={light} rm={rm} paused={!inView} />}
      <p className="pn-cap" key={rm ? 'r' : phase} aria-live="polite">{CAPTIONS[rm ? 0 : phase]}</p>
    </div>
  )
}
