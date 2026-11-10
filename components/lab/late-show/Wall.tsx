'use client'
import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from '@/components/lab/kit/hooks'
import { irisOpenIfNeeded } from './iris'

/** The poster wall: a cursor torch (or a slow drifting beam on touch) lights the posters. Remembers the clicked rect. */
export default function Wall({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null)
  const rm = useReducedMotion()

  useEffect(() => { irisOpenIfNeeded() }, [])

  useEffect(() => {
    const el = root.current!
    const set = (x: number, y: number) => { el.style.setProperty('--mx', x.toFixed(1) + 'px'); el.style.setProperty('--my', y.toFixed(1) + 'px') }
    const r0 = el.getBoundingClientRect()
    set(r0.width * 0.5, Math.min(r0.height * 0.4, 360))
    if (rm) { el.style.setProperty('--torch', '1'); return }
    const tgt = { x: r0.width * 0.5, y: Math.min(r0.height * 0.4, 360) }
    const cur = { ...tgt }
    let active = false
    let visible = false
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(el)
    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const r = el.getBoundingClientRect()
      tgt.x = e.clientX - r.left; tgt.y = e.clientY - r.top; active = true
    }
    window.addEventListener('pointermove', move, { passive: true })
    const tick = () => {
      if (!visible) return
      const t = performance.now() / 1000
      const r = el.getBoundingClientRect()
      if (!active) { tgt.x = r.width * (0.5 + 0.34 * Math.sin(t * 0.5)); tgt.y = r.height * (0.34 + 0.2 * Math.sin(t * 0.37 + 1)) }
      cur.x += (tgt.x - cur.x) * 0.14; cur.y += (tgt.y - cur.y) * 0.14
      set(cur.x, cur.y)
    }
    gsap.ticker.add(tick)
    window.__labDemoSteps = [
      { type: 'move', x: 0.2, y: 0.3, ms: 500 }, { type: 'move', x: 0.8, y: 0.45, ms: 1000 },
      { type: 'move', x: 0.5, y: 0.7, ms: 1000 }, { type: 'move', x: 0.25, y: 0.55, ms: 900 },
    ]
    return () => { gsap.ticker.remove(tick); window.removeEventListener('pointermove', move); io.disconnect(); delete window.__labDemoSteps }
  }, [rm])

  const remember = (e: React.MouseEvent) => {
    const a = (e.target as HTMLElement).closest<HTMLElement>('[data-film]')
    if (!a) return
    const img = a.querySelector('img')
    const r = (img ?? a).getBoundingClientRect()
    try { sessionStorage.setItem('ls-rect', JSON.stringify({ id: a.dataset.film, x: r.left, y: r.top, w: r.width, h: r.height })) } catch {}
  }

  return (
    <div ref={root} className="ls-wallwrap" onClickCapture={remember} style={rm ? { ['--torch' as string]: 1 } : undefined}>
      {children}
      <div className="ls-dim" aria-hidden />
    </div>
  )
}
