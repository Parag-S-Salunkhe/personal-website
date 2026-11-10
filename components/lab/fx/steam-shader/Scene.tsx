'use client'
import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { CanvasTexture, MathUtils, RepeatWrapping, SRGBColorSpace, Vector3 } from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useInView, useReducedMotion, useTier } from '@/components/lab/kit/hooks'
import Candle, { candleTop } from './Candle'
import Dish3D from './Dish3D'
import { HazeEffect } from './HazeEffect'
import { recipeFor } from './dishes'
import { evalStory, makeSim, type Sim } from './story'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export type SceneDish = { name: string; category: string; rating: number }

function weave(base: string, line: string): CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')!
  g.fillStyle = base; g.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 256; i += 2) {
    g.fillStyle = line; g.globalAlpha = i % 4 === 0 ? 0.18 : 0.08
    g.fillRect(i, 0, 1, 256); g.fillRect(0, i, 256, 1)
  }
  g.globalAlpha = 1
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace; t.wrapS = t.wrapT = RepeatWrapping
  return t
}

function Table() {
  const cloth = useMemo(() => { const t = weave('#17352A', '#0a1a14'); t.repeat.set(26, 26); return t }, [])
  const linen = useMemo(() => { const t = weave('#E9E3D3', '#a89f88'); t.repeat.set(12, 7); return t }, [])
  useEffect(() => () => { cloth.dispose(); linen.dispose() }, [cloth, linen])
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[60, 60]} /><meshStandardMaterial map={cloth} roughness={0.95} /></mesh>
      <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[18, 10]} /><meshStandardMaterial map={linen} roughness={0.9} color="#9C957F" /></mesh>
    </>
  )
}

const v = new Vector3()
function World({ dishes, sim, rm, onFrame }: { dishes: SceneDish[]; sim: Sim; rm: boolean; onFrame: (s: Sim) => void }) {
  const tier = useTier()
  const { camera, size } = useThree()
  const aspect = size.width / size.height
  const portrait = aspect < 1.1
  const candlePos: [number, number, number] = portrait ? [-1.55, 0, -1.7] : [-3.1, 0, -0.5]
  const recipes = useMemo(() => dishes.map((d) => recipeFor(d.name, d.category)), [dishes])
  const haze = useMemo(() => new HazeEffect(), [])
  const target = useRef(0)
  const lastP = useRef(-1)
  useEffect(() => () => haze.dispose(), [haze])

  // simulation first (priority -10), so plates, candle and haze all read this frame's state
  useFrame((state, dt) => {
    const clock = rm ? 4.2 : state.clock.elapsedTime
    sim.t = clock
    if (!rm) sim.intro = Math.min(1, sim.intro + dt / 1.1)
    else sim.intro = 1
    const goal = rm ? 0 : target.current
    sim.p = rm ? 0 : MathUtils.damp(sim.p, goal, 5, Math.min(dt, 0.05))
    lastP.current = sim.p
    evalStory(sim)
    // camera: framing by aspect, slow push-in as the candle burns down
    const vfov = (camera as { fov?: number }).fov ?? 36
    const tanH = Math.tan(MathUtils.degToRad(vfov / 2))
    const dist = (portrait ? MathUtils.clamp(4.6 / (2 * tanH * aspect), 8, 15) : 8.2) * (1 - 0.1 * sim.p)
    const dir = portrait ? [0, 0.7, 0.71] : [0, 0.56, 0.83]
    camera.position.set(Math.sin(sim.p * 5) * 0.35, dir[1] * dist, dir[2] * dist)
    camera.lookAt(portrait ? -0.1 : -0.6, portrait ? 2.1 : 1.3, 0)
    camera.updateMatrixWorld()
    onFrame(sim)
  }, -10)

  // haze columns follow the visible plates and the flame
  useFrame(({ camera: cam }) => {
    haze.time = sim.t
    haze.aspect = aspect
    const project = (x: number, y: number, z: number) => { v.set(x, y, z).project(cam); return [v.x * 0.5 + 0.5, v.y * 0.5 + 0.5] as const }
    let slot = 0
    sim.plates.forEach((pl) => {
      if (!pl.vis || slot > 1) return
      const b = project(pl.x, 0.3, 0), e = project(pl.x + 1.5, 0.3, 0), tp = project(pl.x, 3.4, 0)
      haze.src[slot].set(b[0], b[1], Math.abs(e[0] - b[0]), Math.abs(tp[1] - b[1]))
      haze.amp[slot] = 0.03 * pl.heat * pl.grow
      slot++
    })
    for (; slot < 2; slot++) haze.amp[slot] = 0
    const top = candleTop(sim.level) + 0.2
    const cb = project(candlePos[0], top, candlePos[2]), ce = project(candlePos[0] + 0.45, top, candlePos[2]), ct = project(candlePos[0], top + 2.4, candlePos[2])
    haze.src[2].set(cb[0], cb[1], Math.abs(ce[0] - cb[0]), Math.abs(ct[1] - cb[1]))
    haze.amp[2] = 0.018 * (0.3 + 0.7 * sim.level)
  })

  // scroll progress from the window scroll, via ScrollTrigger
  useGSAP(() => {
    if (rm) return
    const story = document.querySelector('[data-story]')
    if (!story) return
    const st = ScrollTrigger.create({ trigger: story, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: (self) => { target.current = self.progress } })
    target.current = st.progress
    return () => st.kill()
  }, { dependencies: [rm] })

  return (
    <>
      <color attach="background" args={['#0b1511']} />
      <fog attach="fog" args={['#0b1511', 16, 34]} />
      <hemisphereLight args={['#A9C3AE', '#17352A', 0.55]} />
      <directionalLight position={[2, 7, 5]} intensity={0.55} color="#F6D9A0" />
      <Table />
      <Candle sim={sim} position={candlePos} />
      {dishes.map((d, i) => <Dish3D key={i} recipe={recipes[i]} index={i} sim={sim} tier={tier} />)}
      <EffectComposer multisampling={tier === 'light' ? 0 : 4} resolutionScale={tier === 'light' ? 0.6 : 1}>
        <primitive object={haze} />
        <Bloom intensity={tier === 'light' ? 0.7 : 1.0} luminanceThreshold={0.62} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette offset={0.25} darkness={0.7} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </>
  )
}

