'use client'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useInView, useReducedMotion, useTier } from '@/components/lab/kit/hooks'
import { TiltShiftFx } from './TiltShiftFx'
import Street from './Street'
import { Lamps, Lighting, People, Sky, Windows } from './Life'
import Room from './Room'
import { smooth, type Dish, type Film, type Shared } from './types'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const STILL = 0.92
// camera keys along the scroll: [p, target x, y, z, visible width, azimuth deg, elevation deg]
const KEYS: number[][] = [
  [0.0, -5.5, 1.3, 0.5, 13, -30, 17],
  [0.3, -1.5, 1.3, 0.3, 11, -22, 18],
  [0.55, 3.0, 1.1, -0.1, 8, -14, 20],
  [0.7, 3.95, 0.85, -0.7, 4.7, -5, 14],
  [1.0, 4.05, 0.85, -0.7, 4.3, -4, 14],
]
function sample(p: number, col: number) {
  for (let i = 0; i < KEYS.length - 1; i++) {
    const a = KEYS[i], b = KEYS[i + 1]
    if (p <= b[0]) { const t = (p - a[0]) / (b[0] - a[0]); return a[col] + (b[col] - a[col]) * Math.min(1, Math.max(0, t)) }
  }
  return KEYS[KEYS.length - 1][col]
}

type Focus = { y: number }

function Rig({ sh, prog, focus }: { sh: React.MutableRefObject<Shared>; prog: React.MutableRefObject<number>; focus: React.MutableRefObject<Focus> }) {
  const { camera, size } = useThree()
  const v = useMemo(() => ({ t: new THREE.Vector3(), f: new THREE.Vector3(), a: new THREE.Vector3(), b: new THREE.Vector3() }), [])
  useFrame((_, dt) => {
    const reduced = sh.current.reduced
    sh.current.p = reduced ? STILL : THREE.MathUtils.damp(sh.current.p, prog.current, 4.5, Math.min(dt, 0.1))
    const p = sh.current.p
    const cam = camera as THREE.PerspectiveCamera
    const aspect = size.width / size.height
    const narrow = aspect < 1 ? 0.45 + 0.55 * aspect : 1
    const W = sample(p, 4) * narrow
    const d = W / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * aspect)
    const az = THREE.MathUtils.degToRad(sample(p, 5)), el = THREE.MathUtils.degToRad(sample(p, 6))
    v.t.set(sample(p, 1), sample(p, 2) + (aspect < 1 ? 1.6 : 0), sample(p, 3))
    camera.position.set(v.t.x + d * Math.sin(az) * Math.cos(el), v.t.y + d * Math.sin(el), v.t.z + d * Math.cos(az) * Math.cos(el))
    camera.lookAt(v.t)
    camera.updateMatrixWorld()
    // focus point glides from the pavement (where the guests walk) to the table inside the window
    const k = smooth(0.5, 0.7, p)
    v.a.set(v.t.x, 0.35, 0.6); v.b.set(3.95, 0.7, -0.8)
    v.f.lerpVectors(v.a, v.b, k).project(cam)
    focus.current.y = v.f.y * 0.5 + 0.5
  })
  return null
}

function Post({ focus, light, sh }: { focus: React.MutableRefObject<Focus>; light: boolean; sh: React.MutableRefObject<Shared> }) {
  const fx = useMemo(() => new TiltShiftFx(light ? 9 : 18), [light])
  const size = useThree((s) => s.size)
  useEffect(() => () => fx.dispose(), [fx])
  useFrame(() => {
    fx.set('focus', focus.current.y)
    fx.set('band', 0.1 - 0.035 * smooth(0.45, 0.7, sh.current.p))
    fx.set('reach', size.width / size.height < 1 ? 0.26 : 0.32)
    fx.set('maxR', light ? 10 : 16)
  })
  return (
    <EffectComposer multisampling={light ? 0 : 4} enableNormalPass={false}>
      <Bloom intensity={light ? 0.85 : 1.15} luminanceThreshold={0.85} luminanceSmoothing={0.35} mipmapBlur />
      <primitive object={fx} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.3} darkness={0.55} />
    </EffectComposer>
  )
}

