'use client'
import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useReducedMotion } from '@/components/lab/kit/hooks'
import { ResponsiveBorder } from './Border'
import FilmOverlay from './FilmOverlay'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export type Reel = { id: string | number; title: string; rating: number; date: string; poster: string | null }

const ZERO = 'circle(0% at 50% 50%)'
const FULL = 'circle(75% at 50% 50%)'
const WIPE0 = 'inset(0% 100% 0% 0%)'
const WIPE1 = 'inset(0% 0% 0% 0%)'
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI']
const SERIF = 'var(--font-sc), Georgia, serif'
const ITAL = 'var(--font-ital), Georgia, serif'
const INK = '#0c0906'
const PAPER = '#EFE6D2'

const isIris = (i: number) => i % 2 === 0
const initialClip = (i: number) => (i === 0 ? undefined : isIris(i) ? ZERO : WIPE0)

function Frame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative aspect-[3/4] w-[min(88vw,calc(78dvh*0.75))] md:aspect-[4/3] md:w-[min(92vw,calc(84dvh*1.3333))] ${className}`}
      style={{ containerType: 'inline-size', background: INK }}
    >
      {children}
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ background: INK, color: PAPER, padding: '15cqw 13cqw' }}>
      <ResponsiveBorder />
      <div className="relative z-10 flex flex-col items-center">{children}</div>
    </div>
  )
}

const stars = (r: number) => '★'.repeat(Math.max(0, Math.min(5, Math.round(r)))) + '☆'.repeat(5 - Math.max(0, Math.min(5, Math.round(r))))
const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })

export default function Film({ reels }: { reels: Reel[] }) {
  const wrap = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const gate = useRef<HTMLDivElement>(null)
  const rm = useReducedMotion()

  useGSAP(() => {
    const root = wrap.current
    if (!root) return
    const q = (s: string) => root.querySelector(s) as HTMLElement
    const layers = Array.from(root.querySelectorAll<HTMLElement>('[data-layer]'))
    const D = rm ? 0.001 : 1
    layers.forEach((el, i) => { const c = initialClip(i); if (c) gsap.set(el, { clipPath: c }) })

    if (!rm) gsap.from(q('[data-title-frame]'), { clipPath: ZERO, duration: 1.1, delay: 0.1, ease: 'power2.out', clearProps: 'clipPath' })

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: rm ? true : 0.35, invalidateOnRefresh: true },
    })
    const o = { immediateRender: false }
    tl.to({}, { duration: 1.6 })
    for (let i = 1; i < layers.length; i++) {
      const cur = layers[i]
      const prev = layers[i - 1]
      if (isIris(i)) {
        tl.fromTo(prev, { clipPath: FULL }, { clipPath: ZERO, duration: 0.55 * D, ...o })
        tl.fromTo(cur, { clipPath: ZERO }, { clipPath: FULL, duration: 0.65 * D, ...o })
      } else {
        tl.fromTo(cur, { clipPath: WIPE0 }, { clipPath: WIPE1, duration: 0.8 * D, ...o })
      }
      const card = cur.querySelector<HTMLElement>('[data-card]')
      const poster = cur.querySelector<HTMLElement>('[data-poster]')
      if (card && poster) {
        tl.to({}, { duration: 0.9 })
        tl.fromTo(card, { opacity: 1 }, { opacity: 0, duration: 0.001, ...o })
        tl.fromTo(poster, { scale: 1 }, { scale: rm ? 1 : 1.1, duration: 1.5, ...o }, '<')
        tl.to({}, { duration: 1.5 })
      } else {
        tl.to({}, { duration: 1.6 })
      }
    }
  }, { scope: wrap, dependencies: [rm, reels.length] })

  const n = reels.length
  return (
    <div ref={wrap} className="relative h-[440vh]" data-film-wrap>
      <div ref={stage} className="sticky top-0 h-[100dvh] w-full overflow-hidden" style={{ background: INK }}>
        <div ref={gate} className="absolute inset-0" style={{ filter: 'sepia(0.82) saturate(0.85) contrast(1.12)' }}>
          {/* 0: opening title card */}
          <section data-layer className="absolute inset-0 flex items-center justify-center" style={{ background: INK, zIndex: 1 }} aria-label="Opening title card">
            <Frame>
              <div data-title-frame className="absolute inset-0">
                <Card>
                  <p style={{ fontFamily: ITAL, fontStyle: 'italic', fontSize: '5cqw', lineHeight: 1.3 }}>Ladies and gentlemen, kindly take your seats.</p>
                  <h1 style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 'clamp(2rem, 11.5cqw, 4.4rem)', lineHeight: 0.98, margin: '4.5cqw 0' }}>Parag&apos;s Picture House</h1>
                  <p style={{ fontFamily: ITAL, fontStyle: 'italic', fontSize: '4.6cqw', lineHeight: 1.35, opacity: 0.92 }}>
                    {n > 0 ? `${n} reels from the season, projected in the usual manner.` : 'A programme of pictures, projected in the usual manner.'}
                  </p>
                  <p style={{ fontFamily: ITAL, fontStyle: 'italic', fontSize: '4cqw', marginTop: '5cqw', opacity: 0.8 }}>Scroll to start the reel.</p>
                </Card>
              </div>
            </Frame>
          </section>

          {/* reels */}
          {reels.map((m, k) => (
            <section key={m.id} data-layer className="absolute inset-0 flex items-center justify-center" style={{ background: INK, zIndex: k + 2, clipPath: initialClip(k + 1) }} aria-label={`Reel ${ROMAN[k] ?? k + 1}: ${m.title}`}>
              <Frame>
                <div className="absolute inset-0 overflow-hidden">
                  {m.poster && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.poster} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-125 object-cover opacity-45 blur-xl" style={{ filter: 'grayscale(1) blur(18px)' }} />
                  )}
                  <div data-poster className="absolute inset-0 flex items-center justify-center">
                    {m.poster ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.poster} alt={`Poster for ${m.title}`} className="h-[86%] w-auto rounded-[2px] md:h-[90%]" style={{ aspectRatio: '2 / 3', objectFit: 'cover', filter: 'grayscale(1) contrast(1.1)', boxShadow: '0 0 0 2px #0c0906, 0 10px 40px rgba(0,0,0,.6)' }} />
                    ) : <div className="h-[80%] aspect-[2/3]" style={{ background: '#2a2118' }} />}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 px-[5cqw] pb-[3cqw] pt-[8cqw] text-center" style={{ background: 'linear-gradient(to top, rgba(12,9,6,.92) 40%, rgba(12,9,6,0))', color: PAPER }}>
                    <p style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '5.2cqw', lineHeight: 1.1 }}>{m.title}</p>
                    <p style={{ fontFamily: ITAL, fontStyle: 'italic', fontSize: '3.6cqw' }}>{stars(m.rating)}</p>
                  </div>
                </div>
                <div data-card className="absolute inset-0">
                  <Card>
                    <p style={{ fontFamily: ITAL, fontStyle: 'italic', fontSize: '4.6cqw' }}>Reel {ROMAN[k] ?? k + 1}</p>
                    <h2 style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 'clamp(1.6rem, 9.5cqw, 3.6rem)', lineHeight: 1.02, margin: '4cqw 0' }}>{m.title}</h2>
                    <p style={{ fontFamily: SERIF, fontSize: '5.6cqw', letterSpacing: '0.1em' }} aria-label={`Rated ${m.rating} out of 5`}>{stars(m.rating)}</p>
                    <p style={{ fontFamily: ITAL, fontStyle: 'italic', fontSize: '4.4cqw', marginTop: '3cqw', opacity: 0.9 }}>Rated {m.rating} of 5. Seen on {fmt(m.date)}.</p>
                  </Card>
                </div>
              </Frame>
            </section>
          ))}

          {/* last: The End */}
          <section data-layer className="absolute inset-0 flex items-center justify-center" style={{ background: INK, zIndex: n + 2, clipPath: initialClip(n + 1) }} aria-label="The End">
            <Frame>
              <Card>
                <h2 style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 'clamp(2.4rem, 17cqw, 6rem)', lineHeight: 1 }}>The End</h2>
                <p style={{ fontFamily: ITAL, fontStyle: 'italic', fontSize: '4.8cqw', marginTop: '5cqw', lineHeight: 1.35 }}>Thank you for coming.<br />The house lights are up; the programme follows.</p>
              </Card>
            </Frame>
          </section>
        </div>
        <FilmOverlay gate={gate} stage={stage} reduced={rm} />
      </div>
    </div>
  )
}
