'use client'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useReducedMotion } from '@/components/lab/kit/hooks'
import { useLenis } from '@/components/lab/kit/SmoothScroll'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export type ShelfMovie = { id: string; title: string; rating: number; watchDate: string; excerpt: string; src: string; thumb: string }

const DISPLAY = { fontFamily: 'var(--font-display), Impact, sans-serif' }
const FALLBACK = '#6B1A2B'
const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })

/** Dominant colour: saturation-weighted average of a small canvas sample, pulled down to a deep flood tone. */
function dominant(img: HTMLImageElement): string {
  try {
    const w = 24, h = 36
    const c = document.createElement('canvas'); c.width = w; c.height = h
    const ctx = c.getContext('2d', { willReadFrequently: true })
    if (!ctx) return FALLBACK
    ctx.drawImage(img, 0, 0, w, h)
    const d = ctx.getImageData(0, 0, w, h).data
    let r = 0, g = 0, b = 0, wt = 0
    for (let i = 0; i < d.length; i += 4) {
      const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2])
      const sat = mx === 0 ? 0 : (mx - mn) / mx
      const k = 0.05 + sat * sat * (mx / 255)
      r += d[i] * k; g += d[i + 1] * k; b += d[i + 2] * k; wt += k
    }
    if (!wt) return FALLBACK
    r /= wt * 255; g /= wt * 255; b /= wt * 255
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b)
    let hue = 0
    const dl = mx - mn
    if (dl > 0.001) {
      if (mx === r) hue = ((g - b) / dl) % 6
      else if (mx === g) hue = (b - r) / dl + 2
      else hue = (r - g) / dl + 4
      hue *= 60; if (hue < 0) hue += 360
    }
    const sat = Math.min(0.75, Math.max(0.5, mx === 0 ? 0 : dl / mx))
    return `hsl(${Math.round(hue)} ${Math.round(sat * 100)}% 27%)`
  } catch { return FALLBACK }
}

type Active = { id: string; rect: { left: number; top: number; width: number; height: number } }

