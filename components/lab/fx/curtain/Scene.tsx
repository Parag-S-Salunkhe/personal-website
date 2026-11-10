'use client'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useInView, useReducedMotion, useTier } from '@/components/lab/kit/hooks'
import { Suspense } from 'react'
import { beamFrag, beamVert, curtainFrag, curtainVert } from './shaders'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const C = { velvet: '#2B0B14', curtain: '#6B1A2B', brass: '#D8A84E', beam: '#FFF3D6', tung: '#FF9F43', seat: '#1F5C5A' }
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const mix = (a: number, b: number, t: number) => a + (b - a) * t

// Stage geometry (world units). Curtain plane at z=0, hem on the stage floor.
const TOP = 2.4, H = 4.3, FLOOR_Y = -1.95

type Shared = {
  progress: { current: number }
  pointer: { x: number; y: number; moved: number }
  rm: boolean
  light: boolean
  poster: string
  fontFamily: string
}

function useCurtainMaterials(light: boolean) {
  return useMemo(() => {
    const col = (h: string) => ({ value: new THREE.Color(h) })
    const shared = {
      uTime: { value: 0 }, uOpen: { value: 0 }, uHW: { value: 4.5 }, uTop: { value: TOP }, uH: { value: H },
      uPE: { value: 0 }, uPointer: { value: new THREE.Vector2(9, 9) }, uSpot: { value: new THREE.Vector2(0, 0) },
      uHouse: { value: 0 }, uVH: { value: 1.0 }, uFoldN: { value: 6 }, uSway: { value: 1 }, uScal: { value: 10 },
      cVelvet: col(C.velvet), cCurtain: col(C.curtain), cBrass: col(C.brass), cTung: col(C.tung), cBeam: col(C.beam),
    }
    const mk = (side: number, kind: number, z: number) =>
      new THREE.ShaderMaterial({
        vertexShader: curtainVert, fragmentShader: curtainFrag, side: THREE.DoubleSide,
        uniforms: { ...shared, uSide: { value: side }, uKind: { value: kind }, uZ: { value: z } },
      })
    const segs: [number, number] = light ? [90, 44] : [200, 90]
    return {
      shared,
      left: mk(-1, 0, 0), right: mk(1, 0, 0), valance: mk(1, 1, 0.3),
      geo: new THREE.PlaneGeometry(1, 1, segs[0], segs[1]),
      valGeo: new THREE.PlaneGeometry(1, 1, light ? 120 : 260, 8),
    }
  }, [light])
}

function marqueeCanvas() {
  const c = document.createElement('canvas')
  c.width = 1024; c.height = 256
  return c
}

function drawMarquee(c: HTMLCanvasElement, t: number, family: string) {
  const g = c.getContext('2d')!
  const W = c.width, Hh = c.height
  const bg = g.createLinearGradient(0, 0, 0, Hh)
  bg.addColorStop(0, '#3a1019'); bg.addColorStop(1, C.velvet)
  g.fillStyle = bg; g.fillRect(0, 0, W, Hh)
  g.strokeStyle = C.brass; g.lineWidth = 10; g.strokeRect(14, 14, W - 28, Hh - 28)
  g.lineWidth = 3; g.strokeRect(34, 34, W - 68, Hh - 68)
  // chasing bulbs around the border
  const n = 44
  for (let i = 0; i < n; i++) {
    const on = (i + Math.floor(t * 7)) % 3 === 0
    const px = i < n / 2 ? 40 + (i / (n / 2 - 1)) * (W - 80) : 40 + ((i - n / 2) / (n / 2 - 1)) * (W - 80)
    for (const py of i < n / 2 ? [24] : [Hh - 24]) {
      g.beginPath(); g.arc(px, py, on ? 7 : 5, 0, 7)
      g.fillStyle = on ? '#FFF3D6' : '#8a6a2c'
      if (on) { g.shadowColor = C.tung; g.shadowBlur = 16 }
      g.fill(); g.shadowBlur = 0
    }
  }
  g.fillStyle = C.beam
  g.textAlign = 'center'; g.textBaseline = 'middle'
  g.font = `900 150px ${family || 'Impact'}, Impact, 'Arial Narrow', sans-serif`
  g.shadowColor = C.tung; g.shadowBlur = 28
  g.fillText('TONIGHT', W / 2, Hh / 2 + 8)
  g.shadowBlur = 0
}