const BEATS = [0.1, 0.28, 0.5, 0.7]
const beatOf = (p: number) => BEATS.reduce((n, b, i) => (p >= b ? i : n), -1)

export default function Scene({ film, dish }: { film: Film | null; dish: Dish | null }) {
  const reduced = useReducedMotion()
  const light = useTier() === 'light'
  const host = useRef<HTMLDivElement>(null)
  const inView = useInView(host)
  const prog = useRef(0)
  const sh = useRef<Shared>({ p: 0, reduced })
  const focus = useRef<Focus>({ y: 0.4 })
  const [beat, setBeat] = useState(-1)
  sh.current.reduced = reduced

  useGSAP(() => {
    const wrap = document.getElementById('ts-wrap')
    if (!wrap) return
    const intro = document.getElementById('ts-intro')
    const trig = ScrollTrigger.create({
      trigger: wrap, start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: (self) => { prog.current = self.progress; setBeat((b) => { const n = beatOf(self.progress); return n === b ? b : n }) },
    })
    const tl = gsap.timeline({ scrollTrigger: { trigger: wrap, start: 'top top', end: '10% top', scrub: true } })
    if (intro) tl.to(intro, { yPercent: -30, autoAlpha: 0, ease: 'none' }, 0)
    return () => { trig.kill(); tl.scrollTrigger?.kill(); tl.kill() }
  }, [])

  const shown = reduced ? 3 : beat
  const posterUrl = film?.posterUrl ?? null

  return (
    <div ref={host} className="ts-scene">
      <Canvas
        frameloop={reduced ? 'demand' : inView ? 'always' : 'never'}
        dpr={light ? [1, 1.5] : [1, 2]}
        shadows={!light}
        camera={{ fov: light ? 32 : 24, near: 0.5, far: 150, position: [-10, 6, 16] }}
        gl={{ antialias: false, powerPreference: 'high-performance', toneMapping: THREE.NoToneMapping }}
        onCreated={({ invalidate }) => { for (const ms of [150, 600, 1500, 3000]) setTimeout(invalidate, ms) }}
      >
        <Sky sh={sh} />
        <Lighting sh={sh} cast={!light} />
        <Suspense fallback={null}>
          <Street cast={!light} />
          <Windows sh={sh} />
          <Lamps sh={sh} cast={!light} lights />
          <People sh={sh} cast={!light} />
          <Room sh={sh} posterUrl={posterUrl} lights />
        </Suspense>
        <Rig sh={sh} prog={prog} focus={focus} />
        <Post focus={focus} light={light} sh={sh} />
      </Canvas>

      <div className="ts-caps" aria-live="polite">
        <div className={`ts-cap ${shown === 0 ? 'on' : ''}`}><p className="ts-cap-h">Lamps first, then the windows, one by one.</p><p className="ts-cap-s">Dusk turns to night on Number 14&rsquo;s street.</p></div>
        <div className={`ts-cap ${shown === 1 ? 'on' : ''}`}><p className="ts-cap-h">Six guests, one door.</p><p className="ts-cap-s">Everyone walks a little faster at this scale.</p></div>
        <div className={`ts-cap ${shown === 2 ? 'on' : ''}`}>
          <p className="ts-cap-h">{dish ? <>On the table: {dish.name}</> : 'The table is laid.'}</p>
          {dish && <p className="ts-cap-s">{dish.category} &middot; rated {dish.rating} of 5</p>}
        </div>
        <div className={`ts-cap ${shown >= 3 ? 'on' : ''}`}>
          <p className="ts-cap-h">{film ? <>On the wall: {film.title}</> : 'Then the film.'}</p>
          {film && <p className="ts-cap-s">Rated {film.rating} of 5, and the projector is warm.</p>}
        </div>
      </div>
    </div>
  )
}
