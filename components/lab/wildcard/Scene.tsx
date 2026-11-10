'use client'
import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useReducedMotion, useTier } from '@/components/lab/kit/hooks'
import { N, drawStreaks, makePatterns, makeStreaks, renderZoom, smoothstep, type DishInfo, type Env, type Poster } from './draw'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export type Content = { films: { title: string; posterUrl: string; rating: number; date: string }[]; dishes: DishInfo[]; notes: string[]; posts: string[] }
export type Cap = { h: string; p: string }

const Z0 = 0.12
const Z_END = 5.8
const Z_STATIC = 0.3
const cl = (x: number) => Math.min(1, Math.max(0, x))
const back = (x: number) => { const s = 1.9; const t = x - 1; return 1 + t * t * ((s + 1) * t + s) } // easeOutBack

/** Kinetic type: a different move per level. p is 0..1 scrubbed with scroll. */
function kinetic(letters: HTMLElement[], level: number, p: number) {
  const n = letters.length
  letters.forEach((s, i) => {
    const lp = cl(p * (n * 0.55 + 4) / 4 - (i * 0.55) / 4) // staggered
    let tr = '', op = 1
    switch (level) {
      case 0: tr = `translateY(${(-1.1 * (1 - back(lp))).toFixed(3)}em)`; op = lp; break // letters drop in
      case 1: tr = `translateX(${(-1.2 * (1 - lp)).toFixed(3)}em) skewX(${(-18 * (1 - lp)).toFixed(1)}deg)`; op = lp; break // slide and settle
      case 2: { const k = cl(p * 1.4); const sc = 1 + 0.9 * (1 - back(k)); tr = `scale(${sc.toFixed(3)})`; op = cl(p * 3); break } // scale punch on the whole name
      case 3: tr = `translateY(${(110 * (1 - lp)).toFixed(1)}%)`; op = 1; break // rise from a mask
      case 4: tr = `perspective(300px) rotateX(${(-90 * (1 - lp)).toFixed(1)}deg)`; op = lp; break // split-flap
      default: op = lp * n > i ? 1 : 0; break // typewriter, for the seam
    }
    s.style.transform = tr; s.style.opacity = String(op)
  })
}

export default function Scene({ content, caps }: { content: Content; caps: Cap[] }) {
  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const rm = useReducedMotion()
  const tier = useTier()

  useGSAP(() => {
    const cv = canvas.current, el = root.current
    if (!cv || !el) return
    const c = cv.getContext('2d')
    if (!c) return
    const wrap = document.getElementById('wc-wrap')
    const intro = document.getElementById('wc-intro')
    const hint = document.getElementById('wc-hint')
    const capEls = Array.from(el.querySelectorAll<HTMLElement>('[data-cap]'))
    const letters = capEls.map((ce) => Array.from(ce.querySelectorAll<HTMLElement>('[data-ch]')))
    const door = el.querySelector<HTMLElement>('[data-door]')
    const counter = el.querySelector<HTMLElement>('[data-count]')
    const cs = getComputedStyle(el)
    const fd = (cs.getPropertyValue('--wc-display').trim() || 'sans-serif') + ', sans-serif'
    const fs = (cs.getPropertyValue('--wc-sans').trim() || 'sans-serif') + ', sans-serif'
    const pats = makePatterns()
    const posters: Poster[] = content.films.map((f) => ({ img: null, title: f.title, rating: f.rating, date: f.date }))
    const env: Env = { wide: true, B: 1, t: 0, z: Z0, posters, dishes: content.dishes, notes: content.notes, posts: content.posts, brick: pats.brick, cloth: pats.cloth, fd, fs }
    const streaks = makeStreaks()
    let w = 1, h = 1, dpr = 1
    let z = Z0, target = Z0, prog = 0, vel = 0, visible = true, shown = 0

    const draw = (zz: number, alpha = 1) => { c.globalAlpha = alpha; renderZoom(c, env, w, h, dpr, zz); c.globalAlpha = 1 }
    const redraw = () => { if (rm) draw(Z_STATIC) }
    const size = () => {
      w = el.clientWidth || 1; h = el.clientHeight || 1
      dpr = Math.min(window.devicePixelRatio || 1, tier === 'light' ? 1.5 : 2)
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr)
      env.wide = w / h > 1.15; env.B = Math.max(w, h) / 1000
      redraw()
    }
    content.films.forEach((f, i) => { const im = new Image(); im.onload = () => { posters[i].img = im; redraw() }; im.src = f.posterUrl })
    size()
    const ro = new ResizeObserver(size); ro.observe(el)
    if (document.fonts) document.fonts.ready.then(redraw)

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
        drawStreaks(c, streaks, w, h, dpr, tier === 'light' ? 0 : Math.min(1, Math.max(0, (av - 0.25) * 0.55)))
        capEls.forEach((ce, i) => {
          const dz = z - i
          const inP = smoothstep(-0.25, 0.2, dz)
          const wgt = smoothstep(-0.25, -0.02, dz) * (1 - smoothstep(0.55, 0.78, dz))
          ce.style.opacity = String(wgt)
          ce.style.transform = `translateY(${(1 - wgt) * 14}px)`
          if (wgt > 0.001) kinetic(letters[i], i, inP)
        })
        if (door) {
          const dp = smoothstep(5.08, 5.4, z)
          door.style.opacity = String(dp); door.style.transform = `translateY(${(1 - dp) * 24}px) scale(${0.96 + 0.04 * dp})`; door.style.pointerEvents = dp > 0.6 ? 'auto' : 'none'
        }
        const deeper = Math.floor(z / N)
        if (counter && deeper !== shown) {
          shown = deeper; counter.textContent = String(deeper)
          gsap.fromTo(counter, { scale: 2.2, y: -6, color: '#fff' }, { scale: 1, y: 0, color: '#F3C969', duration: 0.7, ease: 'back.out(3)', overwrite: true })
        }
      }
      if (intro) intro.style.opacity = String(1 - smoothstep(0, 0.04, prog))
      if (hint) hint.style.opacity = String(1 - smoothstep(0, 0.03, prog))
    }
    gsap.ticker.add(tick)
    return () => { gsap.ticker.remove(tick); st.kill(); io.disconnect(); ro.disconnect() }
  }, { scope: root, dependencies: [rm, tier, content] })

  return (
    <div ref={root} className="wc-scene">
      <canvas ref={canvas} className="wc-canvas" role="img" aria-label="An endless zoom: a street, a lit window, a room, a laid table, a plate, a film frame, and the same street again at night." />
      {!rm && (
        <>
          <div className="wc-caps" aria-hidden>
            {caps.map((cp, i) => (
              <div key={i} data-cap className="wc-cap" style={{ opacity: i === 0 ? 1 : 0 }}>
                <p className="wc-cap-h">{Array.from(cp.h).map((ch, k) => <span key={k} data-ch>{ch}</span>)}</p>
                <p className="wc-cap-p">{cp.p}</p>
              </div>
            ))}
          </div>
          <p className="wc-count" aria-live="off">deeper: <b data-count>0</b></p>
          <div data-door className="wc-door">
            <h2>Leave a note at the door</h2>
            <p>The light is on and the door is ajar. Say hello in the guestbook.</p>
            <a href="/#guest-note">Open the guestbook</a>
          </div>
        </>
      )}
    </div>
  )
}
