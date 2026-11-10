'use client'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useInView, useReducedMotion, useTier } from '@/components/lab/kit/hooks'
import Projector, { flickerAt, type Ctl } from './Projector'
import { Beam, Screen, LENS, SCREEN } from './Beam'
import { bh, BEAM_START, PART_CAPTIONS, smooth, easeOutBack, type Film } from './types'

gsap.registerPlugin(ScrollTrigger, useGSAP)

// Scroll story (progress p of the 450vh wrapper):
// 0.00-0.07 turntable hero, 0.07-0.36 explode + part captions, 0.36-0.46 reassemble with overshoot,
// 0.46-0.53 lamp strikes, beam on; 0.53-1.00 camera swings behind the projector, posters cycle on the screen.
const EX_IN = [0.07, 0.2] as const
const EX_OUT = [0.36, 0.46] as const

function partIndex(p: number) {
  if (p < EX_IN[0] + 0.04 || p > EX_OUT[0]) return -1
  return Math.min(PART_CAPTIONS.length - 1, Math.floor(((p - (EX_IN[0] + 0.04)) / (EX_OUT[0] - EX_IN[0] - 0.04)) * PART_CAPTIONS.length))
}

function Rig({ ctl, prog, light }: { ctl: React.MutableRefObject<Ctl>; prog: React.MutableRefObject<number>; light: boolean }) {
  const { camera } = useThree()
  const s = useRef({ p: 0 })
  const tmp = useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3(), a: new THREE.Vector3(), b: new THREE.Vector3(), la: new THREE.Vector3(), lb: new THREE.Vector3() }), [])
  const turn = useRef<THREE.Group>(null)

  useFrame((state, dt) => {
    const c = ctl.current
    const target = c.reduced ? 0.8 : prog.current
    s.current.p = c.reduced ? target : THREE.MathUtils.damp(s.current.p, target, 5, dt)
    const p = s.current.p
    const t = state.clock.elapsedTime

    // explode out, hold, snap back with overshoot
    const out = smooth(EX_IN[0], EX_IN[1], p)
    const back = easeOutBack((p - EX_OUT[0]) / (EX_OUT[1] - EX_OUT[0]), 2.2)
    c.ex = p < EX_OUT[0] ? out : Math.max(0, 1 - back) * 1 + (back > 1 ? (1 - back) * 0.6 : 0)
    if (p >= EX_OUT[1]) c.ex = 0

    // beam strikes on with a stutter, then flickers at 24 fps
    const on = smooth(BEAM_START - 0.04, BEAM_START + 0.03, p)
    const strike = on > 0 && on < 1 && !c.reduced ? (Math.floor(t * 18) % 3 === 0 ? 0.15 : 1) : 1
    c.beam = on * strike
    c.flick = flickerAt(t, c.reduced)
    bh.idx = p < BEAM_START + 0.04 ? 0 : Math.min(4, Math.floor(((p - (BEAM_START + 0.04)) / (1 - BEAM_START - 0.04)) * 5))

    // turntable on the model while the hero holds; pointer adds a little yaw
    const yaw = (1 - smooth(0.0, 0.46, p)) * (t * 0.35 % (Math.PI * 2)) * (c.reduced ? 0 : 1)
    const settle = smooth(0.36, 0.46, p)
    if (turn.current) {
      const wanted = THREE.MathUtils.lerp(-0.55 + Math.sin(t * 0.3) * 0.12 + yaw * 0.25, 0, settle) + bh.pointerX * 0.18 * (1 - settle)
      turn.current.rotation.y = THREE.MathUtils.damp(turn.current.rotation.y, wanted, 4, dt)
    }

    // camera: three-quarter hero -> wider orbit for the exploded view -> behind-the-shoulder toward the screen
    const zoom = light ? 1.35 : 1
    tmp.a.set(1.7 * zoom, 0.75, 2.05 * zoom); tmp.la.set(0.1, 0.36, 0)
    tmp.b.set(-2.1 * zoom, 1.25, 1.2 * zoom); tmp.lb.set(0, 0.32, 0)
    const k1 = smooth(0.04, 0.22, p)
    tmp.pos.lerpVectors(tmp.a, tmp.b, k1); tmp.look.lerpVectors(tmp.la, tmp.lb, k1)
    const k2 = smooth(0.38, 0.6, p)
    tmp.a.set(0.55 * (light ? 0.5 : 1), 0.95, -1.7 * zoom); tmp.la.set(SCREEN.x, SCREEN.y - 0.1, SCREEN.z)
    tmp.pos.lerp(tmp.a, k2); tmp.look.lerp(tmp.la, k2)
    // breathing push while the film plays
    const k3 = smooth(0.6, 1, p)
    tmp.pos.z += k3 * 0.9; tmp.pos.y -= k3 * 0.15
    camera.position.copy(tmp.pos)
    camera.lookAt(tmp.look)
  })

  return (
    <group ref={turn}>
      <Projector ctl={ctl} />
    </group>
  )
}

