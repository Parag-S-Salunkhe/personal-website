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

/** The feature: one canvas, the beam, posters cutting in on countdown leaders. Mounted inside #ls-stage. */
export default function Story({ films }: { films: Film[] }) {
  const rm = useReducedMotion()
  const light = useTier() === 'light'
  const root = useRef<HTMLDivElement>(null)
  const inView = useInView(root, '100px')
  const [shown, setShown] = useState(0)
  const [ready, setReady] = useState(false)
  const shared = useRef<Shared>({ progress: 0, pointer: { x: 0, y: 0.05 }, onShown: () => {} })
  shared.current.onShown = (i) => setShown(i)

  useEffect(() => { setReady(true) }, [])

  useEffect(() => {
    const move = (e: PointerEvent) => {
      shared.current.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      shared.current.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  useGSAP(() => {
    const wrap = document.getElementById('ls-feature')
    if (!wrap) return
    const cap = document.getElementById('ls-cap')
    const stat = document.getElementById('ls-static')
    if (stat) gsap.to(stat, { opacity: 0, duration: 0.6, delay: 1.4 })
    if (rm) return
    ScrollTrigger.create({
      trigger: wrap, start: 'top top', end: 'bottom bottom',
      onUpdate: (self) => {
        shared.current.progress = self.progress
        if (cap) cap.style.opacity = String(Math.min(1, Math.max(0, self.progress / 0.04)))
      },
    })
  }, { dependencies: [rm] })

  const f = films[Math.min(shown, films.length - 1)]
  return (
    <div ref={root} style={{ position: 'absolute', inset: 0 }}>
      {ready && films.length > 0 && <Scene films={films} shared={shared.current} light={light} rm={rm} paused={!inView} />}
      {f && (
        <div id="ls-cap" className="ls-cap" style={{ opacity: rm ? 1 : 0 }}>
          <div className="ls-caption" key={f.id + (rm ? 'r' : '')} aria-live="polite">
            <p className="ls-cap-title">{f.title}</p>
            <p className="ls-cap-meta">Rated {f.rating} of 5 &middot; watched {fmtDate(f.watchDate)}</p>
          </div>
        </div>
      )}
    </div>
  )
}
