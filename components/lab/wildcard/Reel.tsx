'use client'
import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useReducedMotion, useTier } from '@/components/lab/kit/hooks'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export type Frame = { title: string; posterUrl: string; rating: number; date: string; excerpt: string }

const K = 2.4
const TAU = Math.PI * 2
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

type Env = { wide: boolean; B: number; z: number; imgs: (HTMLImageElement | null)[]; frames: Frame[]; fd: string; fs: string }
type Ctx = CanvasRenderingContext2D

function level(c: Ctx, e: Env, idx: number, S: number, depth: number) {
  const n = e.frames.length
  const i = ((idx % n) + n) % n
  const W = e.wide ? 340 : 380, H = W * 1.5
  c.save()
  const g = c.createLinearGradient(0, -700, 0, 700); g.addColorStop(0, '#3a1428'); g.addColorStop(0.5, '#2A1E1A'); g.addColorStop(1, '#3a1428')
  c.fillStyle = g; c.fillRect(-4000, -4000, 8000, 8000)
  // the film strip: a dark band with sprocket holes running up the sides, frame lines between frames
  const bw = W / 2 + 96
  c.fillStyle = '#150e10'; c.fillRect(-bw, -4000, bw * 2, 8000)
  c.fillStyle = '#dccfb4'
  const hs = 46, oy = (e.z * 520) % hs
  for (const sx of [-1, 1]) for (let y = -1400 - oy; y < 1400; y += hs) { c.beginPath(); c.roundRect(sx * (W / 2 + 50) - 10, y, 20, 28, 5); c.fill() }
  c.fillStyle = 'rgba(243,201,105,.5)'; c.fillRect(-bw, -H / 2 - 40, bw * 2, 3); c.fillRect(-bw, H / 2 + 38, bw * 2, 3)
  c.fillStyle = '#F3C969'; c.font = `700 22px ${e.fs}`; c.textAlign = 'left'; c.fillText(String(i + 1).padStart(2, '0') + ' ▸', -bw + 6, -H / 2 - 12)
  // poster
  c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(-W / 2 + 6, -H / 2 + 10, W + 14, H + 14)
  c.fillStyle = '#F3C969'; c.fillRect(-W / 2 - 9, -H / 2 - 9, W + 18, H + 18)
  const im = e.imgs[i]
  if (im && im.complete && im.naturalWidth) c.drawImage(im, -W / 2, -H / 2, W, H)
  else {
    const gg = c.createLinearGradient(0, -H / 2, 0, H / 2); gg.addColorStop(0, '#B5533C'); gg.addColorStop(1, '#6E2340'); c.fillStyle = gg; c.fillRect(-W / 2, -H / 2, W, H)
    c.fillStyle = '#F4EBDD'; c.font = `800 44px ${e.fd}`; c.textAlign = 'center'; c.fillText(e.frames[i].title.slice(0, 16), 0, 0); c.textAlign = 'left'
  }
  // the next frame sits in the middle of this poster
  const u = Math.log(S) / Math.log(K), ex = smooth(0.7, 1, u)
  if (depth < 4 && S * e.B * W / K > 5) {
    c.save()
    const f = 1 + 9 * ex
    c.beginPath(); c.rect(-(W / 2 / K) * f, -(H / 2 / K) * f, (W / K) * f, (H / K) * f); c.clip()
    c.scale(1 / K, 1 / K)
    level(c, e, idx + 1, S / K, depth + 1)
    c.restore()
    c.save(); c.globalAlpha = 1 - ex; c.strokeStyle = '#F3C969'; c.lineWidth = 5 / K * 1.4
    c.strokeRect(-W / 2 / K, -H / 2 / K, W / K, H / K); c.restore()
  }
  c.restore()
}

