'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useReducedMotion, useTier } from '@/components/lab/kit/hooks'
import { frag, vert } from './shader'
import { drawDishCard, type DishArt } from './dishArt'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export type GalleryData = { posters: string[]; dishes: DishArt[] }
type Item = { kind: 'poster' | 'dish'; i: number; n: number; j: number; url?: string; dish?: DishArt }
type Sc = { p: number; v: number }

function layout(item: Item, W: number, H: number, mobile: boolean, p: number, counts: [number, number]) {
  if (mobile) {
    const w = Math.min(W * 0.72, H * 0.4), h = w * 1.5, gap = h * 0.08
    const total = (counts[0] + counts[1]) * (h + gap) - gap
    const travel = Math.max(0, total + H * 0.22 - H)
    return { x: 0, y: H / 2 - H * 0.12 - h / 2 - item.j * (h + gap) + travel * p, w, h }
  }
  const rh = H * 0.38, w = rh * (2 / 3), gap = w * 0.14, pad = W * 0.07
  const n = item.kind === 'poster' ? counts[0] : counts[1]
  const travel = Math.max(0, n * (w + gap) - gap + 2 * pad - W)
  const off = item.kind === 'poster' ? -travel * p : -travel * (1 - p)
  return { x: -W / 2 + pad + w / 2 + item.i * (w + gap) + off, y: item.kind === 'poster' ? H * 0.2 : -H * 0.2, w: w, h: rh }
}

function useTexture(item: Item, onLoad: () => void) {
  const [tex, setTex] = useState<THREE.Texture | null>(null)
  useEffect(() => {
    let dead = false, t: THREE.Texture | null = null
    const done = (x: THREE.Texture) => { x.colorSpace = THREE.SRGBColorSpace; x.anisotropy = 4; x.needsUpdate = true; if (dead) { x.dispose(); return } t = x; setTex(x); onLoad() }
    if (item.kind === 'dish' && item.dish) done(new THREE.CanvasTexture(drawDishCard(item.dish)))
    else if (item.url) new THREE.TextureLoader().load(item.url, done, undefined, () => onLoad())
    return () => { dead = true; t?.dispose() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.url, item.dish?.name])
  return tex
}

const EDGE = { poster: '#D8A84E', dish: '#F6B94F' }
const TINT = { poster: '#FF9F43', dish: '#FFF8EA' }

function Card({ item, sc, mobile, counts, onLoad }: { item: Item; sc: Sc; mobile: boolean; counts: [number, number]; onLoad: () => void }) {
  const tex = useTexture(item, onLoad)
  const group = useRef<THREE.Group>(null)
  const mesh = useRef<THREE.Mesh>(null)
  const size = useThree((s) => s.size)
  const texRef = useRef<THREE.Texture | null>(null)
  const st = useRef({ hov: 0, hovT: 0, s: 1, sv: 0 })
  const uniforms = useMemo(() => ({
    uTex: { value: null as THREE.Texture | null }, uPtr: { value: new THREE.Vector2(0.5, 0.5) }, uHov: { value: 0 }, uVel: { value: 0 }, uTime: { value: 0 },
    uAspect: { value: 2 / 3 }, uEdge: { value: new THREE.Color(EDGE[item.kind]) }, uTint: { value: new THREE.Color(TINT[item.kind]) },
  }), [item.kind])
  const mat = useRef<THREE.ShaderMaterial>(null)
  texRef.current = tex

  useFrame(({ clock }, dt) => {
    const g = group.current, m = mesh.current; if (!g || !m) return
    const U = (mat.current?.uniforms ?? uniforms) as typeof uniforms; U.uTex.value = texRef.current
    const L = layout(item, size.width, size.height, mobile, sc.p, counts)
    const s = st.current
    s.hov = THREE.MathUtils.damp(s.hov, s.hovT, 6, dt)
    // spring scale
    const target = 1 + s.hovT * 0.14, d = Math.min(dt, 0.033)
    s.sv += ((target - s.s) * 190 - s.sv * 13) * d; s.s += s.sv * d
    g.position.set(L.x, L.y, s.hovT * 40)
    m.scale.set(L.w * s.s, L.h * s.s, 1)
    const dir = !mobile && item.kind === 'dish' ? -1 : 1
    U.uVel.value = sc.v * dir; U.uHov.value = s.hov; U.uTime.value = clock.elapsedTime + item.i * 0.7
    U.uAspect.value = L.w / L.h
    m.visible = Math.abs(L.x) < size.width / 2 + L.w && Math.abs(L.y) < size.height / 2 + L.h
  })

  return (
    <group ref={group}>
      <mesh ref={mesh} visible={false}
        onPointerMove={(e) => { e.stopPropagation(); if (e.uv) ((mat.current?.uniforms ?? uniforms) as typeof uniforms).uPtr.value.copy(e.uv); st.current.hovT = 1 }}
        onPointerOver={(e) => { e.stopPropagation(); st.current.hovT = 1 }}
        onPointerOut={() => { st.current.hovT = 0 }}>
        <planeGeometry args={[1, 1, 28, 28]} />
        <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} />
      </mesh>
    </group>
  )
}

