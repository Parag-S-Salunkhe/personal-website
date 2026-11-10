'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { clamp, evening, fmtTime, T0, T1, tokens } from './timeline'

gsap.registerPlugin(ScrollTrigger)

/** The pinned clock (SVG, hands driven by scroll) and the burning candle. mode 'home' follows [data-story],
 *  'inner' follows the entries in [data-timeline] (each has data-time). Also writes the palette tokens on [data-evening]. */
export default function Pinned({ mode }: { mode: 'home' | 'inner' }) {
  const hour = useRef<SVGLineElement>(null)
  const minute = useRef<SVGLineElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  const wax = useRef<SVGRectElement>(null)
  const flame = useRef<SVGGElement>(null)
  const ring = useRef<SVGCircleElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const lastStrike = useRef(false)

  useEffect(() => {
    const host = document.querySelector<HTMLElement>('[data-evening]')
    const off = evening.sub((T) => {
      const mins = T * 60
      hour.current?.setAttribute('transform', `rotate(${((mins / 60) % 12) * 30})`)
      minute.current?.setAttribute('transform', `rotate(${(mins % 60) * 6})`)
      if (label.current) label.current.textContent = fmtTime(T)
      const burn = 1 - 0.8 * clamp((T - T0) / (T1 - T0))
      const h = 74 * burn
      wax.current?.setAttribute('y', String(118 - h))
      wax.current?.setAttribute('height', String(h))
      flame.current?.setAttribute('transform', `translate(0 ${74 - h})`)
      if (host) { const tk = tokens(T); for (const k in tk) host.style.setProperty(k, tk[k]) }
      const striking = T >= 24.97
      if (striking !== lastStrike.current) { lastStrike.current = striking; root.current?.classList.toggle('dm-strike', striking) }
    })
    return off
  }, [])

  useEffect(() => {
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (mode === 'home') {
      if (rm) { evening.set(20); return }
      const w = document.querySelector<HTMLElement>('[data-story]')
      if (!w) return
      const st = ScrollTrigger.create({ trigger: w, start: 'top top', end: 'bottom bottom', onUpdate: (s) => evening.set(T0 + (T1 - T0) * s.progress) })
      evening.set(T0 + (T1 - T0) * st.progress)
      return () => st.kill()
    }
    const list = document.querySelector<HTMLElement>('[data-timeline]')
    if (!list) return
    const upd = () => {
      const els = Array.from(list.querySelectorAll<HTMLElement>('[data-time]'))
      if (!els.length) return
      const mid = window.innerHeight * 0.55
      const pts = els.map((e) => { const r = e.getBoundingClientRect(); return { y: r.top + Math.min(r.height / 2, 80), t: parseFloat(e.dataset.time || '19') } })
      let T = pts[0].t
      if (mid >= pts[pts.length - 1].y) T = pts[pts.length - 1].t
      else if (mid > pts[0].y) for (let i = 0; i < pts.length - 1; i++) if (mid >= pts[i].y && mid < pts[i + 1].y) { T = pts[i].t + (pts[i + 1].t - pts[i].t) * ((mid - pts[i].y) / (pts[i + 1].y - pts[i].y)); break }
      evening.set(T)
    }
    const st = ScrollTrigger.create({ trigger: list, start: 'top bottom', end: 'bottom top', onUpdate: upd, onRefresh: upd })
    upd()
    return () => st.kill()
  }, [mode])

  return (
    <div ref={root} className="dm-pinned" aria-hidden>
      <svg viewBox="0 0 120 120" className="dm-clock" role="img" aria-label="Clock">
        <circle cx="60" cy="60" r="56" fill="#0F1A2E" stroke="#F6B94F" strokeWidth="3" />
        <circle ref={ring} cx="60" cy="60" r="56" fill="none" stroke="#FFF3D6" strokeWidth="2" className="dm-ring" />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1="60" y1="9" x2="60" y2={i % 3 === 0 ? 18 : 14} stroke="#FFF3D6" strokeWidth={i % 3 === 0 ? 3 : 1.5} transform={`rotate(${i * 30} 60 60)`} />
        ))}
        <g transform="translate(60 60)">
          <line ref={hour} x1="0" y1="4" x2="0" y2="-28" stroke="#FFF3D6" strokeWidth="5" strokeLinecap="round" />
          <line ref={minute} x1="0" y1="8" x2="0" y2="-42" stroke="#F6B94F" strokeWidth="3" strokeLinecap="round" />
        </g>
        <circle cx="60" cy="60" r="4" fill="#F6B94F" />
      </svg>
      <span ref={label} className="dm-time">7:00 pm</span>
      <svg viewBox="0 0 60 150" className="dm-candle">
        <ellipse cx="30" cy="136" rx="22" ry="5" fill="#C79A4A" />
        <rect x="14" y="128" width="32" height="8" rx="2" fill="#C79A4A" />
        <rect ref={wax} x="20" y="44" width="20" height="74" rx="3" fill="#FFF8EA" />
        <path d="M20 118 q-3 -14 0 -28" stroke="#F1DDB8" strokeWidth="3" fill="none" />
        <g ref={flame}>
          <g className="dm-flame">
            <ellipse cx="30" cy="40" rx="9" ry="14" fill="#F6B94F" opacity=".35" />
            <path d="M30 22 C38 34 38 46 30 48 C22 46 22 34 30 22Z" fill="#F6B94F" />
            <path d="M30 32 C34 38 34 45 30 47 C26 45 26 38 30 32Z" fill="#FFF3D6" />
          </g>
        </g>
      </svg>
    </div>
  )
}