export default function Reel({ frames }: { frames: Frame[] }) {
  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const rm = useReducedMotion()
  const tier = useTier()

  useGSAP(() => {
    const cv = canvas.current, el = root.current
    if (!cv || !el || !frames.length) return
    const c = cv.getContext('2d')
    if (!c) return
    const wrap = document.getElementById('rl-wrap')
    const intro = document.getElementById('rl-intro')
    const card = el.querySelector<HTMLElement>('[data-card]')
    const parts = card ? { h: card.querySelector<HTMLElement>('h2')!, m: card.querySelector<HTMLElement>('.rl-meta')!, x: card.querySelector<HTMLElement>('.rl-ex')! } : null
    const cs = getComputedStyle(el)
    const fd = (cs.getPropertyValue('--wc-display').trim() || 'sans-serif') + ', sans-serif'
    const fs = (cs.getPropertyValue('--wc-sans').trim() || 'sans-serif') + ', sans-serif'
    const env: Env = { wide: true, B: 1, z: 0, imgs: frames.map(() => null), frames, fd, fs }
    const n = frames.length
    const zmax = Math.max(n - 1, 0.01)
    let w = 1, h = 1, dpr = 1, z = 0, target = 0, prog = 0, visible = true, cur = -1
    const draw = (zz: number) => {
      const idx = Math.floor(zz), f = zz - idx
      c.setTransform(dpr, 0, 0, dpr, 0, 0)
      c.save(); c.translate(w / 2, h / 2)
      const S0 = Math.pow(K, f); c.scale(env.B * S0, env.B * S0); env.z = zz
      level(c, env, idx, S0, 0)
      c.restore()
    }
    const size = () => {
      w = el.clientWidth || 1; h = el.clientHeight || 1
      dpr = Math.min(window.devicePixelRatio || 1, tier === 'light' ? 1.5 : 2)
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr)
      env.wide = w / h > 1.15; env.B = Math.max(w, h) / 1000
      if (rm) draw(0.35)
    }
    frames.forEach((f, i) => { const im = new Image(); im.onload = () => { env.imgs[i] = im; if (rm) draw(0.35) }; im.src = f.posterUrl })
    size()
    const ro = new ResizeObserver(size); ro.observe(el)
    if (document.fonts) document.fonts.ready.then(() => { if (rm) draw(0.35) })
    if (rm) return () => ro.disconnect()

    const setCard = (i: number) => {
      if (!parts) return
      const f = frames[((i % n) + n) % n]
      parts.h.textContent = f.title; parts.m.textContent = `${f.rating} of 5, watched ${f.date}. Frame ${((i % n) + n) % n + 1} of ${n}`; parts.x.textContent = f.excerpt
      gsap.fromTo(card, { scale: 1.07, rotate: -1.2, y: 10 }, { scale: 1, rotate: 0, y: 0, duration: 0.55, ease: 'back.out(2.2)', overwrite: true })
      gsap.fromTo(parts.h, { letterSpacing: '0.06em', opacity: 0.2 }, { letterSpacing: '-0.015em', opacity: 1, duration: 0.5, ease: 'power3.out', overwrite: true })
    }
    const st = ScrollTrigger.create({ trigger: wrap, start: 'top top', end: 'bottom bottom', onUpdate: (self) => { prog = self.progress; target = zmax * prog } })
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting }, { rootMargin: '100px' }); io.observe(el)
    const tick = (_t: number, delta: number) => {
      const dt = Math.min(0.05, delta / 1000)
      if (visible) {
        z += (target - z) * (1 - Math.exp(-dt * 7))
        draw(z)
        const idx = Math.floor(z + 0.35)
        if (idx !== cur) { cur = idx; setCard(idx) }
        if (card) card.style.opacity = String(smooth(0.01, 0.06, prog) * (1 - smooth(0.97, 1, prog)))
      }
      if (intro) intro.style.opacity = String(1 - smooth(0, 0.04, prog))
    }
    gsap.ticker.add(tick)
    return () => { gsap.ticker.remove(tick); st.kill(); io.disconnect(); ro.disconnect() }
  }, { scope: root, dependencies: [rm, tier, frames] })

  return (
    <div ref={root} className="wc-scene">
      <canvas ref={canvas} className="wc-canvas" role="img" aria-label="A vertical film strip: each poster holds the next film's frame, and you fall into them as you scroll." />
      {!rm && (
        <div data-card className="rl-frame" style={{ opacity: 0 }}>
          <h2 />
          <p className="rl-meta" />
          <p className="rl-ex" />
        </div>
      )}
    </div>
  )
}
