'use client'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useReducedMotion, useTier } from '@/components/lab/kit/hooks'
import { STORY, clamp01, layoutFor, type Course } from './layout'
import { createSketch, type SketchHandle } from './sketch'

gsap.registerPlugin(ScrollTrigger, useGSAP)

type Props = { courses: Course[] }

export default function Scene({ courses }: Props) {
  const tier = useTier()
  const reduced = useReducedMotion()
  const root = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const host = useRef<HTMLDivElement>(null)
  const progress = useRef(0)
  const labels = useRef<(HTMLDivElement | null)[]>([])
  const caption = useRef<HTMLParagraphElement>(null)
  const [ready, setReady] = useState(false)
  const [go, setGo] = useState(false)
  useEffect(() => { const t = setTimeout(() => setGo(true), 80); return () => clearTimeout(t) }, [])
  const lay = layoutFor(tier)
  const n = Math.min(courses.length, lay.dishes.length)
  const light = tier === 'light'

  // Scroll progress (window scroll through ScrollTrigger; Lenis already drives the window)
  useGSAP(
    () => {
      const wrap = root.current?.closest('[data-pg-wrap]') as HTMLElement | null
      if (!wrap) return
      const title = wrap.querySelector('[data-pg-title]') as HTMLElement | null
      const apply = (pr: number) => {
        progress.current = pr
        if (title) { const k = 1 - clamp01((pr - 0.04) / 0.1); title.style.opacity = String(k); title.style.transform = `translateY(${(1 - k) * -18}px)` }
        let cur = -1
        for (let i = 0; i < n; i++) {
          const e = reduced ? 1 : clamp01((pr - STORY.course[i] - STORY.courseLen * 0.85) / 0.04)
          const el = labels.current[i]
          if (el) { el.style.opacity = String(e); el.style.transform = `translate(-50%, ${(1 - e) * 14}px) rotate(${i % 2 ? 1.4 : -1.6}deg)` }
          if (e > 0.5) cur = i
        }
        if (caption.current) {
          const c = cur >= 0 ? courses[cur] : null
          caption.current.textContent = c ? `${c.name}  ·  ${c.category}` : ''
          caption.current.style.opacity = c ? '1' : '0'
        }
      }
      if (reduced) { apply(1); return }
      ScrollTrigger.create({ trigger: wrap, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: (self) => apply(self.progress) })
      apply(0)
    },
    { scope: root, dependencies: [reduced, n, courses] },
  )

  // p5 sketch
  useEffect(() => {
    if (!go) return
    let handle: SketchHandle | null = null
    let cancelled = false
    let io: IntersectionObserver | null = null
    const t = setTimeout(async () => {
      if (!host.current) return
      const h = await createSketch(host.current, { courses, tier, reduced, getProgress: () => progress.current })
      if (cancelled) { h.destroy(); return }
      handle = h
      io = new IntersectionObserver(([e]) => handle?.setActive(e.isIntersecting), { rootMargin: '100px' })
      if (box.current) io.observe(box.current)
      await h.ready
      if (cancelled) return
      setReady(true)
      ;(window as unknown as { __pgStat?: unknown }).__pgStat = h.stats()
      // Demo for the recorder: move the pointer to the host's neighbour, wait for the wave, then away.
      if (!reduced) {
        const setSteps = () => {
          const cv = h.canvas(); const hd = h.reactorHead(); const cs = h.cropSize()
          if (!cv) return
          const r = cv.getBoundingClientRect()
          const sx = (r.left + (hd.x - (layoutFor(tier).crop.x)) / cs.w * r.width) / window.innerWidth
          const sy = (r.top + (hd.y / cs.h) * r.height) / window.innerHeight
          window.__labDemoSteps = [
            { type: 'move', x: 0.5, y: 0.12, ms: 300 },
            { type: 'move', x: Math.min(0.97, sx + 0.26), y: Math.max(0.05, sy - 0.12), ms: 700 },
            { type: 'move', x: sx, y: sy + 0.04, ms: 800 },
            { type: 'wait', x: sx, y: sy, ms: 2200 },
            { type: 'move', x: sx + 0.02, y: sy - 0.02, ms: 600 },
            { type: 'wait', x: sx, y: sy, ms: 1000 },
            { type: 'move', x: 0.22, y: 0.9, ms: 900 },
            { type: 'wait', x: 0.22, y: 0.9, ms: 900 },
          ]
        }
        setSteps()
        window.addEventListener('resize', setSteps)
        ;(handle as unknown as { _rs?: () => void })._rs = setSteps
      }
    }, 0)
    return () => {
      cancelled = true
      clearTimeout(t)
      io?.disconnect()
      const rs = (handle as unknown as { _rs?: () => void } | null)?._rs
      if (rs) window.removeEventListener('resize', rs)
      handle?.destroy()
      if (typeof window !== 'undefined') { window.__labDemoSteps = undefined }
      setReady(false)
    }
  }, [go, tier, reduced, courses])

  const boxStyle: React.CSSProperties = light
    ? { width: '100vw', aspectRatio: `${lay.crop.w} / ${lay.crop.h}`, top: '52%', transform: 'translate(-50%, -50%)' }
    : { width: 'min(100vw, calc(100dvh * 16 / 9))', aspectRatio: '16 / 9', top: '50%', transform: 'translate(-50%, -50%)' }

  return (
    <div ref={root} className="absolute inset-0 z-[1]">
      <div ref={box} className="absolute left-1/2" style={{ ...boxStyle, containerType: 'inline-size' }}>
        <div ref={host} className="absolute inset-0 transition-opacity duration-700" style={{ opacity: ready ? 1 : 0 }} />
        {!light &&
          courses.slice(0, n).map((c, i) => (
            <div
              key={c.id}
              ref={(el) => { labels.current[i] = el }}
              className="pointer-events-none absolute text-center"
              style={{
                left: `${((lay.dishes[i].x - lay.crop.x) / lay.crop.w) * 100}%`,
                top: `${((lay.dishes[i].y + 62 + (i === 4 ? 58 : 0)) / lay.crop.h) * 100}%`,
                width: '12cqw', opacity: 0, transform: 'translate(-50%, 14px)',
                background: '#FFF8EA', color: '#17352A', padding: '0.7cqw 0.8cqw 0.8cqw', borderRadius: '0.35cqw',
                boxShadow: '0 0.5cqw 1.2cqw rgba(0,0,0,0.45)', border: '1px solid #CBB892',
              }}
            >
              <div style={{ fontFamily: 'var(--font-gilda), Georgia, serif', fontSize: 'max(13px, 1.3cqw)', lineHeight: 1.12 }}>{c.name}</div>
              <div style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 'max(11px, 0.95cqw)', marginTop: '0.3cqw', color: '#7C2236' }}>
                {c.category} · {c.rating}/5
              </div>
            </div>
          ))}
      </div>
      {light && (
        <p
          ref={caption}
          aria-live="polite"
          className="absolute inset-x-0 bottom-[7dvh] px-6 text-center text-lg text-[#FFF8EA]"
          style={{ fontFamily: 'var(--font-gilda), Georgia, serif', opacity: 0, transition: 'opacity .4s' }}
        />
      )}
    </div>
  )
}