function Wake({ rm }: { rm: boolean }) {
  const { invalidate } = useThree()
  useEffect(() => {
    if (!rm) return
    const ids = [60, 300, 900].map((ms) => window.setTimeout(invalidate, ms))
    return () => ids.forEach(clearTimeout)
  }, [rm, invalidate])
  return null
}

const temp = (h: number) => (h > 0.75 ? 'Hot' : h > 0.45 ? 'Warm' : h > 0.2 ? 'Cooling' : 'Cold')

export default function Scene({ dishes }: { dishes: SceneDish[] }) {
  const rm = useReducedMotion()
  const tier = useTier()
  const root = useRef<HTMLDivElement>(null)
  const inView = useInView(root, '100px')
  const sim = useMemo(() => makeSim(dishes.length), [dishes.length])
  const caps = useRef<(HTMLDivElement | null)[]>([])
  const tempEl = useRef<HTMLSpanElement | null>(null)
  const last = dishes.length - 1

  const onFrame = (s: Sim) => {
    s.plates.forEach((pl, i) => {
      const el = caps.current[i]
      if (!el) return
      el.style.opacity = String(pl.cap)
      el.style.transform = `translateY(${(1 - pl.cap) * 16}px)`
    })
    if (tempEl.current) tempEl.current.textContent = temp(s.plates[last]?.heat ?? 1)
  }

  return (
    <div ref={root} className="absolute inset-0" aria-hidden>
      <Canvas
        dpr={tier === 'light' ? [1, 1.5] : [1, 2]}
        camera={{ fov: 36, near: 0.1, far: 60, position: [0, 4.6, 6.8] }}
        frameloop={rm ? 'demand' : inView ? 'always' : 'never'}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <World dishes={dishes} sim={sim} rm={rm} onFrame={onFrame} />
        <Wake rm={rm} />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-6 pb-8 sm:px-12 sm:pb-12">
        <div className="relative h-24 sm:h-28">
          {dishes.map((d, i) => (
            <div key={i} ref={(el) => { caps.current[i] = el }} className="absolute inset-x-0 bottom-0" style={{ opacity: i === 0 ? 1 : 0 }}>
              <p className="text-4xl leading-none text-[#FFF8EA] sm:text-6xl" style={{ fontFamily: 'var(--font-gilda), serif', textShadow: '0 2px 22px rgba(0,0,0,.85)' }}>{d.name}</p>
              <p className="mt-2 text-base text-[#F1EEE6]" style={{ textShadow: '0 1px 12px rgba(0,0,0,.9)' }}>
                {d.category} · {d.rating}/5{i === last ? <> · <span ref={tempEl} className="text-[#F6B94F]">Hot</span></> : null}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