function Lamp({ ctl }: { ctl: React.MutableRefObject<Ctl> }) {
  const pl = useRef<THREE.PointLight>(null)
  useFrame(() => { if (pl.current) pl.current.intensity = 2.5 * ctl.current.beam * ctl.current.flick })
  return <pointLight ref={pl} position={[LENS.x, LENS.y + 0.05, LENS.z + 0.25]} color="#FFD9A0" distance={4} decay={2} />
}

export default function Scene({ films }: { films: Film[] }) {
  const reduced = useReducedMotion()
  const tier = useTier()
  const light = tier === 'light'
  const host = useRef<HTMLDivElement>(null)
  const inView = useInView(host)
  const prog = useRef(0)
  const ctl = useRef<Ctl>({ ex: 0, yaw: 0, beam: 0, flick: 1, pointerK: 0, reduced })
  const [part, setPart] = useState(-1)
  const [film, setFilm] = useState(-1)

  useEffect(() => { ctl.current.reduced = reduced }, [reduced])

  useGSAP(() => {
    const wrap = document.getElementById('bh-wrap')
    if (!wrap) return
    const intro = document.getElementById('bh-intro')
    const hint = document.getElementById('bh-hint')
    const trig = ScrollTrigger.create({
      trigger: wrap, start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: (self) => {
        prog.current = self.progress
        setPart(partIndex(self.progress))
        setFilm(self.progress > BEAM_START + 0.04 ? Math.min(films.length - 1, Math.floor(((self.progress - (BEAM_START + 0.04)) / (1 - BEAM_START - 0.04)) * 5)) : -1)
      },
    })
    const tl = gsap.timeline({ scrollTrigger: { trigger: wrap, start: 'top top', end: '8% top', scrub: true } })
    if (intro) tl.to(intro, { yPercent: -40, autoAlpha: 0, ease: 'none' }, 0)
    if (hint) tl.to(hint, { autoAlpha: 0, ease: 'none' }, 0)
    return () => { trig.kill(); tl.scrollTrigger?.kill(); tl.kill() }
  }, { dependencies: [films.length] })

  useEffect(() => {
    const onMove = (e: PointerEvent) => { bh.pointerX = (e.clientX / window.innerWidth) * 2 - 1; bh.pointerY = (e.clientY / window.innerHeight) * 2 - 1 }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const shown = reduced ? -1 : part
  const cur = reduced ? Math.min(1, films.length - 1) : film
  const f = cur >= 0 ? films[cur] : null

  return (
    <div ref={host} className="bh-scene">
      <Canvas
        frameloop={inView ? 'always' : 'never'}
        dpr={light ? [1, 1.5] : [1, 2]}
        shadows
        camera={{ fov: light ? 48 : 36, near: 0.05, far: 40, position: [1.7, 0.75, 2.05] }}
        gl={{ antialias: !light, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05 }}
      >
        <color attach="background" args={['#1a0710']} />
        <fog attach="fog" args={['#1a0710', 4, 11]} />
        <ambientLight intensity={0.18} color="#ffcfb0" />
        <spotLight position={[2.4, 3.2, 2.2]} angle={0.5} penumbra={0.8} intensity={38} color="#FFB36B" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
        <spotLight position={[-2.6, 1.8, -1.8]} angle={0.6} penumbra={1} intensity={22} color="#6FA7A4" />
        <directionalLight position={[0, 4, -3]} intensity={0.6} color="#D8A84E" />
        <Suspense fallback={null}>
          <Rig ctl={ctl} prog={prog} light={light} />
          <Beam ctl={ctl} count={light ? 260 : 700} />
          <Screen films={films} ctl={ctl} />
        </Suspense>
        <Lamp ctl={ctl} />
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.255, 1.6]} receiveShadow>
          <planeGeometry args={[14, 14]} />
          <meshStandardMaterial color="#2a0c15" roughness={0.85} />
        </mesh>
        <ContactShadows position={[0, -0.25, 0]} opacity={0.65} scale={3} blur={2.4} far={1} resolution={light ? 256 : 512} frames={1} />
        <EffectComposer multisampling={light ? 0 : 4} enableNormalPass={false}>
          <Bloom intensity={light ? 0.7 : 1.1} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur />
          <Noise opacity={0.07} premultiply />
          <Vignette offset={0.25} darkness={0.75} />
        </EffectComposer>
      </Canvas>

      <ol className="bh-parts" aria-hidden>
        {PART_CAPTIONS.map((c, i) => (
          <li key={c.n} className={`${shown >= i ? 'on' : ''} ${shown === i ? 'cur' : ''}`}>
            <b>{c.n}</b>
            <span><em>{c.t}</em>{c.d}</span>
          </li>
        ))}
      </ol>
      <div className={`bh-cap ${f ? 'on' : ''}`} aria-live="polite">
        {f && (
          <>
            <p className="bh-cap-title">{f.title}</p>
            <p className="bh-cap-meta">Rated {f.rating} of 5 &middot; on the screen tonight</p>
          </>
        )}
      </div>
    </div>
  )
}
