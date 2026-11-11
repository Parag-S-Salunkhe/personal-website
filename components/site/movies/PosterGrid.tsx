'use client'
// The list under the wall: a torch follows the pointer over the posters (outside the light they dim to
// about 45%, never hidden) and each poster tilts toward the pointer on a spring. Touch and reduced motion: all lit, no tilt.
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import type { Movie } from '@/lib/content'
import { fmtDate } from '@/lib/format'
import PosterFrame from '@/components/site/PosterFrame'
import Rating from '@/components/site/Rating'
import { useReducedMotion } from '@/components/site/hooks'

type Spring = { rx: number; ry: number; vx: number; vy: number; z: number; lit: number }
const LIGHT = 300

export default function PosterGrid({ movies }: { movies: Movie[] }) {
  const reduced = useReducedMotion()
  const gridRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const grid = gridRef.current!
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const faces = Array.from(grid.querySelectorAll<HTMLElement>('[data-face]'))
    const glares = faces.map((f) => f.querySelector<HTMLElement>('[data-glare]'))
    const sp: Spring[] = faces.map(() => ({ rx: 0, ry: 0, vx: 0, vy: 0, z: 0, lit: 1 }))
    const apply = (i: number) => {
      const s = sp[i]
      faces[i].style.transform = `translateZ(${s.z.toFixed(1)}px) rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg)`
      faces[i].style.filter = `brightness(${(0.45 + 0.55 * s.lit).toFixed(3)})`
    }
    if (reduced || !fine) {
      faces.forEach((f, i) => { sp[i].lit = 1; apply(i); f.style.filter = 'none'; f.style.transform = 'none' })
      return
    }

    const ptr = { x: 0, y: 0, inside: false }
    let focused = -1
    let raf = 0
    let last = 0
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now
      let busy = ptr.inside
      faces.forEach((f, i) => {
        const s = sp[i]
        const r = f.firstElementChild!.getBoundingClientRect()
        let tl = 1, trx = 0, try_ = 0, tz = 0
        const isFocus = i === focused
        if (isFocus) { tl = 1; tz = 22 }
        else if (ptr.inside) {
          const cx = r.left + r.width / 2, cy = r.top + r.height / 2
          const d = Math.hypot(ptr.x - cx, ptr.y - cy)
          tl = Math.max(0, 1 - Math.max(0, d - r.width * 0.3) / LIGHT)
          tl = tl * tl * (3 - 2 * tl)
          const px = (ptr.x - r.left) / r.width, py = (ptr.y - r.top) / r.height
          if (px >= 0 && px <= 1 && py >= 0 && py <= 1) { try_ = (px - 0.5) * 18; trx = -(py - 0.5) * 18; tz = 26 }
          const g = glares[i]
          if (g) { g.style.setProperty('--gx', (px * 100).toFixed(1) + '%'); g.style.setProperty('--gy', (py * 100).toFixed(1) + '%'); g.style.opacity = tz ? '1' : '0' }
        }
        if (isFocus) { const g = glares[i]; if (g) g.style.opacity = '0' }
        const K = 170, D = 11
        s.vx += ((trx - s.rx) * K - s.vx * D) * dt; s.rx += s.vx * dt
        s.vy += ((try_ - s.ry) * K - s.vy * D) * dt; s.ry += s.vy * dt
        s.z += (tz - s.z) * Math.min(1, dt * 10)
        s.lit += (tl - s.lit) * Math.min(1, dt * 9)
        if (Math.abs(s.vx) + Math.abs(s.vy) > 0.02 || Math.abs(trx - s.rx) > 0.05 || Math.abs(try_ - s.ry) > 0.05 || Math.abs(tl - s.lit) > 0.01 || Math.abs(tz - s.z) > 0.2) busy = true
        apply(i)
      })
      raf = busy ? requestAnimationFrame(frame) : 0
      if (!busy) last = 0
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame) }
    const onMove = (e: PointerEvent) => { if (e.pointerType === 'touch') return; ptr.x = e.clientX; ptr.y = e.clientY; ptr.inside = true; kick() }
    const onLeave = () => { ptr.inside = false; kick() }
    const onScroll = () => { if (ptr.inside) kick() }
    const onFocusIn = (e: FocusEvent) => { focused = faces.findIndex((f) => f.parentElement!.contains(e.target as Node)); kick() }
    const onFocusOut = () => { focused = -1; kick() }
    grid.addEventListener('pointermove', onMove)
    grid.addEventListener('pointerleave', onLeave)
    grid.addEventListener('focusin', onFocusIn)
    grid.addEventListener('focusout', onFocusOut)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      grid.removeEventListener('pointermove', onMove); grid.removeEventListener('pointerleave', onLeave)
      grid.removeEventListener('focusin', onFocusIn); grid.removeEventListener('focusout', onFocusOut)
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [reduced, movies])

  return (
    <ul ref={gridRef} className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-4">
      {movies.map((m, i) => (
        <li key={m.id} className="[perspective:800px]">
          <article className="group relative">
            <div data-face className="relative will-change-transform [transform-style:preserve-3d] motion-reduce:!transform-none motion-reduce:![filter:none]">
              <PosterFrame
                src={m.posterUrl}
                title={m.title}
                priority={i < 2}
                sizes="(min-width: 1024px) 270px, (min-width: 640px) 30vw, 45vw"
                className="shadow-[0_14px_30px_rgb(0_0_0/0.55)] ring-1 ring-[var(--brass)]/30"
              />
              <div data-glare aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[3px] opacity-0" style={{ background: 'radial-gradient(circle at var(--gx,50%) var(--gy,50%), rgba(255,246,222,.55) 0%, rgba(255,214,150,.15) 35%, rgba(255,214,150,0) 65%)', mixBlendMode: 'soft-light' }} />
            </div>
            <h2 className="ev-title mt-4 text-[var(--wax)] [overflow-wrap:anywhere]">
              <Link href={`/movies/${m.slug}`} className="rounded-[3px] after:absolute after:inset-0 after:content-[''] group-hover:underline group-hover:decoration-[var(--candle)] group-hover:underline-offset-4 focus-visible:underline">
                {m.title}
              </Link>
            </h2>
            <div className="mt-2 text-[var(--wax)]"><Rating n={m.rating} size="sm" /></div>
            <p className="ev-meta mt-1 text-[var(--sage)]">
              {m.type === 'SERIES' ? 'Series' : 'Film'}, watched {fmtDate(m.watchDate)}
            </p>
          </article>
        </li>
      ))}
    </ul>
  )
}