function Theatre({ s }: { s: Shared }) {
  const { light, rm } = s
  const { camera, size } = useThree()
  const mats = useCurtainMaterials(light)
  const poster = useTexture(s.poster)
  poster.colorSpace = THREE.SRGBColorSpace
  poster.anisotropy = 4
  const posterMat = useRef<THREE.MeshStandardMaterial>(null)
  const mqMat = useRef<THREE.MeshBasicMaterial>(null)
  const beamMat = useRef<THREE.ShaderMaterial>(null)
  const beamMesh = useRef<THREE.Mesh>(null)
  const ambient = useRef<THREE.AmbientLight>(null)
  const spot = useRef<THREE.SpotLight>(null)
  const halos = useRef<THREE.InstancedMesh>(null)
  const bulbs = useRef<THREE.InstancedMesh>(null)
  const marquee = useRef<{ c: HTMLCanvasElement; tex: THREE.CanvasTexture } | null>(null)
  const sim = useRef({ o: 0, v: 0, p: 0, pe: 0, time: 0, px: 9, py: 9, lastMq: -1, chase: 0, cam: 7 })

  const aspect = size.width / size.height
  const narrow = aspect < 1
  const hw = Math.min(6.2, Math.max(1.25, Math.tan((20 * Math.PI) / 180) * 7.7 * aspect))

  const mq = useMemo(() => {
    const c = marqueeCanvas()
    drawMarquee(c, 0, s.fontFamily)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return { c, tex }
  }, [s.fontFamily])
  marquee.current = mq

  useEffect(() => {
    let alive = true
    if (document.fonts && s.fontFamily) {
      document.fonts.load(`900 100px ${s.fontFamily}`, 'TONIGHT').then(() => { if (alive) { drawMarquee(mq.c, 0, s.fontFamily); mq.tex.needsUpdate = true } }).catch(() => {})
    }
    return () => { alive = false }
  }, [mq, s.fontFamily])

  const backdrop = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512
    const g = c.getContext('2d')!
    const base = g.createLinearGradient(0, 0, 0, 512)
    base.addColorStop(0, '#0a2223'); base.addColorStop(0.6, '#184a49'); base.addColorStop(1, '#0d2a2b')
    g.fillStyle = base; g.fillRect(0, 0, 512, 512)
    for (let i = 0; i < 32; i++) { // draped back-curtain pleats
      const x = (i / 32) * 512
      const gr = g.createLinearGradient(x, 0, x + 16, 0)
      gr.addColorStop(0, 'rgba(0,0,0,0.38)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.07)'); gr.addColorStop(1, 'rgba(0,0,0,0.38)')
      g.fillStyle = gr; g.fillRect(x, 0, 16, 512)
    }
    const rg = g.createRadialGradient(256, 330, 10, 256, 330, 330)
    rg.addColorStop(0, 'rgba(255,150,70,0.16)'); rg.addColorStop(1, 'rgba(0,0,0,0.5)')
    g.fillStyle = rg; g.fillRect(0, 0, 512, 512)
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])

  const halo = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 64
    const g = c.getContext('2d')!
    const r = g.createRadialGradient(32, 32, 0, 32, 32, 32)
    r.addColorStop(0, 'rgba(255,200,120,1)'); r.addColorStop(0.3, 'rgba(255,159,67,0.45)'); r.addColorStop(1, 'rgba(255,159,67,0)')
    g.fillStyle = r; g.fillRect(0, 0, 64, 64)
    return new THREE.CanvasTexture(c)
  }, [])

  const beamGeo = useMemo(() => { const g = new THREE.ConeGeometry(1.7, 6, 40, 1, true); g.translate(0, -3, 0); return g }, [])
  const footCount = Math.max(7, Math.round((hw * 2) / 0.6))

  useEffect(() => {
    const dummy = new THREE.Object3D()
    for (let i = 0; i < footCount; i++) {
      const x = ((i + 0.5) / footCount - 0.5) * 2 * hw * 0.98
      dummy.position.set(x, FLOOR_Y + 0.15, 1.6); dummy.scale.setScalar(1); dummy.updateMatrix()
      bulbs.current?.setMatrixAt(i, dummy.matrix)
      dummy.position.set(x, FLOOR_Y + 0.28, 1.7); dummy.scale.setScalar(0.95); dummy.updateMatrix()
      halos.current?.setMatrixAt(i, dummy.matrix)
    }
    if (bulbs.current) bulbs.current.instanceMatrix.needsUpdate = true
    if (halos.current) halos.current.instanceMatrix.needsUpdate = true
  }, [footCount, hw])

  useEffect(() => {
    const m = beamMesh.current
    if (!m) return
    const from = new THREE.Vector3(0, 4.6, -0.4), to = new THREE.Vector3(0, -0.4, -1.2)
    m.position.copy(from)
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), to.sub(from).normalize())
  }, [beamGeo])

  useEffect(() => () => { mats.geo.dispose(); mats.valGeo.dispose(); mats.left.dispose(); mats.right.dispose(); mats.valance.dispose(); beamGeo.dispose() }, [mats, beamGeo])

  const cam = camera as THREE.PerspectiveCamera
  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const q = sim.current
    if (!rm) q.time += dt
    const t = rm ? 2.3 : q.time
    const pT = rm ? 0.7 : s.progress.current
    q.p += (pT - q.p) * (1 - Math.exp(-dt * 9))
    const p = q.p

    // curtain opening: eased target + under-damped spring for the overshoot/settle
    let tgt = ease(clamp01((p - 0.03) / 0.32))
    if (p > 0.82) tgt = mix(tgt, 0.4, ease((p - 0.82) / 0.18))
    if (rm) { q.o = 0.94; q.v = 0 } else {
      q.v += (55 * (tgt - q.o) - 6.5 * q.v) * dt
      q.o += q.v * dt
    }
    const push = ease(clamp01((p - 0.35) / 0.3))
    const back = ease(clamp01((p - 0.82) / 0.18))
    const house = rm ? 0.2 : ease(clamp01((p - 0.82) / 0.18))
    const swing = ease(clamp01((p - 0.62) / 0.2)) * (1 - back)

    // pointer
    const pr = s.pointer
    q.pe = Math.max(0, q.pe + pr.moved - dt * q.pe * 1.4)
    q.pe = Math.min(q.pe, 1.2)
    pr.moved = 0
    let camZ = mix(mix(7.4, 6.7, clamp01(p / 0.35)), (narrow ? 5.0 : 4.5), push)
    camZ = mix(camZ, narrow ? 6.2 : 5.4, back)
    q.cam += (camZ - q.cam) * (1 - Math.exp(-dt * 6))
    const lookY = mix(-0.1, 0.25, push)
    const driftX = rm ? 0 : Math.sin(t * 0.25) * 0.12
    cam.position.set(driftX, 0.3, q.cam)
    cam.lookAt(0, lookY, 0)
    const halfH = Math.tan((cam.fov * Math.PI) / 360) * q.cam
    const tx = pr.x * halfH * aspect, ty = lookY + pr.y * halfH
    q.px += (tx - q.px) * (1 - Math.exp(-dt * 10)); q.py += (ty - q.py) * (1 - Math.exp(-dt * 10))

    const u = mats.shared
    u.uTime.value = t
    u.uOpen.value = q.o
    u.uHW.value = hw
    u.uFoldN.value = Math.min(9, Math.max(4, hw * 1.35))
    u.uScal.value = Math.max(4, Math.floor((hw * 2) / 0.9))
    u.uPE.value = rm ? 0 : q.pe
    u.uPointer.value.set(q.px, q.py)
    u.uHouse.value = house
    u.uSway.value = rm ? 0 : 1
    const sweep = rm ? 0.2 : Math.sin(t * 0.55)
    u.uSpot.value.set(mix(sweep * hw * 0.6, 0, ease(clamp01((p - 0.03) / 0.3))), 0)

    if (posterMat.current) posterMat.current.emissiveIntensity = rm ? 0.5 : mix(0.12, 0.55, ease(clamp01((p - 0.2) / 0.3)))
    if (beamMat.current) beamMat.current.uniforms.uI.value = rm ? 1 : mix(0.35, 1.1, ease(clamp01((p - 0.1) / 0.3)))
    if (ambient.current) ambient.current.intensity = 0.25 + house * 0.9
    if (spot.current) spot.current.intensity = (rm ? 55 : mix(25, 70, ease(clamp01((p - 0.15) / 0.4)))) * (1 - house * 0.3)

    if (beamMesh.current) {
      const from = new THREE.Vector3(0, 4.6, -0.4), to = new THREE.Vector3(0, mix(-0.4, 1.4, swing), -1.3)
      beamMesh.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), to.sub(from).normalize())
    }
    if (mqMat.current) mqMat.current.color.setScalar(rm ? 1 : mix(1, 1.9, swing))
    q.chase += dt * (7 + 10 * swing)
    if (!rm && marquee.current && t - q.lastMq > 0.14) {
      q.lastMq = t
      drawMarquee(marquee.current.c, q.chase / 7, s.fontFamily)
      marquee.current.tex.needsUpdate = true
    }
  })

  const pw = narrow ? 1.3 : 1.8, ph = pw * 1.5
  const mqW = narrow ? 2.0 : 3.6
  const footC = useMemo(() => new THREE.Color(C.tung).multiplyScalar(light ? 2 : 3.2), [light])
  const stageW = Math.max(16, hw * 3)

  return (
    <>
      <color attach="background" args={[C.velvet]} />
      <ambientLight ref={ambient} intensity={0.25} color="#ffd9b5" />
      <spotLight ref={spot} position={[0, 4, 1.2]} angle={0.5} penumbra={1} intensity={40} color={C.beam} distance={14} decay={1.6} target-position={[0, -0.6, -1.2]} />
      <pointLight position={[0, FLOOR_Y + 0.9, 1.4]} intensity={14} distance={9} color={C.tung} />

      {/* the two curtain halves + valance */}
      <mesh geometry={mats.geo} material={mats.left} frustumCulled={false} />
      <mesh geometry={mats.geo} material={mats.right} frustumCulled={false} />
      <mesh geometry={mats.valGeo} material={mats.valance} frustumCulled={false} />

      {/* stage behind */}
      <mesh position={[0, 1.2, -4.2]}><planeGeometry args={[stageW, 9]} /><meshBasicMaterial map={backdrop} toneMapped={false} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y - 0.01, -1.5]}><planeGeometry args={[stageW, 11]} /><meshStandardMaterial color="#4a2a1c" roughness={0.38} metalness={0.15} /></mesh>
      <group position={[0, 0, -1.4]} scale={narrow ? 1 : 1}>
        <mesh position={[0, 1.42, 0]}><planeGeometry args={[mqW, mqW / 4]} /><meshBasicMaterial ref={mqMat} map={mq.tex} toneMapped={false} /></mesh>
        <mesh position={[0, -0.62, 0.0]}>
          <planeGeometry args={[pw + 0.14, ph + 0.14]} /><meshStandardMaterial color={C.brass} metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[0, -0.62, 0.02]}>
          <planeGeometry args={[pw, ph]} />
          <meshStandardMaterial ref={posterMat} map={poster} emissiveMap={poster} emissive="#ffffff" emissiveIntensity={0.2} roughness={0.7} />
        </mesh>
      </group>
      <mesh ref={beamMesh} geometry={beamGeo} renderOrder={5}>
        <shaderMaterial ref={beamMat} vertexShader={beamVert} fragmentShader={beamFrag} transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide}
          uniforms={{ uColor: { value: new THREE.Color(C.beam) }, uI: { value: 0.6 } }} />
      </mesh>

      {/* footlights along the stage lip */}
      <mesh position={[0, FLOOR_Y + 0.02, 1.55]}><boxGeometry args={[hw * 2.05, 0.06, 0.24]} /><meshStandardMaterial color={C.brass} metalness={0.8} roughness={0.3} /></mesh>
      <instancedMesh ref={bulbs} args={[undefined, undefined, footCount]} frustumCulled={false}>
        <sphereGeometry args={[0.075, 14, 10]} /><meshBasicMaterial color={footC} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={halos} args={[undefined, undefined, footCount]} frustumCulled={false}>
        <planeGeometry args={[0.62, 0.62]} /><meshBasicMaterial map={halo} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.5} />
      </instancedMesh>

      {!light && (
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur luminanceThreshold={1.05} intensity={0.8} radius={0.7} />
          <Vignette eskil={false} offset={0.25} darkness={0.6} />
        </EffectComposer>
      )}
    </>
  )
}

