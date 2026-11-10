'use client'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, Group, type PerspectiveCamera } from 'three'
import { useInView, useReducedMotion, useTier } from '@/components/lab/kit/hooks'
import Word from './Word'
import Room, { OFF_Y, layoutFor } from './Room'
import { backdropTexture, wordTexture, type Fonts } from './paint'
import { rng } from './rng'

gsap.registerPlugin(ScrollTrigger, useGSAP)

type Store = { target: number; cur: number; tpx: number; tpy: number; px: number; py: number }
type Dish = { name: string; category: string }
const D = 12
const sstep = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

function ui() {
  const cache: Record<string, string> = {}
  const els: Record<string, HTMLElement | null> = {}
  return (name: string, v: number) => {
    const s = v.toFixed(3)
    if (cache[name] === s) return
    cache[name] = s
    const el = (els[name] ??= document.querySelector<HTMLElement>(`[data-ill="${name}"]`))
    if (el) { el.style.opacity = s; el.style.visibility = v < 0.01 ? 'hidden' : 'visible' }
  }
}

function Motes({ count }: { count: number }) {
  const geo = useMemo(() => {
    const r = rng(9), a: number[] = []
    for (let i = 0; i < count; i++) a.push((r() - 0.5) * 44, (r() - 0.5) * 18, -12 + r() * 28)
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(a, 3)); return g
  }, [count])
  const ref = useRef<Group>(null)
  useFrame(({ clock }) => { if (ref.current) { ref.current.rotation.y = clock.elapsedTime * 0.02; ref.current.position.y = Math.sin(clock.elapsedTime * 0.3) * 0.3 } })
  useEffect(() => () => geo.dispose(), [geo])
  return <group ref={ref}><points geometry={geo}><pointsMaterial size={0.1} color="#F6B94F" transparent opacity={0.65} depthWrite={false} blending={AdditiveBlending} sizeAttenuation /></points></group>
}

function Inner({ store, fonts, dishes, posterSrc, rm, light }: { store: React.RefObject<Store>; fonts: Fonts; dishes: Dish[]; posterSrc: string | null; rm: boolean; light: boolean }) {
  const size = useThree((s) => s.size)
  const aspect = size.width / size.height
  const portrait = aspect < 0.9
  const layout = useMemo(() => layoutFor(portrait), [portrait])
  const fovA = portrait ? 62 : 42
  const wordW = useMemo(() => {
    const viewW = 2 * D * Math.tan((fovA * Math.PI) / 360) * aspect
    return Math.min(portrait ? viewW * 0.9 : viewW * 0.64, 16)
  }, [aspect, fovA, portrait])
  const wTex = useMemo(() => wordTexture('Dinner', fonts), [fonts])
  const bd = useMemo(() => backdropTexture(), [])
  useEffect(() => () => { wTex.dispose(); bd.dispose() }, [wTex, bd])

  const A = useRef<Group>(null), B = useRef<Group>(null)
  const focus = useRef({ v: 0 })
  const write = useMemo(ui, [])

  useFrame((state, dt) => {
    const s = store.current
    s.cur += (s.target - s.cur) * (rm ? 1 : 1 - Math.exp(-dt * 6))
    const k = 1 - Math.exp(-dt * 4)
    s.px += (s.tpx - s.px) * k; s.py += (s.tpy - s.py) * k
    const p = s.cur
    const cam = state.camera as PerspectiveCamera
    const inA = p < 0.5
    if (A.current) A.current.visible = inA
    if (B.current) B.current.visible = !inA
    if (inA) {
      const d = (Math.min(p / 0.5, 1) - 0.5) * 2
      const f = d * Math.abs(d)
      const fo = 1 - sstep(0.012, 0.07, Math.abs(f))
      focus.current.v = fo
      const pw = rm ? 0 : 1 - fo
      cam.fov = fovA
      cam.position.set(-14 * f + s.px * 2.2 * pw, 4.5 * f + 2.5 * f * f + s.py * 1.2 * pw, D + 8 * f * f)
      cam.lookAt(0, 0, 0)
    } else {
      const u = Math.min((p - 0.5) / 0.5, 1)
      const e = u * 0.65 + u * u * (3 - 2 * u) * 0.35
      const dist = 16 + (4.5 - 16) * e
      const pw = rm ? 0 : 1
      cam.fov = (2 * Math.atan(layout.k / dist) * 180) / Math.PI
      cam.position.set(Math.sin(u * 3.4) * 1.7 + s.px * 1.3 * pw, OFF_Y + layout.lookY + Math.sin(u * 2.2) * 0.5 + s.py * 0.8 * pw, dist)
      cam.lookAt(0, OFF_Y + layout.lookY, 0)
    }
    cam.updateProjectionMatrix()
    write('veil', 1 - sstep(0.02, 0.07, Math.abs(p - 0.5)))
    write('cap0', 1 - sstep(0.07, 0.14, p))
    write('cap1', sstep(0.15, 0.2, p) * (1 - sstep(0.3, 0.35, p)))
    write('cap2', sstep(0.62, 0.7, p))
  })

  return (
    <>
      <color attach="background" args={['#10281F']} />
      <group ref={A}>
        <mesh position={[0, 0, -34]} scale={[160, 90, 1]}><planeGeometry /><meshBasicMaterial map={bd} depthWrite={false} toneMapped={false} /></mesh>
        <Word tex={wTex} width={wordW} D={D} focus={focus.current} />
        <Motes count={light ? 50 : 130} />
      </group>
      <group ref={B} visible={false}>
        <Suspense fallback={null}><Room layout={layout} aspect={aspect} fonts={fonts} dishes={dishes} posterSrc={posterSrc} /></Suspense>
      </group>
    </>
  )
}

