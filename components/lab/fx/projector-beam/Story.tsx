'use client'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useInView, useReducedMotion, useTier } from '@/components/lab/kit/hooks'
import Scene from './Scene'
import type { Film, Shared } from './types'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

export default function Story({ films }: { films: Film[] }) {
  const rm = useReducedMotion()
  const tier = useTier()
  const light = tier === 'light'
  const root = useRef<HTMLDivElement>(null)
  const inView = useInView(root, '100px')
  const [shown, setShown] = useState(0)
  const [ready, setReady] = useState(false)
  const shared = useRef<Shared>({ progress: 0, pointer: { x: 0, y: 0.05 }, onShown: () => {} })
  shared.current.onShown = (i) => setShown(i)

  useEffect(() => { setReady(true) }, [])

  // pointer -> shared state (window level, so HTML overlays don't swallow it)
  useEffect(() => {
    const move = (e: PointerEvent) => {
      shared.current.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      shared.current.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', move, { passive: true })
    // recorder demo: the cursor drifts across the beam
    window.__labDemoSteps = [
      { type: 'move', x: 0.5, y: 0.5, ms: 0 },
      { type: 'move', x: 0.3, y: 0.42, ms: 900 },
      { type: 'move', x: 0.55, y: 0.55, ms: 900 },
      { type: 'move', x: 0.72, y: 0.4, ms: 900 },
      { type: 'move', x: 0.45, y: 0.5, ms: 900 },
      { type: 'wait', ms: 300 },
    ]
    return () => { window.removeEventListener('pointermove', move); delete window.__labDemoSteps }
  }, [])

  useGSAP(() => {
    const wrap = document.getElementById('pb-wrap')
    if (!wrap || rm) return
    const intro = document.getElementById('pb-intro')
    const hint = document.getElementById('pb-hint')
    const cap = document.getElementById('pb-cap')
    ScrollTrigger.create({
      trigger: wrap, start: 'top top', end: 'bottom bottom',
      onUpdate: (self) => {
        shared.current.progress = self.progress
        const a = 1 - Math.min(1, self.progress / 0.07)
        if (intro) { intro.style.opacity = String(a); intro.style.transform = `translateY(${(1 - a) * -24}px)` }
        if (hint) hint.style.opacity = String(a)
        // the film caption waits until the title has fully gone (they share the lower-left corner)
        if (cap) cap.style.opacity = String(Math.min(1, Math.max(0, (self.progress - 0.08) / 0.05)))
      },
    })
  }, { dependencies: [rm] })

  const f = films[Math.min(shown, films.length - 1)]
  return (
    <div ref={root} style={{ position: 'absolute', inset: 0 }}>
      {ready && films.length > 0 && <Scene films={films} shared={shared.current} light={light} rm={rm} paused={!inView} />}
      {f && (
        <div id="pb-cap" className="pb-cap" style={{ opacity: rm ? 1 : 0 }}>
          <div className="pb-caption" key={f.id + (rm ? 'r' : '')} aria-live="polite">
            <p className="pb-cap-title">{f.title}</p>
            <p className="pb-cap-meta">Rated {f.rating} of 5 &middot; watched {fmtDate(f.watchDate)}</p>
          </div>
        </div>
      )}
    </div>
  )
}
