'use client'
import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useReducedMotion } from '@/components/lab/kit/hooks'
import { irisClose } from './iris'

gsap.registerPlugin(useGSAP)

export type FilmView = { id: string; title: string; rating: number; src: string | null; dateLabel: string; type: string }

function Stub({ rating }: { rating: number }) {
  const whole = Math.floor(rating)
  const half = rating - whole >= 0.25 && rating - whole < 0.75
  const punched = Math.min(5, whole + (rating - whole >= 0.75 ? 1 : 0))
  const slots = [0, 1, 2, 3, 4]
  return (
    <svg className="ls-stub" viewBox="0 0 320 150" role="img" aria-label={`Rated ${rating} out of 5`}>
      <defs>
        <mask id="ls-punch">
          <path fill="#fff" d="M10 0 H310 V54 A12 12 0 0 0 310 78 V150 H10 V78 A12 12 0 0 0 10 54 Z" />
          {slots.map((i) => (i < punched ? <circle key={i} className="ls-hole" cx={52 + i * 54} cy="104" r="14" fill="#000" /> : null))}
          {half && <path className="ls-hole" d={`M${52 + punched * 54 - 14} 104 a14 14 0 0 1 28 0 Z`} fill="#000" />}
        </mask>
        <linearGradient id="ls-paper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#E9C46C" /><stop offset="1" stopColor="#C9973A" /></linearGradient>
      </defs>
      <g mask="url(#ls-punch)">
        <rect width="320" height="150" fill="url(#ls-paper)" />
        <rect x="14" y="8" width="292" height="134" fill="none" stroke="#6B1A2B" strokeWidth="2" strokeDasharray="2 5" />
        <text x="160" y="40" textAnchor="middle" className="ls-stub-t1">ADMIT ONE</text>
        <text x="160" y="64" textAnchor="middle" className="ls-stub-t2">RATED {rating.toFixed(1)} OF 5</text>
        {slots.map((i) => <circle key={i} cx={52 + i * 54} cy="104" r="14" fill="none" stroke="#6B1A2B" strokeWidth="1.5" strokeDasharray="3 3" opacity={i < punched ? 0 : 0.7} />)}
      </g>
    </svg>
  )
}

/** The film page stage: the poster grows from where it was clicked, sits in a brass frame under the beam, the stub is punched. */
export default function FilmStage({ film }: { film: FilmView }) {
  const root = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const rm = useReducedMotion()
  const router = useRouter()

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    const f = frame.current!
    f.classList.remove('ls-pending')
    if (rm) { gsap.set(q('.ls-hole'), { scale: 1 }); return }
    let from: { x: number; y: number; w: number; h: number } | null = null
    try {
      const raw = sessionStorage.getItem('ls-rect')
      if (raw) { const v = JSON.parse(raw); if (v.id === film.id) from = v; sessionStorage.removeItem('ls-rect') }
    } catch {}
    const tl = gsap.timeline()
    const to = f.getBoundingClientRect()
    gsap.set(q('.ls-hole'), { scale: 0, transformOrigin: '50% 50%' })
    gsap.set(q('.ls-beam'), { opacity: 0 })
    if (from) {
      // grow from the remembered thumbnail rect
      const img = f.querySelector('img')!.getBoundingClientRect()
      const s = from.w / img.width
      const dx = from.x + from.w / 2 - (to.left + to.width / 2) , dy = from.y + from.h / 2 - (to.top + to.height / 2)
      tl.fromTo(f, { x: dx, y: dy, scale: s, '--brass': 0 }, { x: 0, y: 0, scale: 1, '--brass': 1, duration: 1.1, ease: 'expo.inOut' }, 0)
    } else {
      tl.fromTo(f, { scale: 0.55, opacity: 0, '--brass': 0 }, { scale: 1, opacity: 1, '--brass': 1, duration: 1.0, ease: 'expo.out' }, 0)
    }
    tl.to(q('.ls-beam'), { opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.7)
    tl.fromTo(q('.ls-stubwrap'), { y: 40, opacity: 0, rotation: -5 }, { y: 0, opacity: 1, rotation: -2, duration: 0.7, ease: 'back.out(1.6)' }, 1.0)
    tl.to(q('.ls-hole'), { scale: 1, duration: 0.14, ease: 'power4.in', stagger: 0.28 }, 1.5)
    tl.to(q('.ls-stubwrap'), { y: 3, duration: 0.07, yoyo: true, repeat: 1, stagger: 0 }, 1.5)
    tl.fromTo(q('.ls-film-title, .ls-film-meta'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out' }, 0.9)
  }, { scope: root, dependencies: [rm, film.id] })

  const back = async (e: React.MouseEvent) => {
    if (rm) return
    e.preventDefault()
    const r = frame.current!.getBoundingClientRect()
    await irisClose(r.left + r.width / 2, r.top + r.height / 2)
    router.push('/lab/late-show#wall')
  }

  return (
    <div ref={root} className="ls-stage-film">
      <div className="ls-beam" aria-hidden />
      <div className="ls-dust" aria-hidden>{Array.from({ length: 22 }, (_, i) => <i key={i} style={{ left: `${(i * 41) % 100}%`, animationDelay: `${(i % 8) * 0.9}s`, animationDuration: `${9 + (i % 5) * 2}s` }} />)}</div>
      <a href="/lab/late-show#wall" onClick={back} className="ls-back">Back to the wall</a>
      <div className="ls-film-hero">
        <div ref={frame} className="ls-frame ls-pending">
          {film.src
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={film.src} alt={`${film.title} poster`} className="ls-frame-img" />
            : <div className="ls-frame-img ls-frame-none">{film.title}</div>}
        </div>
        <div className="ls-film-side">
          <h1 className="ls-film-title">{film.title}</h1>
          <p className="ls-film-meta">{film.type === 'SERIES' ? 'Series' : 'Feature'} &middot; watched {film.dateLabel}</p>
          <div className="ls-stubwrap"><Stub rating={film.rating} /></div>
        </div>
      </div>
    </div>
  )
}
