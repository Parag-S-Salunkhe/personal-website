'use client'
import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useReducedMotion, useTier } from '@/components/lab/kit/hooks'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export type Dish = { slug: string; name: string; category: string; rating: number }

const clean = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()

function rng(seed: number) { return () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 } }

/** Intermission: a concession-stand letterboard of real dishes, a popcorn burst, steam over a bowl. */
export default function Intermission({ dishes }: { dishes: Dish[] }) {
  const root = useRef<HTMLElement>(null)
  const rm = useReducedMotion()
  const light = useTier() === 'light'

  useGSAP(() => {
    if (rm) return
    const q = gsap.utils.selector(root)
    const tiles = q('.ls-tile')
    gsap.set(tiles, { y: -60, opacity: 0, rotation: () => gsap.utils.random(-14, 14) })
    ScrollTrigger.create({
      trigger: q('.ls-board')[0], start: 'top 78%', once: true,
      onEnter: () => {
        gsap.to(tiles, { y: 0, opacity: 1, rotation: 0, duration: 0.55, ease: 'bounce.out', stagger: { each: 0.012, from: 'start' } })
      },
    })
    // popcorn burst
    const r = rng(11)
    const n = light ? 22 : 46
    const bucket = q('.ls-bucket')[0] as HTMLElement
    const corn = q('.ls-kernel')
    ScrollTrigger.create({
      trigger: bucket, start: 'top 80%', once: true,
      onEnter: () => {
        corn.slice(0, n).forEach((k) => {
          const a = -Math.PI / 2 + (r() - 0.5) * 2.1
          const v = 130 + r() * 230
          const x = Math.cos(a) * v, up = -Math.sin(a) * v
          const tl = gsap.timeline({ delay: r() * 0.35 })
          tl.set(k, { opacity: 1, x: 0, y: 0, scale: 0.4, rotation: 0 })
          tl.to(k, { x, duration: 1.5, ease: 'power1.out' }, 0)
          tl.to(k, { y: -up, duration: 0.6, ease: 'power2.out' }, 0)
          tl.to(k, { y: 150 + r() * 70, duration: 0.95, ease: 'power2.in' }, 0.6)
          tl.to(k, { scale: 0.9 + r() * 0.5, rotation: (r() - 0.5) * 540, duration: 1.5, ease: 'none' }, 0)
          tl.to(k, { opacity: 0, duration: 0.3 }, 1.55)
        })
      },
    })
  }, { scope: root, dependencies: [rm, light] })

  return (
    <section ref={root} id="ls-intermission" className="ls-inter" aria-label="Intermission, the concession stand">
      <div className="ls-inter-inner">
        <div className="ls-inter-head">
          <h2 className="ls-h2">Intermission</h2>
          <p className="ls-lede">Back in ten minutes. The stand is open, and this is what has been cooking.</p>
        </div>
        <div className="ls-stand">
          <div className="ls-board" role="list">
            {dishes.map((d) => (
              <a key={d.slug} role="listitem" href={`/cooking/${d.slug}`} className="ls-board-row" aria-label={`${d.name}, rated ${d.rating} of 5`}>
                <span className="ls-word" aria-hidden>
                  {clean(d.name).split(' ').map((w, wi) => (
                    <span key={wi} className="ls-wordgrp">{w.split('').map((c, ci) => <span key={ci} className="ls-tile">{c}</span>)}</span>
                  ))}
                </span>
                <span className="ls-price" aria-hidden>{d.rating.toFixed(1)}</span>
              </a>
            ))}
          </div>
          <div className="ls-counter" aria-hidden>
            <svg className="ls-bowl" viewBox="0 0 200 160" width="220" height="176">
              <g className="ls-steam">
                {[0, 1, 2].map((i) => (
                  <path key={i} className={`ls-wisp ls-wisp-${i}`} d={`M${70 + i * 30} 96 C ${60 + i * 30} 76, ${84 + i * 30} 64, ${70 + i * 30} 44 S ${80 + i * 30} 18, ${70 + i * 30} 6`} />
                ))}
              </g>
              <ellipse cx="100" cy="106" rx="76" ry="14" fill="#8a1f33" />
              <path d="M24 106 C 28 150, 172 150, 176 106 Z" fill="#6B1A2B" stroke="#D8A84E" strokeWidth="3" />
              <ellipse cx="100" cy="106" rx="68" ry="10" fill="#c45a2c" />
              <ellipse cx="100" cy="105" rx="52" ry="6" fill="#e69a4a" opacity=".7" />
            </svg>
            <div className="ls-bucket">
              <svg viewBox="0 0 120 150" width="132" height="165">
                <path d="M14 40 L106 40 L96 146 L24 146 Z" fill="#FFF3D6" />
                {[0, 1, 2, 3].map((i) => <path key={i} d={`M${30 + i * 22} 40 L${34 + i * 17} 146 L${20 + i * 20} 146 Z`} fill="#b3243d" />)}
                {[[26, 38, 14], [46, 30, 15], [68, 32, 15], [90, 38, 13], [36, 24, 12], [58, 20, 14], [80, 24, 12]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill="#FFE9B0" stroke="#E8C56E" strokeWidth="2" />)}
              </svg>
              {Array.from({ length: 46 }, (_, i) => <span key={i} className="ls-kernel" />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
