'use client'
import { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/components/lab/kit/hooks'
import s from './flap.module.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export type BoardRow = { title: string; rating: number; date: string }

const LETTERS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ'&.:-!?,/…"
const DIGITS = '0123456789'
const STEP = 0.07

const clean = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9 '&.:\-!?,/…]/g, ' ')
const fit = (t: string, n: number) => { const c = clean(t).trim().replace(/\s+/g, ' '); return (c.length > n ? c.slice(0, n - 1).trimEnd() + '…' : c).padEnd(n, ' ') }

type Flap = { target: string; seq: string[]; delay: number; top: HTMLElement; bot: HTMLElement; fTop: HTMLElement; fBot: HTMLElement; sTop: HTMLElement; sBot: HTMLElement; ft: HTMLElement; fb: HTMLElement; last: number }

function seqFor(target: string, n: number): string[] {
  const pool = DIGITS.includes(target) ? DIGITS : LETTERS.slice(1)
  const idx = pool.indexOf(target)
  return Array.from({ length: n }, (_, k) => pool[(((idx - (n - 1 - k)) % pool.length) + pool.length) % pool.length])
}

export default function FlapBoard({ rows }: { rows: BoardRow[] }) {
  const root = useRef<HTMLDivElement>(null)
  const rm = useReducedMotion()
  const [compact, setCompact] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const f = () => setCompact(mq.matches)
    f(); mq.addEventListener('change', f)
    return () => mq.removeEventListener('change', f)
  }, [])

  useGSAP(() => {
    const host = root.current!.querySelector<HTMLElement>('[data-board]')!
    host.textContent = ''
    const T = compact ? 10 : 20
    const maxR = Math.max(...rows.map((r) => r.rating.toFixed(1).length))
    const D = compact ? 5 : 8
    const cols = T + 1 + maxR + 1 + D
    host.style.setProperty('--cols', String(cols))

    const flaps: Flap[] = []
    const mk = (cls: string, digit: boolean) => {
      const h = document.createElement('div'); h.className = `${s.h} ${cls}`
      const sp = document.createElement('span'); const sh = document.createElement('i')
      h.append(sp, sh); return { h, sp, sh }
    }
    const addFlap = (parent: HTMLElement, ch: string, row: number, col: number, digit: boolean) => {
      const el = document.createElement('div'); el.className = `${s.flap} ${digit ? s.digit : ''}`
      const a = mk(s.top, digit), b = mk(s.bot, digit), c = mk(`${s.top} ${s.fTop}`, digit), d = mk(`${s.bot} ${s.fBot}`, digit)
      el.append(a.h, b.h, c.h, d.h); parent.append(el)
      const n = ch === ' ' ? 0 : 4 + ((col * 3 + row * 5) % 6) + (digit ? 0 : 2)
      flaps.push({ target: ch, seq: seqFor(ch, n), delay: row * 0.13 + col * 0.022, top: a.h, bot: b.h, fTop: c.h, fBot: d.h, sTop: a.sp, sBot: b.sp, ft: c.sp, fb: d.sp, last: -2 })
      ;[a, b, c, d].forEach((x) => { x.sp.textContent = ' ' })
      ;(el as HTMLElement & { _sh?: HTMLElement[] })._sh = [a.sh, b.sh, c.sh, d.sh]
    }
    const addGap = (parent: HTMLElement) => { const g = document.createElement('div'); g.className = s.gap; parent.append(g) }

    rows.forEach((r, ri) => {
      const row = document.createElement('div'); row.className = s.row
      fit(r.title, T).split('').forEach((ch, ci) => addFlap(row, ch, ri, ci, false)); addGap(row)
      r.rating.toFixed(1).padStart(maxR, ' ').split('').forEach((ch, ci) => addFlap(row, ch, ri, T + ci, true)); addGap(row)
      const dd = new Date(r.date)
      const p2 = (n: number) => String(n).padStart(2, '0')
      const ds = compact ? `${p2(dd.getUTCMonth() + 1)}.${p2(dd.getUTCFullYear() % 100)}` : `${p2(dd.getUTCDate())}.${p2(dd.getUTCMonth() + 1)}.${p2(dd.getUTCFullYear() % 100)}`
      ds.split('').forEach((ch, ci) => addFlap(row, ch, ri, T + maxR + ci, /\d/.test(ch)))
      host.append(row)
    })
    const flapEls = Array.from(host.querySelectorAll<HTMLElement>(`.${s.flap}`))

    const render = (t: number) => {
      flaps.forEach((f, i) => {
        const n = f.seq.length
        const local = (t - f.delay) / STEP
        const sh = (flapEls[i] as HTMLElement & { _sh: HTMLElement[] })._sh
        if (n === 0 || local >= n) {
          if (f.last === -1) return
          f.last = -1
          f.sTop.textContent = f.sBot.textContent = f.target
          f.fTop.style.visibility = 'hidden'; f.fBot.style.visibility = 'hidden'
          sh[0].style.opacity = sh[1].style.opacity = '0'
          return
        }
        if (local < 0) {
          if (f.last === -3) return
          f.last = -3
          f.sTop.textContent = f.sBot.textContent = ' '
          f.fTop.style.visibility = 'hidden'; f.fBot.style.visibility = 'hidden'
          return
        }
        const k = Math.floor(local), ph = local - k
        if (f.last !== k) {
          f.last = k
          const prev = k === 0 ? ' ' : f.seq[k - 1]
          f.sTop.textContent = f.seq[k]; f.sBot.textContent = prev
          f.ft.textContent = prev; f.fb.textContent = f.seq[k]
        }
        const first = ph < 0.5
        f.fTop.style.visibility = first ? 'visible' : 'hidden'
        f.fBot.style.visibility = first ? 'hidden' : 'visible'
        if (first) {
          const q = ph / 0.5
          f.fTop.style.transform = `rotateX(${-q * 90}deg)`
          sh[2].style.opacity = String(q * 0.7); sh[1].style.opacity = String(q * 0.55); sh[0].style.opacity = '0'
        } else {
          const q = (ph - 0.5) / 0.5
          f.fBot.style.transform = `rotateX(${90 - q * 90}deg)`
          sh[3].style.opacity = String((1 - q) * 0.7); sh[0].style.opacity = String((1 - q) * 0.45); sh[1].style.opacity = '0'
        }
      })
    }
    const total = Math.max(...flaps.map((f) => f.delay + f.seq.length * STEP)) + 0.1
    const st = { t: 0 }
    flaps.forEach((f) => { f.last = -2 })
    if (rm) { render(total + 1); return }
    render(0)
    const tl = gsap.timeline({ paused: true })
    tl.to(st, { t: total, duration: total, ease: 'none', onUpdate: () => render(st.t) })
    ScrollTrigger.create({
      trigger: root.current, start: 'top 98%', end: 'bottom 12%',
      onEnter: () => tl.restart(), onEnterBack: () => tl.restart(),
      onLeave: () => { tl.pause(0); st.t = 0; render(0) }, onLeaveBack: () => { tl.pause(0); st.t = 0; render(0) },
    })
    return () => { tl.kill() }
  }, { scope: root, dependencies: [compact, rm, rows] })

  return (
    <div ref={root} className={s.frame}>
      <div data-board className={s.board} aria-hidden />
    </div>
  )
}
