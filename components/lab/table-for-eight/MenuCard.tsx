'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useReducedMotion } from '@/components/lab/kit/hooks'
import { labImg } from '@/components/lab/kit/img'

export type MenuMovie = { id: string; title: string; rating: number; review: string; watchDate: string; posterUrl: string | null; type: 'MOVIE' | 'SERIES' }
const serif = { fontFamily: 'var(--font-gilda), Georgia, serif' } as const
const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })
const stars = (n: number) => '★'.repeat(Math.round(n)) + '☆'.repeat(Math.max(0, 5 - Math.round(n)))
const line = (s: string, n = 96) => { const t = s.replace(/\s+/g, ' ').trim(); return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t }

/** The plate, the cloche and the poster underneath. open = cloche lifted; the poster tilts toward the pointer on a spring. */
function Plate({ m, open }: { m: MenuMovie | null; open: boolean }) {
  const reduced = useReducedMotion()
  const rx = useMotionValue(0), ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 140, damping: 14 }), sry = useSpring(ry, { stiffness: 140, damping: 14 })
  const sheen = useTransform(sry, [-14, 14], ['20%', '80%'])
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 28)
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 22)
  }
  const reset = () => { rx.set(0); ry.set(0) }
  const src = m ? labImg(m.posterUrl, 640) : null
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-[22rem]" onPointerMove={reduced ? undefined : onMove} onPointerLeave={reset} style={{ perspective: 900 }}>
      {/* plate */}
      <div aria-hidden className="absolute inset-x-[4%] bottom-[2%] h-[16%] rounded-[50%] bg-[#b98c47] shadow-[0_26px_30px_rgba(0,0,0,.5)]" />
      <div aria-hidden className="absolute inset-x-[8%] bottom-[4.5%] h-[13%] rounded-[50%] bg-[#F4F1EA]" />
      {/* poster */}
      <motion.div className="absolute inset-x-[16%] bottom-[9%] top-[4%] overflow-hidden rounded-[3px] bg-[#F6F1E4] shadow-[0_18px_30px_rgba(0,0,0,.5)]" style={{ rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d' }}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={m ? `Poster for ${m.title}` : ''} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-center text-2xl text-[#17352A]" style={serif}>{m?.title ?? ''}</div>
        )}
        <motion.span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,248,234,.28) 50%, transparent 70%)', backgroundPositionX: sheen }} />
      </motion.div>
      {/* cloche */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-[2%] bottom-[7%] top-[0%]"
        initial={false}
        animate={reduced ? { y: open ? -420 : 0, opacity: open ? 0 : 1 } : { y: open ? -230 : 0, x: open ? 46 : 0, rotate: open ? 9 : 0, opacity: open ? 0.0 : 1 }}
        transition={reduced ? { duration: 0.2 } : { type: 'spring', stiffness: 120, damping: 13, opacity: { duration: 0.5, delay: open ? 0.25 : 0 } }}
        style={{ transformOrigin: '50% 100%' }}
      >
        <svg viewBox="0 0 200 200" className="h-full w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="cl" x1="0" x2="1"><stop offset="0" stopColor="#8d8f96" /><stop offset=".3" stopColor="#f1f2f5" /><stop offset=".55" stopColor="#b9bbc3" /><stop offset="1" stopColor="#6c6e76" /></linearGradient>
          </defs>
          <path d="M8 190 C8 90 48 32 100 32 C152 32 192 90 192 190 Z" fill="url(#cl)" />
          <path d="M26 176 C30 100 56 52 84 44" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="5" strokeLinecap="round" />
          <circle cx="100" cy="24" r="10" fill="url(#cl)" />
          <rect x="4" y="186" width="192" height="8" rx="4" fill="#9a9ca4" />
        </svg>
      </motion.div>
    </div>
  )
}

function Candles() {
  return (
    <div aria-hidden className="flex items-end justify-center gap-6 sm:gap-10">
      <style>{`
        @keyframes tfe-fl{0%,100%{transform:scale(1,1) rotate(-1deg)}25%{transform:scale(.92,1.1) rotate(2deg)}55%{transform:scale(1.05,.94) rotate(-2deg)}80%{transform:scale(.96,1.06) rotate(1deg)}}
        @keyframes tfe-gl{0%,100%{opacity:.85}40%{opacity:.6}70%{opacity:1}}
        .tfe-flame{animation:tfe-fl var(--d,1.4s) ease-in-out infinite;transform-origin:50% 100%}
        .tfe-glow{animation:tfe-gl var(--d,1.4s) ease-in-out infinite}
        @media (prefers-reduced-motion:reduce){.tfe-flame,.tfe-glow{animation:none}}
      `}</style>
      {[34, 48, 40, 52, 30].map((h, i) => (
        <div key={i} className="relative flex flex-col items-center" style={{ ['--d' as string]: `${1.1 + i * 0.23}s` }}>
          <span className="tfe-glow absolute -top-6 h-16 w-16 rounded-full" style={{ background: 'radial-gradient(circle, rgba(246,185,79,.55), rgba(246,185,79,0) 70%)' }} />
          <span className="tfe-flame relative h-6 w-3 rounded-[50%_50%_50%_50%/65%_65%_35%_35%]" style={{ background: 'linear-gradient(#FFF3C9, #F6B94F 55%, #E8761F)', boxShadow: '0 0 14px 4px rgba(246,185,79,.7)' }} />
          <span className="block w-3.5 rounded-t-[3px] bg-[#FFF8EA]" style={{ height: h }} />
          <span className="block h-2 w-8 rounded-[2px] bg-[#b98c47]" />
        </div>
      ))}
    </div>
  )
}

