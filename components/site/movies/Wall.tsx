'use client'
// Ported from components/lab/fx/spotlight-wall/Scene.tsx: recoloured to night navy + candle light, real links, site hooks.
import { useEffect, useRef, type ReactNode } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion, useTier } from '@/components/site/hooks'

gsap.registerPlugin(ScrollTrigger)

export type WallItem = { id: string; slug: string; title: string; rating: number; src: string }

const ROWS = 3
const SHIFT = [0, 4, 8]
const SPEED = [0.9, -1.5, 1.15]
const mod = (a: number, n: number) => ((a % n) + n) % n
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

type Spring = { rx: number; ry: number; vx: number; vy: number; z: number }

/** The poster wall in the dark: a torch finds the films, lit cards tilt, scrolling brings the house lights up. */
export default function Wall({ items, children }: { items: WallItem[]; children?: ReactNode }) {
  const reduced = useReducedMotion()
  const tier = useTier()
  const stageRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const dim = useRef<HTMLCanvasElement>(null)
  const pool = useRef<HTMLCanvasElement>(null)
  const dust = useRef<HTMLCanvasElement>(null)
  const list = items.length >= 10 ? items : [...items, ...items, ...items].slice(0, Math.max(10, items.length * 2))
  const n = list.length

  useEffect(() => {
    const stage = stageRef.current!, wrap = wrapRef.current!
    const dimEl = dim.current!, poolEl = pool.current!, cv = dust.current!
    const ctx = cv.getContext('2d')!
    // the dark and the torch pool are smooth gradients: drawn at quarter resolution and scaled up, so a frame never repaints a full-screen layer
    const dctx = dimEl.getContext('2d')!, pctx = poolEl.getContext('2d')!
    const LO = 4
    let onStage = true, drawn = false
    const cards = Array.from(stage.querySelectorAll<HTMLElement>('[data-card]'))
    const caps = cards.map((c) => c.querySelector<HTMLElement>('[data-cap]')!)
    const glares = cards.map((c) => c.querySelector<HTMLElement>('[data-glare]')!)
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
      dimEl.width = poolEl.width = Math.ceil(W / LO); dimEl.height = poolEl.height = Math.ceil(H / LO)
    }

    let last = performance.now()
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now
      const t = now / 1000
      p += (prog - p) * Math.min(1, dt * 6)
      const h = reduced ? 1 : smooth(0.76, 0.93, p)

      // where the torch points: the cursor, the finger's scroll path, or a slow drift
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

      const lx = light.x / LO, ly = light.y / LO
      const dg = dctx.createRadialGradient(lx, ly, 0, lx, ly, R / LO)
      dg.addColorStop(0, 'rgba(5,9,18,0)'); dg.addColorStop(0.3, `rgba(5,9,18,${a * 0.12})`)
      dg.addColorStop(0.62, `rgba(5,9,18,${a * 0.5})`); dg.addColorStop(1, `rgba(5,9,18,${a})`)
      dctx.clearRect(0, 0, dimEl.width, dimEl.height); dctx.fillStyle = dg; dctx.fillRect(0, 0, dimEl.width, dimEl.height)
      const pg = pctx.createRadialGradient(lx, ly, 0, lx, ly, (R * 0.95) / LO)
      pg.addColorStop(0, 'rgba(255,243,214,0.2)'); pg.addColorStop(0.35, 'rgba(246,185,79,0.2)')
      pg.addColorStop(0.7, 'rgba(246,185,79,0.05)'); pg.addColorStop(1, 'rgba(246,185,79,0)')
      pctx.clearRect(0, 0, poolEl.width, poolEl.height); pctx.fillStyle = pg; pctx.fillRect(0, 0, poolEl.width, poolEl.height)
      if (!drawn) { dimEl.style.background = 'transparent'; drawn = true } // the solid first-paint dark hands over to the drawn one
      poolEl.style.opacity = String(1 - h)
      if (intro) intro.style.opacity = reduced ? '1' : String(1 - smooth(0.08, 0.3, p))

      // three rows of posters sliding past each other
      const cols = Math.max(1, Math.floor(W / step))
      const gridLeft = (W - cols * step + (step - cw)) / 2
      const offT = -gridLeft
      const rowY = [0.17, 0.465, 0.76].map((f) => H * f - ch / 2)
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
          if (reduced) { trx = 0; try_ = 0 } else {
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
          const ga = Math.min(1, prox * 1.4)
          if (ga > 0) { // only a lit glare moves; an unlit one is never repainted
            g.style.setProperty('--gx', (((light.x - x) / cw) * 100).toFixed(1) + '%')
            g.style.setProperty('--gy', (((light.y - y) / ch) * 100).toFixed(1) + '%')
          }
          g.style.opacity = String(ga)
        }
      }
      stage.dataset.ready = '1'

      // dust in the beam
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      if (!reduced && h < 0.98) for (const q of parts) {
        q.x += q.vx * dt + Math.sin(t * 0.6 + q.ph) * 0.0004; q.y += q.vy * dt
        if (q.y < -0.02) q.y = 1.02
        if (q.x < -0.02) q.x = 1.02
        if (q.x > 1.02) q.x = -0.02
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

    // the wall stops working once it has scrolled away (the lit grid below takes over)
    const io = new IntersectionObserver(([e]) => { onStage = e.isIntersecting; last = performance.now() })
    io.observe(stage)

    if (reduced) { frame(performance.now()) } else {
      st = ScrollTrigger.create({ trigger: wrap, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: (self) => { prog = self.progress } })
      prog = st.progress; p = prog
      tick = () => { if (onStage) frame(performance.now()) }
      gsap.ticker.add(tick)
    }

    return () => {
      window.removeEventListener('resize', onResize); window.removeEventListener('pointermove', onMove)
      io.disconnect()
      if (tick) gsap.ticker.remove(tick)
      st?.kill()
    }
  }, [reduced, tier, n])

  const still = items.slice(0, 18)

  return (
    <div ref={wrapRef} className="relative h-[320vh] motion-reduce:h-auto">
      <div
        ref={stageRef}
        className="group sticky top-0 h-[100dvh] w-full touch-pan-y overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, #1d2c4d 0%, #0F1A2E 55%, #070d19 100%)', perspective: '900px', perspectiveOrigin: '50% 45%' }}
      >
        {/* first paint: a dim wall of the first posters, until the live wall takes over */}
        <div aria-hidden="true" className="absolute inset-0 grid grid-cols-4 content-center gap-3 px-3 opacity-50 transition-opacity duration-500 group-data-[ready=1]:opacity-0 sm:grid-cols-6 lg:grid-cols-9">
          {still.map((m) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={m.id} src={m.src} alt="" width={120} height={180} className="aspect-[2/3] w-full rounded-[3px] object-cover brightness-50" />
          ))}
        </div>
        {[0.17, 0.465, 0.76].map((f, r) => (
          <div key={r} aria-hidden className="absolute inset-x-0" style={{ top: `calc(${f * 100}% + 11.6dvh)`, height: 5, background: 'linear-gradient(#8a6a2c, #3b2a0e)', boxShadow: '0 8px 14px rgba(0,0,0,.45)' }} />
        ))}
        {Array.from({ length: ROWS }).flatMap((_, r) =>
          Array.from({ length: n }).map((__, i) => {
            const m = list[(i + SHIFT[r]) % n]
            const dup = r !== 0
            return (
              <div key={`${r}-${i}`} data-card className="absolute left-0 top-0 [backface-visibility:hidden]" style={{ width: 120, height: 180, visibility: 'hidden', transformStyle: 'preserve-3d', willChange: 'transform' }}>
                <Link
                  href={`/movies/${m.slug}`}
                  aria-label={dup ? undefined : m.title}
                  aria-hidden={dup || undefined}
                  tabIndex={dup ? -1 : undefined}
                  className="relative block h-full w-full overflow-hidden rounded-[3px] bg-[#0a1220] shadow-[0_10px_24px_rgba(0,0,0,.55)] ring-1 ring-[var(--brass)]/30 focus-visible:ring-2 focus-visible:ring-[var(--candle)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.src} alt={dup ? '' : `Poster for ${m.title}`} draggable={false} loading={r === 0 && i < 4 ? 'eager' : 'lazy'} className="h-full w-full object-cover" />
                  <div data-glare className="pointer-events-none absolute inset-0 opacity-0" style={{ background: 'radial-gradient(circle at var(--gx,50%) var(--gy,50%), rgba(255,246,222,.7) 0%, rgba(255,214,150,.22) 30%, rgba(255,214,150,0) 62%)', mixBlendMode: 'soft-light' }} />
                </Link>
                <div data-cap aria-hidden="true" className="pointer-events-none absolute left-0 right-0 top-full mt-[1.9dvh] opacity-0 text-[var(--wax)]">
                  <p className="ev-serif line-clamp-2 text-[14px] leading-tight md:text-[16px]">{m.title}</p>
                  <p className="ev-meta text-[12px] text-[var(--candle)] md:text-[13px]">{m.rating} / 5</p>
                </div>
              </div>
            )
          }),
        )}
        <canvas ref={dim} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" style={{ background: 'rgba(5,9,18,.86)' }} />
        <canvas ref={pool} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" style={{ mixBlendMode: 'screen' }} />
        <canvas ref={dust} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
        <div className="sw-intro pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 pb-10 pt-32 sm:px-6 lg:pb-14" style={{ background: 'linear-gradient(to top, rgba(7,13,25,.92) 0%, rgba(7,13,25,.7) 55%, rgba(7,13,25,0) 100%)' }}>
          <div className="pointer-events-auto mx-auto max-w-6xl">{children}</div>
        </div>
      </div>
    </div>
  )
}