export default function Scene({ poster }: { poster: string }) {
  const rm = useReducedMotion()
  const tier = useTier()
  const light = tier === 'light'
  const host = useRef<HTMLDivElement>(null)
  const inView = useInView(host, '100px')
  const progress = useRef(0)
  const pointer = useRef({ x: 0, y: 0, moved: 0 })
  const fontFamily = useMemo(() => (typeof document === 'undefined' ? '' : getComputedStyle(document.getElementById('curtain-wrap') ?? document.body).getPropertyValue('--font-display').trim()), [])

  useGSAP(() => {
    const wrap = document.getElementById('curtain-wrap')
    if (!wrap) return
    const intro = wrap.querySelector('.cu-intro'), tonight = wrap.querySelector('.cu-tonight')
    if (rm) {
      gsap.set(intro, { opacity: 0 }); gsap.set(tonight, { opacity: 1, y: 0 })
      progress.current = 0.7
      return
    }
    gsap.set(tonight, { opacity: 0, y: 28 })
    ScrollTrigger.create({ trigger: wrap, start: 'top top', end: 'bottom bottom', onUpdate: (self) => { progress.current = self.progress }, onRefresh: (self) => { progress.current = self.progress } })
    const tl = gsap.timeline({ scrollTrigger: { trigger: wrap, start: 'top top', end: 'bottom bottom', scrub: true } })
    tl.to(intro, { opacity: 0, y: -30, duration: 0.07, ease: 'none' }, 0.01)
      .to(tonight, { opacity: 1, y: 0, duration: 0.1, ease: 'power2.out' }, 0.45)
  }, { dependencies: [rm] })

  useEffect(() => {
    let lx = 0, ly = 0
    const on = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1, ny = -((e.clientY / window.innerHeight) * 2 - 1)
      pointer.current.moved += Math.hypot(nx - lx, ny - ly) * 3.5
      pointer.current.x = lx = nx; pointer.current.y = ly = ny
    }
    window.addEventListener('pointermove', on)
    window.__labDemoSteps = [
      { type: 'move', x: 0.25, y: 0.3, ms: 500 }, { type: 'move', x: 0.75, y: 0.4, ms: 700 },
      { type: 'move', x: 0.5, y: 0.7, ms: 600 }, { type: 'move', x: 0.2, y: 0.55, ms: 600 }, { type: 'move', x: 0.8, y: 0.25, ms: 700 },
    ]
    return () => { window.removeEventListener('pointermove', on); window.__labDemoSteps = undefined }
  }, [])

  return (
    <div ref={host} className="absolute inset-0" aria-hidden>
      <Canvas
        dpr={light ? [1, 1.5] : [1, 2]}
        flat
        frameloop={inView ? 'always' : 'never'}
        camera={{ fov: 40, position: [0, 0.3, 7.4], near: 0.1, far: 60 }}
        gl={{ powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <Theatre s={{ progress, pointer: pointer.current, rm, light, poster, fontFamily }} />
        </Suspense>
      </Canvas>
    </div>
  )
}
