'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import Link from 'next/link'
import { Canvas } from '@react-three/fiber'
import { Bloom, DepthOfField, EffectComposer, Noise, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { useInView, useReducedMotion, useTier } from '@/components/lab/kit/hooks'
import World from './World'
import Rig from './Rig'
import { BEATS, FEATURE_A, FEATURE_B, beatIndex, sm, win, type StoryData } from './timeline'

gsap.registerPlugin(useGSAP)
const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })
const SERIF = 'dm-serif'

/** The kinetic time stamp: each character rolls in when the evening moves to the next beat. */
function Stamp({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  useGSAP(() => {
    gsap.fromTo('[data-ch]', { yPercent: 115, rotate: 8, opacity: 0 }, { yPercent: 0, rotate: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.018 })
  }, { scope: ref, dependencies: [text] })
  return (
    <p ref={ref} aria-hidden className={`${SERIF} text-[clamp(1.9rem,3.8vw,3.4rem)] italic leading-[1.05] text-[#FFF3D6]`} style={{ textShadow: '0 2px 22px rgba(15,26,46,.95), 0 0 3px rgba(15,26,46,.8)' }}>
      {text.split(' ').map((w, wi) => (
        <span key={wi} className="mr-[0.25em] inline-block overflow-hidden align-bottom">
          {w.split('').map((c, ci) => <span key={ci} data-ch className="inline-block">{c}</span>)}
        </span>
      ))}
    </p>
  )
}

export default function Story({ data }: { data: StoryData }) {
  const reduced = useReducedMotion()
  const tier = useTier()
  const light = tier === 'light'
  const root = useRef<HTMLDivElement>(null)
  const inView = useInView(root, '100px')
  const [ready, setReady] = useState(false)
  const [beat, setBeat] = useState(0)
  const beatRef = useRef(0)
  const dof = useMemo(() => new THREE.Vector3(), [])
  const el = useRef<Record<string, HTMLElement | null>>({})
  const wrap = useRef<HTMLElement | null>(null)
  useEffect(() => { wrap.current = root.current?.closest('[data-story]') as HTMLElement | null }, [])

  const films = data.films
  const seg = (FEATURE_B - FEATURE_A) / Math.max(1, films.length)

  const onFrame = useCallback((T: number) => {
    const set = (k: string, v: number, dx = 0, dy = 28, rot = 0, sc = 0) => {
      const e = el.current[k]
      if (!e) return
      e.style.opacity = String(v)
      e.style.visibility = v < 0.01 ? 'hidden' : 'visible'
      e.style.pointerEvents = v > 0.6 ? 'auto' : 'none'
      e.style.transform = `translate3d(${(dx * (1 - v)).toFixed(1)}px, ${(dy * (1 - v)).toFixed(1)}px, 0) rotate(${(rot * (1 - v)).toFixed(2)}deg) scale(${(1 - sc * (1 - v)).toFixed(3)})`
    }
    set('menu', win(T, 19.85, 20.95), -40, 20)
    data.toasts.forEach((_, k) => set(`toast${k}`, win(T, 20.75 + 0.3 * k, 21.95, 0.14), k % 2 ? 50 : -50, 24, k % 2 ? 5 : -5, 0.35))
    data.notes.forEach((_, k) => set(`note${k}`, win(T, 21.95 + 0.07 * k, 22.45, 0.1), 0, 60, k * 2 - 2))
    films.forEach((_, i) => { const a = FEATURE_A + i * seg; set(`film${i}`, win(T, i === 0 ? a - 0.05 : a, i === films.length - 1 ? FEATURE_B + 0.05 : a + seg, Math.min(0.1, seg / 3)), -50, 0) })
    set('door', win(T, 24.6, 26, 0.2), 0, 40)
    wrap.current?.style.setProperty('--hero', String(1 - sm(19.1, 19.6, T)))
    const b = beatIndex(T)
    if (b !== beatRef.current) { beatRef.current = b; setBeat(b) }
  }, [data, films, seg])

  if (reduced) return null
  const card = 'absolute rounded-[3px] px-5 py-4 shadow-[0_18px_40px_rgba(0,0,0,.5)]'
  return (
    <div ref={root} className="absolute inset-0 z-[1]">
      <div className="absolute inset-0 transition-opacity duration-700" style={{ opacity: ready ? 1 : 0 }}>
        <Canvas
          frameloop={inView ? 'always' : 'never'}
          shadows={!light}
          dpr={light ? [1, 1.5] : [1, 2]}
          camera={{ fov: 38, near: 0.05, far: 60, position: [0, 2.4, 6.4] }}
          gl={{ antialias: false, powerPreference: 'high-performance', toneMapping: THREE.NoToneMapping }}
          aria-hidden
        >
          <World data={data} light={light} />
          <Rig onFrame={onFrame} onReady={() => setReady(true)} dof={dof} />
          <EffectComposer multisampling={light ? 0 : 4} enableNormalPass={false}>
            {light ? <></> : <DepthOfField target={dof} focalLength={0.05} bokehScale={1.2} height={480} />}
            <Bloom intensity={light ? 0.8 : 1.0} luminanceThreshold={0.95} luminanceSmoothing={0.25} mipmapBlur radius={0.7} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
            <Vignette eskil={false} offset={0.25} darkness={0.7} />
            <Noise opacity={0.04} />
          </EffectComposer>
        </Canvas>
      </div>

      <div className="pointer-events-none absolute left-5 top-[4.2rem] z-10 max-w-[80%] sm:left-12 sm:top-20 md:max-w-[55%]">{beat > 0 && <Stamp key={beat} text={BEATS[beat].stamp} />}</div>

      <div className="pointer-events-none absolute inset-0 z-10">
        {/* 8pm: the menu card for the latest dishes */}
        <aside ref={(e) => { el.current.menu = e }} className={`${card} bottom-5 left-4 right-4 bg-[#F1EEE6] text-[#17352A] sm:bottom-12 sm:left-12 sm:right-auto sm:w-[26rem]`} style={{ opacity: 0, visibility: 'hidden', outline: '1px solid #B88A44', outlineOffset: '-7px' }}>
          <p className={`${SERIF} text-3xl italic text-[#7C2236]`}>On the menu</p>
          <ol className="mt-2 space-y-2">
            {data.dishes.map((d, i) => (
              <li key={d.id}><p className={`${SERIF} text-[1.45rem] leading-tight`}>{i === 0 && <span className="text-[#7C2236]">To start: </span>}{d.name}</p><p className="text-sm text-[#17352A]/80">{d.category} · {d.rating}/5 · {fmt(d.cookDate)}</p></li>
            ))}
          </ol>
        </aside>

        {/* 9pm: post titles as toasts */}
        {data.toasts.map((t, k) => (
          <blockquote key={k} ref={(e) => { el.current[`toast${k}`] = e }} className={`${card} ${['left-4 top-[34%] sm:left-[7%] sm:top-[30%]', 'right-4 top-[48%] sm:right-[6%] sm:top-[24%]', 'left-4 bottom-8 sm:left-[16%] sm:bottom-[16%]'][k]} w-[72%] max-w-[22rem] bg-[#FFF3D6] text-[#0F1A2E]`} style={{ opacity: 0, visibility: 'hidden', borderRadius: k % 2 ? '18px 18px 4px 18px' : '18px 18px 18px 4px' }}>
            <p className={`${SERIF} text-2xl leading-[1.12]`}>&ldquo;{t.title}&rdquo;</p>
            <p className="mt-1 text-sm text-[#0F1A2E]/75">{t.kind} · {fmt(t.date)}</p>
          </blockquote>
        ))}

        {/* 10pm: notes as place cards */}
        <div className="absolute inset-x-0 bottom-6 flex flex-wrap justify-center gap-3 px-4 sm:bottom-14 sm:gap-6">
          {data.notes.map((n, k) => (
            <article key={k} ref={(e) => { el.current[`note${k}`] = e }} className="w-[44%] max-w-[15rem] rounded-[3px] bg-[#F6F1E4] px-4 py-3 text-center text-[#17352A] shadow-[0_18px_40px_rgba(0,0,0,.55)] sm:w-60 sm:py-5" style={{ opacity: 0, visibility: 'hidden', outline: '1px solid #B88A44', outlineOffset: '-6px' }}>
              <p className="text-sm text-[#7C2236]">{n.category}</p>
              <p className={`${SERIF} mt-1 text-[1.3rem] italic leading-tight sm:text-2xl`}>{n.title}</p>
            </article>
          ))}
        </div>

        {/* 11pm to 12:30: what is on the wall */}
        {films.map((f, i) => (
          <article key={f.id} ref={(e) => { el.current[`film${i}`] = e }} className={`${card} bottom-5 left-4 right-4 bg-[#0F1A2E] text-[#FFF3D6] sm:bottom-10 sm:left-12 sm:right-auto sm:w-[24rem]`} style={{ opacity: 0, visibility: 'hidden', outline: '1px solid rgba(255,243,214,.3)', outlineOffset: '-6px' }}>
            <p className="text-sm text-[#F6B94F]">{String(i + 1).padStart(2, '0')} of {films.length}, on the wall</p>
            <p className={`${SERIF} mt-1 text-[1.9rem] leading-[1.05]`}>{f.title}</p>
            <p className="mt-1 text-sm text-[#FFF3D6]/85">{f.rating}/5 · watched {fmt(f.watchDate)}</p>
          </article>
        ))}

        {/* 1am: the door */}
        <aside ref={(e) => { el.current.door = e }} className={`${card} bottom-5 left-4 right-4 bg-[#FFF3D6] text-[#0F1A2E] sm:bottom-12 sm:left-auto sm:right-12 sm:w-[26rem]`} style={{ opacity: 0, visibility: 'hidden', outline: '1px solid #B88A44', outlineOffset: '-7px' }}>
          <p className={`${SERIF} text-3xl italic`}>Mind the step.</p>
          {data.door && <p className="mt-2 text-lg leading-snug">Last note: &ldquo;{data.door.message}&rdquo;</p>}
          <Link href="/#guest-note" className="mt-3 inline-block rounded-full bg-[#7C2236] px-5 py-2 text-[#FFF3D6] hover:bg-[#9a2c44]">Leave a note by the door</Link>
          <a href="#dm-door" className="mt-3 block text-sm underline underline-offset-4">Keep reading below</a>
        </aside>
      </div>
    </div>
  )
}
