'use client'
import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion, useTier } from '@/components/lab/kit/hooks'

gsap.registerPlugin(ScrollTrigger)

export type WallItem = { id: string; title: string; rating: number; src: string }

const ROWS = 3
const SHIFT = [0, 4, 8]
const SPEED = [0.9, -1.5, 1.15]
const mod = (a: number, n: number) => ((a % n) + n) % n
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

type Spring = { rx: number; ry: number; vx: number; vy: number; z: number }

export default function Scene({ items, children }: { items: WallItem[]; children?: ReactNode }) {
  const reduced = useReducedMotion()
  const tier = useTier()
  const stageRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const dim = useRef<HTMLDivElement>(null)
  const pool = useRef<HTMLDivElement>(null)
  const dust = useRef<HTMLCanvasElement>(null)
  const list = items.length >= 10 ? items : [...items, ...items, ...items].slice(0, Math.max(10, items.length * 2))
  const n = list.length

  useEffect(() => {
    const stage = stageRef.current!, wrap = wrapRef.current!
    const dimEl = dim.current!, poolEl = pool.current!, cv = dust.current!
    const ctx = cv.getContext('2d')!
    const cards = Array.from(stage.querySelectorAll<HTMLElement>('[data-card]'))
    const caps = cards.map((c) => c.querySelector<HTMLElement>('[data-cap]')!)
    const glares = cards.map((c) => c.querySelector<HTMLElement>('[data-glare]')!)
    const hint = stage.querySelector<HTMLElement>('[data-hint]')
    const intro = stage.querySelector<HTMLElement>('.sw-intro')
    const springs: Spring[] = cards.map(() => ({ rx: 0, ry: 0, vx: 0, vy: 0, z: 0 }))
    const touch = window.matchMedia('(hover: none)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, tier === 'light' ? 1.25 : 1.75)

    let W = 0, H = 0, cw = 0, ch = 0, step = 0, setW = 1
    let prog = 0, p = 0
    const ptr = { x: 0.5, y: 0.4, active: false }
    const light = { x: 0, y: 0 }
    let first = true

    // deterministic dust
    let seed = 7
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
    const parts = Array.from({ length: tier === 'light' ? 40 : 90 }, () => ({ x: rnd(), y: rnd(), vx: (rnd() - 0.5) * 0.012, vy: -0.004 - rnd() * 0.01, s: 0.6 + rnd() * 1.6, ph: rnd() * 6.28 }))

    const layout = () => {
      W = stage.clientWidth; H = stage.clientHeight
      ch = Math.round(H * (W < 600 ? 0.215 : 0.225)); cw = Math.round(ch * 0.667)
      step = cw + Math.round(cw * 0.12); setW = n * step
      cards.forEach((c) => { c.style.width = cw + 'px'; c.style.height = ch + 'px' })
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr)
    }

    let last = performance.now()
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now
      const t = now / 1000
      p += (prog - p) * Math.min(1, dt * 6)
      const h = reduced ? 1 : smooth(0.76, 0.93, p)

      // light target
      let tx: number, ty: number
      if (touch || !ptr.active) {
        if (touch) {
          tx = W * (0.5 + 0.3 * Math.sin(p * Math.PI * 2 * 1.5))
          ty = H * (0.12 + 0.76 * Math.min(1, p / 0.8))
        } else { tx = W * (0.5 + 0.26 * Math.sin(t * 0.55)); ty = H * (0.42 + 0.14 * Math.sin(t * 0.8 + 1)) }
      } else { tx = ptr.x * W; ty = ptr.y * H }
      if (first) { light.x = tx; light.y = ty; first = false }
      const k = 1 - Math.exp(-dt * (touch ? 5 : 11))
      light.x += (tx - light.x) * k; light.y += (ty - light.y) * k

      const base = Math.min(W, H) * (W < 600 ? 0.4 : 0.3)
      const R = base * (1 + 0.2 * Math.sin(p * Math.PI * 6)) * (1 + h * 3.2)
      const a = 0.86 * (1 - h)

      dimEl.style.background = `radial-gradient(circle ${R}px at ${light.x}px ${light.y}px, rgba(8,2,5,0) 0%, rgba(8,2,5,${a * 0.12}) 30%, rgba(8,2,5,${a * 0.5}) 62%, rgba(8,2,5,${a}) 100%)`
      poolEl.style.background = `radial-gradient(circle ${R * 0.95}px at ${light.x}px ${light.y}px, rgba(255,243,214,0.2) 0%, rgba(255,159,67,0.2) 35%, rgba(255,159,67,0.05) 70%, rgba(255,159,67,0) 100%)`
      poolEl.style.opacity = String(1 - h)
      if (intro) intro.style.opacity = reduced ? '0' : String(1 - smooth(0.08, 0.3, p))
      if (hint) hint.style.opacity = String(Math.max(0, 1 - p * 8) * (1 - h))

      // rows
      const cols = Math.max(1, Math.floor(W / step))
      const gridLeft = (W - cols * step + (step - cw)) / 2
      const offT = -gridLeft
      const rowY = [0.17, 0.465, 0.76].map((f) => H * f - ch / 2 - (h > 0 ? 0 : 0))
      const drift = p * Math.max(W, 900) * 2.4
      for (let r = 0; r < ROWS; r++) {
        const off0 = drift * SPEED[r] + r * step * 0.45
        const delta = mod(offT - off0 + setW / 2, setW) - setW / 2
        const off = off0 + delta * h
        const y = rowY[r] + (1 - h) * (r - 1) * -H * 0.015 * Math.sin(p * 9 + r)
        for (let i = 0; i < n; i++) {
          const idx = r * n + i
          const el = cards[idx]
          const x = mod(i * step - off + step, setW) - step
          const cx = x + cw / 2, cy = y + ch / 2
          const dx = light.x - cx, dy = light.y - cy
          const dist = Math.hypot(dx, dy)
          const prox = Math.max(0, 1 - dist / (R * 1.15)) * (1 - h * 0.7)
          const s = springs[idx]
          const onScreen = x > -step && x < W + step
          if (!onScreen) { el.style.visibility = 'hidden'; continue }
          el.style.visibility = 'visible'
          let trx: number, try_: number
          if (reduced) { trx = ((i + r) % 3 - 1) * 2.5; try_ = ((i * 2 + r) % 3 - 1) * 3 } else {
            const m = (0.35 + 0.65 * prox) * 16
            trx = -Math.max(-1, Math.min(1, dy / (ch * 1.3))) * m
            try_ = Math.max(-1, Math.min(1, dx / (cw * 1.3))) * m
          }
          if (!reduced) {
            const K = 150, D = 9
            s.vx += ((trx - s.rx) * K - s.vx * D) * dt; s.rx += s.vx * dt
            s.vy += ((try_ - s.ry) * K - s.vy * D) * dt; s.ry += s.vy * dt
          } else { s.rx = trx; s.ry = try_ }
          const z = prox * 46
          s.z += (z - s.z) * Math.min(1, dt * 9)
          el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${s.z.toFixed(1)}px) rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg)`
          const outside = x < gridLeft - 2 || x > gridLeft + (cols - 1) * step + 2
          el.style.opacity = String(outside ? 1 - h : 1)
          caps[idx].style.opacity = String(h)
          const g = glares[idx]
          g.style.setProperty('--gx', ((dx / cw) * -0.9 + 0.5) * 100 + '%')
          g.style.setProperty('--gx', (((light.x - x) / cw) * 100).toFixed(1) + '%')
          g.style.setProperty('--gy', (((light.y - y) / ch) * 100).toFixed(1) + '%')
          g.style.opacity = String(Math.min(1, prox * 1.4))
        }
      }
      stage.dataset.ready = '1'

      // dust
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      if (h < 0.98) for (const q of parts) {
        if (!reduced) { q.x += q.vx * dt + Math.sin(t * 0.6 + q.ph) * 0.0004; q.y += q.vy * dt; if (q.y < -0.02) q.y = 1.02; if (q.x < -0.02) q.x = 1.02; if (q.x > 1.02) q.x = -0.02 }
        const px = q.x * W, py = q.y * H
        const d = Math.hypot(px - light.x, py - light.y)
        if (d > R) continue
        const al = (1 - d / R) ** 1.5 * (0.45 + 0.4 * Math.sin(t * 1.7 + q.ph)) * (1 - h)
        if (al <= 0.01) continue
        ctx.fillStyle = `rgba(255,243,214,${al.toFixed(3)})`
        ctx.beginPath(); ctx.arc(px, py, q.s, 0, 6.283); ctx.fill()
      }
    }

    layout()
    let tick: (() => void) | null = null
    let st: ScrollTrigger | undefined
    const onResize = () => { layout(); if (reduced) frame(performance.now()) }
    window.addEventListener('resize', onResize)
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      ptr.active = true; ptr.x = e.clientX / window.innerWidth; ptr.y = e.clientY / window.innerHeight
    }
    window.addEventListener('pointermove', onMove)

    if (reduced) { frame(performance.now()) } else {
      st = ScrollTrigger.create({ trigger: wrap, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: (self) => { prog = self.progress } })
      prog = st.progress; p = prog
      tick = () => frame(performance.now())
      gsap.ticker.add(tick)
    }

    window.__labDemoSteps = [
      { type: 'move', x: 0.12, y: 0.25, ms: 400 },
      { type: 'move', x: 0.5, y: 0.2, ms: 900 },
      { type: 'move', x: 0.88, y: 0.35, ms: 900 },
      { type: 'move', x: 0.82, y: 0.72, ms: 900 },
      { type: 'move', x: 0.45, y: 0.78, ms: 900 },
      { type: 'move', x: 0.14, y: 0.6, ms: 900 },
      { type: 'move', x: 0.5, y: 0.45, ms: 800 },
    ]

    return () => {
      window.removeEventListener('resize', onResize); window.removeEventListener('pointermove', onMove)
      if (tick) gsap.ticker.remove(tick)
      st?.kill(); delete window.__labDemoSteps
    }
  }, [reduced, tier, n])

  return (
    <div ref={wrapRef} className="relative h-[460vh] motion-reduce:h-auto">
      <div
        ref={stageRef}
        className="sticky top-0 h-[100dvh] w-full touch-pan-y overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, #3a1220 0%, #2B0B14 55%, #1a060c 100%)', perspective: '900px', perspectiveOrigin: '50% 45%' }}
      >
        {[0.17, 0.465, 0.76].map((f, r) => (
          <div key={r} aria-hidden className="absolute inset-x-0" style={{ top: `calc(${f * 100}% + 11.6dvh)`, height: 5, background: 'linear-gradient(#8a6a2c, #3b2a0e)', boxShadow: '0 8px 14px rgba(0,0,0,.45)' }} />
        ))}
        {Array.from({ length: ROWS }).flatMap((_, r) =>
          Array.from({ length: n }).map((__, i) => {
            const m = list[(i + SHIFT[r]) % n]
            return (
              <div key={`${r}-${i}`} data-card className="absolute left-0 top-0 [backface-visibility:hidden]" style={{ width: 120, height: 180, visibility: 'hidden', transformStyle: 'preserve-3d', willChange: 'transform' }}>
                <div className="relative h-full w-full overflow-hidden rounded-[3px] bg-[#1a060c] shadow-[0_10px_24px_rgba(0,0,0,.55)] ring-1 ring-[#D8A84E]/25">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.src} alt={r === 0 ? `${m.title} poster` : ''} draggable={false} loading={r === 0 && i < 4 ? 'eager' : 'lazy'} className="h-full w-full object-cover" />
                  <div data-glare className="pointer-events-none absolute inset-0 opacity-0" style={{ background: 'radial-gradient(circle at var(--gx,50%) var(--gy,50%), rgba(255,246,222,.7) 0%, rgba(255,214,150,.22) 30%, rgba(255,214,150,0) 62%)', mixBlendMode: 'soft-light' }} />
                </div>
                <div data-cap className="pointer-events-none absolute left-0 right-0 top-full mt-[1.9dvh] opacity-0" style={{ color: '#FFF3D6' }}>
                  <p className="line-clamp-2 text-[13px] font-extrabold leading-tight md:text-[15px]" style={{ fontFamily: 'var(--font-display), Impact, sans-serif' }}>{m.title}</p>
                  <p className="text-[12px] md:text-[13px]" style={{ color: '#D8A84E' }}>{m.rating} / 5</p>
                </div>
              </div>
            )
          }),
        )}
        <div ref={dim} aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'rgba(8,2,5,.86)' }} />
        <div ref={pool} aria-hidden className="pointer-events-none absolute inset-0" style={{ mixBlendMode: 'screen' }} />
        <canvas ref={dust} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
        {children}
      </div>
    </div>
  )
}
