'use client'
import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useReducedMotion, useTier } from '@/components/lab/kit/hooks'
import { N, drawStreaks, makePatterns, makeStreaks, renderZoom, smoothstep, type DishInfo, type Env, type Poster } from './draw'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export type Film = { title: string; posterUrl: string; rating: number }
export type Cap = { h: string; p: string }

const Z0 = 0.3
const Z_END = 8
const Z_STATIC = 0.55

export default function Scene({ films, dish, caps }: { films: Film[]; dish: DishInfo; caps: Cap[] }) {
  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const rm = useReducedMotion()
  const tier = useTier()

  useGSAP(() => {
    const cv = canvas.current, el = root.current
    if (!cv || !el) return
    const c = cv.getContext('2d')
    if (!c) return
    const wrap = document.getElementById('iz-wrap')
    const intro = document.getElementById('iz-intro')
    const hint = document.getElementById('iz-hint')
    const capEls = Array.from(el.querySelectorAll<HTMLElement>('[data-cap]'))
    const pats = makePatterns()
    const posters: Poster[] = films.map((f) => ({ img: null, title: f.title }))
    const env: Env = { wide: true, B: 1, t: 0, posters, dish, brick: pats.brick, cloth: pats.cloth }
    const streaks = makeStreaks()
    let w = 1, h = 1, dpr = 1
    let z = Z0, target = Z0, prog = 0, vel = 0, visible = true

    const draw = (zz: number, alpha = 1) => {
      c.globalAlpha = alpha
      renderZoom(c, env, w, h, dpr, zz)
      c.globalAlpha = 1
    }
    const redraw = () => { if (rm) draw(Z_STATIC) }
    const size = () => {
      w = el.clientWidth || 1; h = el.clientHeight || 1
      dpr = Math.min(window.devicePixelRatio || 1, tier === 'light' ? 1.5 : 2)
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr)
      env.wide = w / h > 1.15; env.B = Math.max(w, h) / 1000
      redraw()
    }
    films.forEach((f, i) => { const im = new Image(); im.onload = () => { posters[i].img = im; redraw() }; im.src = f.posterUrl })
    size()
    const ro = new ResizeObserver(size); ro.observe(el)

    if (rm) return () => ro.disconnect()

    const st = ScrollTrigger.create({ trigger: wrap, start: 'top top', end: 'bottom bottom', onUpdate: (self) => { prog = self.progress; target = Z0 + (Z_END - Z0) * prog } })
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting }, { rootMargin: '100px' }); io.observe(el)

    const tick = (time: number, delta: number) => {
      const dt = Math.min(0.05, delta / 1000)
      env.t = time
      if (visible) {
        const prev = z
        z += (target - z) * (1 - Math.exp(-dt * 7))
        const v = (z - prev) / Math.max(dt, 0.001)
        vel += (v - vel) * (1 - Math.exp(-dt * 10))
        const av = Math.abs(vel)
        draw(z)
        if (tier === 'full' && av > 0.45) draw(z - vel * 0.05, Math.min(0.4, av * 0.14))
        drawStreaks(c, streaks, w, h, dpr, Math.min(1, Math.max(0, (av - 0.25) * 0.55)))
        capEls.forEach((ce, i) => {
          const dz = ((((z - i + 0.25) % N) + N) % N) - 0.25
          const wgt = smoothstep(-0.25, -0.02, dz) * (1 - smoothstep(0.5, 0.7, dz))
          ce.style.opacity = String(wgt)
          ce.style.transform = `translateY(${(1 - wgt) * 14}px)`
        })
      }
      if (intro) intro.style.opacity = String(1 - smoothstep(0, 0.05, prog))
      if (hint) hint.style.opacity = String(1 - smoothstep(0, 0.03, prog))
    }
    gsap.ticker.add(tick)
    return () => { gsap.ticker.remove(tick); st.kill(); io.disconnect(); ro.disconnect() }
  }, { scope: root, dependencies: [rm, tier, films, dish] })

  return (
    <div ref={root} className="iz-scene" aria-hidden={false}>
      <canvas ref={canvas} className="iz-canvas" role="img" aria-label="An endless zoom: a street, a lit window, a laid table, a plate, a film frame, and the street again." />
      {!rm && (
        <div className="iz-caps">
          {caps.map((cp, i) => (
            <div key={i} data-cap className="iz-cap" style={{ opacity: i === 0 ? 1 : 0 }}>
              <p className="iz-cap-h">{cp.h}</p>
              <p className="iz-cap-p">{cp.p}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