export default function Scene({ dishes, posterSrc }: { dishes: Dish[]; posterSrc: string | null }) {
  const rm = useReducedMotion()
  const tier = useTier()
  const holder = useRef<HTMLDivElement>(null)
  const inView = useInView(holder)
  const store = useRef<Store>({ target: 0, cur: 0, tpx: 0, tpy: 0, px: 0, py: 0 })
  const [fonts, setFonts] = useState<Fonts | null>(null)

  useEffect(() => {
    let dead = false
    const root = document.querySelector('[data-ill-root]') ?? document.body
    const cs = getComputedStyle(root)
    const display = (cs.getPropertyValue('--font-gilda').trim() || 'Georgia') + ', Georgia, serif'
    const body = (cs.getPropertyValue('--font-hanken').trim() || 'system-ui') + ', system-ui, sans-serif'
    Promise.all([document.fonts.load(`80px ${display}`, 'Dinner'), document.fonts.load(`500 20px ${body}`)]).catch(() => {}).finally(() => { if (!dead) setFonts({ display, body }) })
    return () => { dead = true }
  }, [])

  useGSAP(() => {
    const wrap = document.getElementById('ill-wrap')
    if (!wrap) return
    const s = store.current
    if (rm) {
      const onScroll = () => {
        const max = wrap.offsetHeight - window.innerHeight
        const p = max > 0 ? (window.scrollY - wrap.offsetTop) / max : 0
        s.target = p < 0.5 ? 0.25 : 0.8
      }
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }
    const st = ScrollTrigger.create({ trigger: wrap, start: 'top top', end: 'bottom bottom', onUpdate: (self) => { s.target = self.progress }, onRefresh: (self) => { s.target = self.progress } })
    return () => st.kill()
  }, { dependencies: [rm] })

  useEffect(() => {
    if (rm) return
    const s = store.current
    const move = (e: PointerEvent) => { s.tpx = (e.clientX / window.innerWidth - 0.5) * 2; s.tpy = -(e.clientY / window.innerHeight - 0.5) * 2 }
    window.addEventListener('pointermove', move, { passive: true })
    window.__labDemoSteps = [
      { type: 'move', x: 0.5, y: 0.5, ms: 200 },
      { type: 'move', x: 0.05, y: 0.25, ms: 900 },
      { type: 'move', x: 0.95, y: 0.8, ms: 1500 },
      { type: 'move', x: 0.3, y: 0.9, ms: 900 },
      { type: 'move', x: 0.5, y: 0.5, ms: 600 },
    ]
    return () => { window.removeEventListener('pointermove', move); delete window.__labDemoSteps }
  }, [rm])

  const light = tier === 'light'
  return (
    <div ref={holder} className="absolute inset-0">
      {fonts && (
        <Canvas dpr={light ? [1, 1.5] : [1, 2]} frameloop={inView ? 'always' : 'never'} camera={{ fov: 42, near: 0.1, far: 300, position: [8, 2, 20] }} gl={{ antialias: true }} style={{ position: 'absolute', inset: 0 }}>
          <Inner store={store} fonts={fonts} dishes={dishes} posterSrc={posterSrc} rm={rm} light={light} />
        </Canvas>
      )}
    </div>
  )
}