export default function Shelf({ movies }: { movies: ShelfMovie[] }) {
  const reduced = useReducedMotion()
  const lenis = useLenis()
  const [active, setActive] = useState<Active | null>(null)
  const [colors, setColors] = useState<Record<string, string>>({})
  const wrap = useRef<HTMLElement>(null)
  const tilt = useRef<HTMLDivElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)
  const busy = useRef(false)
  const openRes = useRef<(() => void) | null>(null)
  const closeRes = useRef<(() => void) | null>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const lenisRef = useRef(lenis); lenisRef.current = lenis

  // sample dominant colours up front so opening is instant
  useEffect(() => {
    let dead = false
    movies.forEach((m) => {
      const im = new Image()
      im.onload = () => { if (!dead) setColors((c) => ({ ...c, [m.id]: dominant(im) })) }
      im.src = m.thumb
    })
    return () => { dead = true }
  }, [movies])

  // parallax tilt (pointer) + scroll parallax (per card depth)
  useGSAP(() => {
    if (reduced) return
    const mm = gsap.matchMedia()
    mm.add('(pointer: fine)', () => {
      const rx = gsap.quickTo(tilt.current, 'rotationX', { duration: 0.9, ease: 'power3.out' })
      const ry = gsap.quickTo(tilt.current, 'rotationY', { duration: 0.9, ease: 'power3.out' })
      const mv = (e: PointerEvent) => {
        if (busy.current) return
        rx(((e.clientY / innerHeight) - 0.5) * -7); ry(((e.clientX / innerWidth) - 0.5) * 9)
      }
      window.addEventListener('pointermove', mv)
      return () => window.removeEventListener('pointermove', mv)
    })
    const depth = [-70, 40, -30, 80]
    gsap.utils.toArray<HTMLElement>('.p2p-par').forEach((el, i) => {
      gsap.fromTo(el, { y: -depth[i % 4] * 0.5 }, { y: depth[i % 4] * 0.5, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } })
    })
    // tilt leans with scroll speed
    const lean = gsap.quickTo('.p2p-lean', 'rotationX', { duration: 0.6, ease: 'power3.out' })
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => { lean(gsap.utils.clamp(-9, 9, s.getVelocity() / -260)) } })
    return () => mm.revert()
  }, { scope: wrap, dependencies: [reduced] })

  const open = useCallback((id: string): Promise<void> => {
    if (busy.current) return Promise.resolve()
    const el = document.querySelector<HTMLElement>(`[data-p2p-card="${id}"] img`)
    if (!el) return Promise.resolve()
    const r = el.getBoundingClientRect()
    busy.current = true
    lenisRef.current?.stop()
    if (!lenisRef.current) document.body.style.overflow = 'hidden'
    setActive({ id, rect: { left: r.left, top: r.top, width: r.width, height: r.height } })
    return new Promise((res) => { openRes.current = res })
  }, [])

  const close = useCallback((): Promise<void> => {
    if (!tl.current) return Promise.resolve()
    if (closeRes.current) return Promise.resolve()
    return new Promise((res) => { closeRes.current = res; tl.current?.timeScale(1.15).reverse() })
  }, [])

  const finishClose = useCallback((id: string) => {
    gsap.set('[data-p2p-card]', { clearProps: 'all' })
    gsap.set(`[data-p2p-card="${id}"]`, { clearProps: 'all' })
    tl.current?.kill(); tl.current = null
    lenisRef.current?.start(); document.body.style.overflow = ''
    busy.current = false
    setActive(null)
    closeRes.current?.(); closeRes.current = null; openRes.current = null
  }, [])

  // build the open timeline once the overlay is in the DOM
  useLayoutEffect(() => {
    if (!active || !root.current) return
    const o = root.current
    const q = (s: string) => o.querySelector<HTMLElement>(s)!
    const hero = q('.p2p-hero'), lift = q('.p2p-lift'), bg = q('.p2p-bg'), txt = o.querySelectorAll('.p2p-txt > *'), x = q('.p2p-x')
    const others = gsap.utils.toArray<HTMLElement>('[data-p2p-card]').filter((c) => c.dataset.p2pCard !== active.id)
    const mine = document.querySelector<HTMLElement>(`[data-p2p-card="${active.id}"]`)!
    const t = gsap.timeline({ onComplete: () => { openRes.current?.(); openRes.current = null; closeBtn.current?.focus({ preventScroll: true }) }, onReverseComplete: () => finishClose(active.id) })
    tl.current = t
    if (reduced) {
      gsap.set(hero, { clearProps: 'all' })
      t.fromTo(o, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'none' })
      t.fromTo(txt, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.15)
      return () => { t.kill() }
    }
    gsap.set(hero, { clearProps: 'transform' })
    const f = hero.getBoundingClientRect(), c = active.rect
    const cx = c.left + c.width / 2, cy = c.top + c.height / 2
    gsap.set(hero, { transformOrigin: '0 0', x: c.left - f.left, y: c.top - f.top, scaleX: c.width / f.width, scaleY: c.height / f.height })
    gsap.set(mine, { autoAlpha: 0 })
    gsap.set(bg, { clipPath: `circle(0px at ${cx}px ${cy}px)` })
    gsap.set(txt, { autoAlpha: 0, y: 36 })
    gsap.set(x, { autoAlpha: 0 })
    const reach = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy)) + 40
    // 1 lift
    t.to(lift, { scale: 1.1, rotation: -2, boxShadow: '0 40px 70px -10px rgba(0,0,0,.65), 0 0 0 2px rgba(216,168,78,.5)', duration: 0.32, ease: 'power2.out' }, 0)
    // 2 others fall away
    others.forEach((el) => {
      const r = el.getBoundingClientRect(); const d = Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy)
      t.to(el, { y: innerHeight * 0.55 + (d % 90), rotation: (d % 2 > 1 ? 1 : -1) * (6 + (d % 7)), scale: 0.82, autoAlpha: 0, duration: 0.7, ease: 'power3.in' }, 0.18 + Math.min(0.5, d / 2400))
    })
    // 3 colour flood from the card
    t.to(bg, { clipPath: `circle(${reach}px at ${cx}px ${cy}px)`, duration: 1.0, ease: 'power2.inOut' }, 0.22)
    // 4 fly + grow into the hero
    t.to(hero, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.95, ease: 'expo.inOut' }, 0.3)
    t.to(lift, { scale: 1, rotation: 0, boxShadow: '0 30px 80px -12px rgba(0,0,0,.6), 0 0 0 1px rgba(216,168,78,.35)', duration: 0.7, ease: 'power3.inOut' }, 0.55)
    // 5 text
    t.to(txt, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.09, ease: 'power3.out' }, 1.0)
    t.to(x, { autoAlpha: 1, duration: 0.3 }, 1.2)
    return () => { t.kill() }
  }, [active, reduced, finishClose])

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') void close() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [close])

  // recorder demo
  useEffect(() => {
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
    window.__labDemo = async () => {
      const ids = movies.map((m) => m.id)
      for (const id of [ids[1], ids[ids.length > 2 ? 2 : 0]]) {
        if (!id) continue
        await open(id); await wait(1500); await close(); await wait(350)
      }
    }
    return () => { delete window.__labDemo }
  }, [movies, open, close])

  const cur = active ? movies.find((m) => m.id === active.id) : null
  const flood = (cur && colors[cur.id]) || FALLBACK

  return (
    <section ref={wrap} className="relative px-4 pb-24 pt-2 md:px-10" aria-label="Poster shelf">
      <div style={{ perspective: '1500px' }}>
        <div className="p2p-lean" style={{ transformStyle: 'preserve-3d' }}>
          <div ref={tilt} style={{ transformStyle: 'preserve-3d' }}>
            <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-8 md:gap-y-14">
              {movies.map((m, i) => (
                <li key={m.id} data-p2p-card={m.id} className={i % 2 ? 'mt-8 md:mt-0' : ''}>
                  <div className="p2p-par">
                    <button
                      type="button"
                      onClick={() => void open(m.id)}
                      aria-label={`Open ${m.title}`}
                      className="group block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D8A84E]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.src} alt="" width={640} height={960} loading={i < 8 ? 'eager' : 'lazy'} className="aspect-[2/3] w-full rounded-[3px] object-cover transition-transform duration-300 group-hover:-translate-y-1.5" style={{ boxShadow: '0 18px 40px -14px rgba(0,0,0,.7), 0 0 0 1px rgba(216,168,78,.18)' }} />
                      <span className="mt-3 block text-lg font-extrabold leading-tight" style={DISPLAY}>{m.title}</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {active && cur && (
        <div ref={root} role="dialog" aria-modal="true" aria-label={cur.title} className="fixed inset-0 z-[90] overflow-hidden text-[#FFF3D6]">
          <div className="p2p-bg absolute inset-0" style={{ background: `radial-gradient(ellipse 70% 60% at 30% 40%, color-mix(in srgb, ${flood} 100%, white 12%), ${flood} 55%, color-mix(in srgb, ${flood} 70%, #2B0B14) 100%)` }} />
          <div className="relative flex h-full flex-col items-center justify-center gap-6 px-6 md:flex-row md:gap-16">
            <div className="p2p-hero aspect-[2/3] h-[38dvh] shrink-0 md:h-[68dvh]" style={{ willChange: 'transform' }}>
              <div className="p2p-lift h-full w-full" style={{ boxShadow: '0 20px 40px -14px rgba(0,0,0,.7), 0 0 0 1px rgba(216,168,78,.18)', borderRadius: 3 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cur.src} alt={`Poster for ${cur.title}`} className="h-full w-full rounded-[3px] object-cover" />
              </div>
            </div>
            <div className="p2p-txt max-w-md text-center md:text-left">
              <h2 className="text-[clamp(2.4rem,6vw,5rem)] font-black leading-[0.92]" style={DISPLAY}>{cur.title}</h2>
              <p className="mt-3 text-xl" style={{ color: '#D8A84E' }}><span aria-hidden>{'★'.repeat(Math.max(0, Math.min(5, Math.round(cur.rating))))}</span> <span className="text-[#FFF3D6]">{cur.rating} / 5</span></p>
              <p className="mt-1 text-sm opacity-90">Watched {fmt(cur.watchDate)}</p>
              <p className="mt-4 text-base leading-relaxed opacity-95 md:text-lg">{cur.excerpt}</p>
              <button ref={closeBtn} type="button" onClick={() => void close()} className="p2p-x mt-6 rounded-full border-2 px-6 py-2 text-base font-semibold transition hover:bg-[#FFF3D6] hover:text-[#2B0B14] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFF3D6]" style={{ borderColor: '#D8A84E' }}>
                Back to the shelf
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
