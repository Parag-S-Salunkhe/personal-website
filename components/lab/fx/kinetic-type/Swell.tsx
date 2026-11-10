'use client'
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/components/lab/kit/hooks'
import s from './kinetic.module.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const ROWS = [{ word: 'Matinee', dir: 1 }, { word: 'Midnight', dir: -1 }]

// A bold wave travels through the letters: wght 100 -> 900 and opsz 10 -> 72 where the wave is, thin elsewhere.
function apply(root: HTMLElement, p: number) {
  const rows = root.querySelectorAll<HTMLElement>('[data-row]')
  let mid = 0
  rows.forEach((row, r) => {
    const letters = row.querySelectorAll<HTMLElement>('span')
    const n = letters.length
    const dir = ROWS[r].dir
    const c = dir === 1 ? p * (n + 4) - 2 : (n - 1) - (p * (n + 4) - 2)
    letters.forEach((el, i) => {
      const k = Math.exp(-(((i - c) / 1.5) ** 2))
      const w = Math.round(100 + 800 * k)
      const o = Math.round(10 + 62 * k)
      el.style.fontVariationSettings = `'wght' ${w}, 'opsz' ${o}`
      el.style.letterSpacing = `${(-0.03 * k).toFixed(3)}em`
      if (r === 0 && i === Math.min(n - 1, Math.max(0, Math.round(c)))) mid = w
    })
  })
  const ro = root.querySelector('[data-readout]')
  if (ro) ro.textContent = `wght ${String(mid).padStart(3, ' ')} / 900`
}

export default function Swell() {
  const root = useRef<HTMLDivElement>(null)
  const rm = useReducedMotion()

  useGSAP(() => {
    const el = root.current!
    if (rm) { apply(el, 0.5); return }
    apply(el, 0)
    ScrollTrigger.create({ trigger: el, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: (self) => apply(el, self.progress) })
  }, { scope: root, dependencies: [rm] })

  return (
    <div ref={root} className={s.swellWrap} style={rm ? { height: 'auto' } : undefined}>
      <div className={s.swellStage} style={rm ? { position: 'relative', minHeight: '100dvh' } : undefined} aria-hidden>
        {ROWS.map((r, i) => (
          <div key={r.word} data-row className={`${s.swellRow} ${s.display} ${i ? s.swellRowB : ''}`}>
            {r.word.split('').map((ch, j) => <span key={j}>{ch}</span>)}
          </div>
        ))}
        <div data-readout className={s.readout} />
      </div>
    </div>
  )
}