export default function MenuCard({ movies, back }: { movies: MenuMovie[]; back: string }) {
  const [active, setActive] = useState<number | null>(null)
  const [openMobile, setOpenMobile] = useState<number | null>(null)
  const reduced = useReducedMotion()
  const list = useRef<HTMLOListElement>(null)
  const cur = active != null ? movies[active] : null
  const lastOpen = useRef<MenuMovie | null>(null)
  if (cur) lastOpen.current = cur

  const setDemo = useCallback(() => {
    const ol = list.current
    if (!ol) return
    const rows = Array.from(ol.children).slice(0, 4) as HTMLElement[]
    const w = window.innerWidth, h = window.innerHeight
    const steps: NonNullable<Window['__labDemoSteps']> = [{ type: 'wait', x: 0.3, y: 0.5, ms: 600 }]
    rows.forEach((r, i) => {
      const b = r.getBoundingClientRect()
      steps.push({ type: 'move', x: Math.min(0.95, Math.max(0.02, (b.left + b.width * 0.3) / w)), y: Math.min(0.95, Math.max(0.05, (b.top + b.height / 2) / h)), ms: 900 + i * 40 }, { type: 'wait', x: 0.3, y: 0.5, ms: 1100 })
    })
    window.__labDemoSteps = steps
  }, [])
  useEffect(() => { setDemo(); return () => { window.__labDemoSteps = undefined } }, [setDemo])

  return (
    <div>
      <header className="px-6 pb-10 pt-24 text-center sm:px-12">
        <Candles />
        <h1 className="mt-8 text-5xl leading-[1.02] text-[#FFF8EA] sm:text-7xl" style={{ ...serif, textShadow: '0 2px 24px rgba(0,0,0,.6)' }}>The film course</h1>
        <p className="mx-auto mt-3 max-w-md text-[#A9C3AE]">Every film and series that came after supper. Point at a line and the cloche comes off.</p>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-24 sm:px-10 md:grid-cols-[1.35fr_1fr]">
        <div className="rounded-[3px] bg-[#F1EEE6] px-5 py-8 text-[#17352A] shadow-[0_30px_60px_rgba(0,0,0,.5)] sm:px-10 sm:py-12" style={{ outline: '1px solid #B88A44', outlineOffset: '-10px', backgroundImage: 'repeating-linear-gradient(0deg, rgba(23,53,42,.025) 0 1px, transparent 1px 3px)' }}>
          <p className="text-center text-4xl text-[#7C2236]" style={{ fontFamily: 'var(--font-pinyon), cursive' }}>Menu</p>
          <ol ref={list} className="mt-6 divide-y divide-[#17352A]/15">
            {movies.map((m, i) => {
              const on = active === i
              const mob = openMobile === i
              return (
                <li key={m.id} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive((a) => (a === i ? null : a))}>
                  <button
                    type="button"
                    className="group flex w-full items-baseline gap-3 py-3 text-left outline-none transition-colors focus-visible:bg-[#F6B94F]/25 sm:gap-4"
                    aria-expanded={mob}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive((a) => (a === i ? null : a))}
                    onClick={() => setOpenMobile(mob ? null : i)}
                  >
                    <span className={`min-w-0 flex-1 text-xl transition-transform duration-300 sm:text-2xl ${on ? 'translate-x-2 text-[#7C2236]' : ''}`} style={serif}>{m.title}{m.type === 'SERIES' && <span className="ml-2 text-sm text-[#17352A]/60">series</span>}</span>
                    <span className="shrink-0 tracking-wide text-[#7C2236]" aria-label={`Rated ${m.rating} of 5`}>{stars(m.rating)}</span>
                    <span className="hidden shrink-0 text-sm tabular-nums text-[#17352A]/70 sm:inline">{fmt(m.watchDate)}</span>
                  </button>
                  {m.review && <p className="-mt-1 pb-3 pr-2 text-sm italic leading-snug text-[#17352A]/75">{line(m.review)}</p>}
                  <AnimatePresence initial={false}>
                    {mob && (
                      <motion.div className="overflow-hidden md:hidden" initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 180, damping: 22 }}>
                        <div className="flex gap-4 pb-5">
                          {m.posterUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={labImg(m.posterUrl, 384) ?? ''} alt={`Poster for ${m.title}`} loading="lazy" className="w-28 rounded-[2px] shadow-[0_10px_20px_rgba(0,0,0,.35)]" />
                          )}
                          <div className="text-sm leading-snug"><p>{m.review}</p><p className="mt-2 text-[#17352A]/70">{fmt(m.watchDate)}</p></div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
          </ol>
        </div>

        <aside className="hidden md:block" aria-hidden>
          <div className="sticky top-20">
            <Plate m={cur ?? lastOpen.current ?? movies[0] ?? null} open={!!cur} />
            <p className="mt-4 h-8 text-center text-2xl text-[#FFF8EA]" style={serif}>{cur ? cur.title : ''}</p>
          </div>
        </aside>
      </div>

      <p className="pb-20 text-center"><a href={back} className="text-[#F6B94F] underline underline-offset-4 hover:text-[#FFF8EA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F6B94F]">Back to the table</a></p>
    </div>
  )
}