function Rig({ sc, wrap }: { sc: Sc; wrap: HTMLElement }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const last = useRef({ y: 0, ready: false })
  const target = useRef(0)
  useGSAP(() => {
    const st = ScrollTrigger.create({ trigger: wrap, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: (s) => { target.current = s.progress } })
    target.current = st.progress
    sc.p = st.progress
    return () => st.kill()
  }, { dependencies: [wrap] })
  useFrame((_, dt) => {
    camera.position.z = size.height / 2 / Math.tan((camera.fov * Math.PI) / 360)
    camera.near = 10; camera.far = camera.position.z + 2000; camera.updateProjectionMatrix()
    const d = Math.min(dt, 0.05) || 0.016
    sc.p = THREE.MathUtils.damp(sc.p, target.current, 7, d)
    const y = window.scrollY
    if (!last.current.ready) { last.current.y = y; last.current.ready = true }
    const raw = (y - last.current.y) / d / 420
    last.current.y = y
    sc.v = THREE.MathUtils.damp(sc.v, THREE.MathUtils.clamp(raw, -1.6, 1.6), 5, d)
  })
  return null
}

export default function Gallery({ data }: { data: GalleryData }) {
  const reduced = useReducedMotion()
  const tier = useTier()
  const [wrap, setWrap] = useState<HTMLElement | null>(null)
  const [mobile, setMobile] = useState(false)
  const [on, setOn] = useState(true)
  const loaded = useRef(0)
  const sc = useRef<Sc>({ p: 0, v: 0 }).current

  useEffect(() => {
    const w = document.querySelector<HTMLElement>('[data-wg-wrap]')
    setWrap(w)
    const mq = window.matchMedia('(max-width: 767px)')
    const f = () => setMobile(mq.matches); f(); mq.addEventListener('change', f)
    let io: IntersectionObserver | undefined
    if (w) { io = new IntersectionObserver(([e]) => setOn(e.isIntersecting)); io.observe(w) }
    return () => { mq.removeEventListener('change', f); io?.disconnect() }
  }, [])

  const items = useMemo<Item[]>(() => {
    const np = mobile ? Math.min(4, data.posters.length) : data.posters.length
    const nd = mobile ? Math.min(4, data.dishes.length) : data.dishes.length
    return [
      ...data.posters.slice(0, np).map((url, i): Item => ({ kind: 'poster', i, n: np, j: i, url })),
      ...data.dishes.slice(0, nd).map((dish, i): Item => ({ kind: 'dish', i, n: nd, j: np + i, dish })),
    ]
  }, [data, mobile])
  const counts: [number, number] = useMemo(() => [items.filter((x) => x.kind === 'poster').length, items.filter((x) => x.kind === 'dish').length], [items])

  useEffect(() => {
    window.__labDemoSteps = [
      { type: 'wait', ms: 300 },
      ...[0.14, 0.28, 0.42, 0.56].flatMap((x) => [{ type: 'move' as const, x, y: 0.3, ms: 450 }, { type: 'move' as const, x: x + 0.03, y: 0.34, ms: 500 }]),
      ...[0.2, 0.38, 0.55].flatMap((x) => [{ type: 'move' as const, x, y: 0.7, ms: 450 }, { type: 'move' as const, x: x + 0.03, y: 0.66, ms: 500 }]),
      { type: 'move', x: 0.5, y: 0.5, ms: 300 },
    ]
    return () => { delete window.__labDemoSteps }
  }, [])

  const onLoad = () => {
    loaded.current += 1
    if (loaded.current >= Math.min(items.length, 5)) wrap?.setAttribute('data-ready', '1')
  }

  if (reduced || !wrap) return null
  return (
    <Canvas className="!absolute inset-0 z-[1]" frameloop={on ? 'always' : 'never'} dpr={tier === 'light' ? [1, 1.5] : [1, 2]}
      camera={{ fov: 30, position: [0, 0, 1500] }} gl={{ alpha: true, antialias: true }}>
      <Rig sc={sc} wrap={wrap} />
      {items.map((it) => <Card key={`${it.kind}${it.i}${mobile}`} item={it} sc={sc} mobile={mobile} counts={counts} onLoad={onLoad} />)}
    </Canvas>
  )
}
