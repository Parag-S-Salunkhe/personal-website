'use client'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, useTexture } from '@react-three/drei'
import { Bloom, ChromaticAberration, EffectComposer, Noise, ToneMapping, Vignette } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { beamFrag, beamVert, dustFrag, dustVert, screenFrag, screenVert } from './shaders'
import { Projector, Room, Seats } from './Room'
import type { Film, Shared } from './types'

// ---- beam geometry (world space) ----
const A = new THREE.Vector3(0, 1.9, 4.5) // lens
const T = new THREE.Vector3(0, 1.95, -9.0) // screen centre
const L = A.distanceTo(T)
const R_END = 3.7
const R0 = 0.12
const SY = 0.56
const K = (R_END - R0) / L
const AXIS = T.clone().sub(A).normalize()
const SCREEN_W = 7.2
const SCREEN_H = 3.9

const hash = (x: number) => { const s = Math.sin(x * 12.9898) * 43758.5453; return s - Math.floor(s) }

function mulberry(seed: number) {
  let a = seed
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

function leaderTexture(n: number) {
  const c = document.createElement('canvas')
  c.width = 512; c.height = 277
  const g = c.getContext('2d')!
  g.fillStyle = '#c9bd9f'; g.fillRect(0, 0, 512, 277)
  g.strokeStyle = '#1a1411'; g.lineWidth = 5
  g.beginPath(); g.arc(256, 138, 112, 0, Math.PI * 2); g.stroke()
  g.lineWidth = 2.5
  g.beginPath(); g.arc(256, 138, 90, 0, Math.PI * 2); g.stroke()
  g.beginPath(); g.moveTo(0, 138); g.lineTo(512, 138); g.moveTo(256, 0); g.lineTo(256, 277); g.stroke()
  g.fillStyle = '#1a1411'; g.font = 'bold 150px Impact, "Arial Black", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'
  g.fillText(String(n), 256, 146)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

type Fx = { flick: number; frame: number; weave: THREE.Vector2; burst: number }

function Rig({ films, shared, light, rm, fx }: { films: Film[]; shared: Shared; light: boolean; rm: boolean; fx: { current: Fx } }) {
  const textures = useTexture(films.map((f) => f.posterUrl)) as THREE.Texture[]
  const { invalidate } = useThree()
  const leaders = useMemo(() => [1, 2, 3].map(leaderTexture), [])
  const N = films.length

  useMemo(() => {
    textures.forEach((t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.needsUpdate = true })
  }, [textures])

  // average poster colour -> screen bounce light tint
  const avg = useMemo(() => textures.map((t) => {
    try {
      const c = document.createElement('canvas'); c.width = c.height = 4
      const g = c.getContext('2d')!
      g.drawImage(t.image as CanvasImageSource, 0, 0, 4, 4)
      const d = g.getImageData(0, 0, 4, 4).data
      let r = 0, gg = 0, b = 0
      for (let i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; b += d[i + 2] }
      const n = d.length / 4 * 255
      return new THREE.Color(r / n, gg / n, b / n).lerp(new THREE.Color('#FFF3D6'), 0.55)
    } catch { return new THREE.Color('#FFF3D6') }
  }), [textures])

  const inv = useMemo(() => {
    const o = new THREE.Object3D()
    o.position.copy(A); o.lookAt(T); o.updateMatrixWorld(true)
    return { quat: o.quaternion.clone(), inv: o.matrixWorld.clone().invert() }
  }, [])

  const beamGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(R_END * 1.18, R0 * 1.18, L, 48, 1, false)
    g.rotateX(Math.PI / 2); g.scale(1, SY * 1.0, 1); g.translate(0, 0, L / 2)
    return g
  }, [])
  const beamMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: beamVert, fragmentShader: beamFrag,
    defines: { STEPS: light ? 20 : 40 },
    uniforms: {
      uInv: { value: inv.inv }, uL: { value: L }, uR0: { value: R0 }, uK: { value: K }, uSy: { value: SY },
      uTime: { value: 0 }, uFlick: { value: 1 }, uGain: { value: 1 }, uFrame: { value: 0 },
      uBeam: { value: new THREE.Color('#FFF3D6') }, uWarm: { value: new THREE.Color('#FF9F43') },
    },
    side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  }), [light, inv])

  const dust = useMemo(() => {
    const count = light ? 600 : 2600
    const rnd = mulberry(7)
    const pos = new Float32Array(count * 3), seed = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rnd() - 0.5) * 9
      pos[i * 3 + 1] = 0.3 + rnd() * 4.6
      pos[i * 3 + 2] = -9 + rnd() * 18
      seed[i * 3] = rnd(); seed[i * 3 + 1] = rnd(); seed[i * 3 + 2] = rnd()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 3))
    const m = new THREE.ShaderMaterial({
      vertexShader: dustVert, fragmentShader: dustFrag,
      uniforms: {
        uTime: { value: 0 }, uScale: { value: 800 }, uFlick: { value: 1 }, uPtrR: { value: 2.4 },
        uPtr: { value: new THREE.Vector3(0, 2, 0) }, uAxis: { value: AXIS.clone() }, uInv: { value: inv.inv },
        uL: { value: L }, uR0: { value: R0 }, uK: { value: K }, uSy: { value: SY }, uBeam: { value: new THREE.Color('#FFF3D6') },
      },
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
    })
    return { g, m }
  }, [light, inv])

  const screenMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: screenVert, fragmentShader: screenFrag,
    uniforms: {
      uTex: { value: textures[0] ?? leaders[2] }, uLeader: { value: leaders[2] }, uTexAspect: { value: 0.667 },
      uFlick: { value: 1 }, uFrame: { value: 0 }, uMode: { value: textures[0] ? 0 : 1 }, uLeaderT: { value: 0 },
      uBurst: { value: 0 }, uWeave: { value: new THREE.Vector2() },
    },
    toneMapped: false,
  }), [textures, leaders])

  useEffect(() => () => { beamGeo.dispose(); beamMat.dispose(); dust.g.dispose(); dust.m.dispose(); screenMat.dispose(); leaders.forEach((l) => l.dispose()) }, [beamGeo, beamMat, dust, screenMat, leaders])

  const bounce = useRef<THREE.PointLight>(null)
  const lens = useRef<THREE.PointLight>(null)
  const st = useRef({ shown: -1, to: -1, transStart: 0, p: 0, ptr: new THREE.Vector3(0, 2, 0), ndc: new THREE.Vector2(0, 0.05), lastNum: 0, tintCur: new THREE.Color('#FFF3D6') })
  const tmp = useMemo(() => ({ v: new THREE.Vector3(), w: new THREE.Vector3(), c: new THREE.Color() }), [])

  const setPoster = (i: number) => {
    const tx = textures[i]
    if (tx) {
      screenMat.uniforms.uTex.value = tx
      const im = tx.image as { width: number; height: number }
      screenMat.uniforms.uTexAspect.value = im.width / im.height
    }
    screenMat.uniforms.uMode.value = tx ? 0 : 1
  }

  useEffect(() => { if (rm) { invalidate(); const t = setTimeout(invalidate, 400); return () => clearTimeout(t) } }, [rm, invalidate])

  useFrame((state, dt) => {
    const s = st.current
    const cam = state.camera as THREE.PerspectiveCamera
    const aspect = state.size.width / state.size.height
    const portrait = aspect < 1
    const t = rm ? 12 : state.clock.elapsedTime
    // damped progress
    const target = rm ? 0.6 : shared.progress
    s.p += (target - s.p) * (rm ? 1 : 1 - Math.exp(-dt * 6))
    const p = s.p

    // flicker ~24 fps, irregular
    const f = fx.current
    if (rm) { f.flick = 1; f.frame = 0; f.weave.set(0, 0); f.burst = 0 } else {
      const fr = Math.floor(t * 24)
      if (fr !== f.frame) {
        f.frame = fr
        const r = hash(fr), r2 = hash(fr + 77.7)
        f.flick = 0.92 + 0.14 * r - (r2 > 0.93 ? 0.28 : 0) + 0.04 * Math.sin(t * 3)
        f.weave.set((hash(fr + 1) - 0.5) * 0.004, (hash(fr + 2) - 0.5) * 0.007)
      }
      f.burst = Math.max(0, f.burst - dt * 5)
    }

    // poster state machine
    const want = Math.min(N - 1, Math.floor(p * N * 0.9999))
    if (s.shown < 0) { s.shown = want; setPoster(want); shared.onShown(want) }
    if (rm) { if (want !== s.shown) { s.shown = want; setPoster(want); shared.onShown(want) } } else {
      if (want !== s.shown && s.to !== want) { s.to = want; if (s.transStart === 0 || t - s.transStart > 0.55) s.transStart = t; f.burst = 1 }
      if (s.to >= 0) {
        const lt = t - s.transStart
        if (lt < 0.5) {
          const num = lt < 0.17 ? 3 : lt < 0.34 ? 2 : 1
          screenMat.uniforms.uLeader.value = leaders[num - 1]
          if (num !== s.lastNum) { s.lastNum = num; f.burst = Math.max(f.burst, 0.5) }
          screenMat.uniforms.uMode.value = 1
          screenMat.uniforms.uLeaderT.value = lt
        } else {
          s.shown = s.to; s.to = -1; s.lastNum = 0; s.transStart = 0
          setPoster(s.shown); shared.onShown(s.shown); f.burst = 1
        }
      }
    }

    // camera dolly along the beam
    const e = Math.min(1, p / 0.9)
    const ee = e * e * (3 - 2 * e) * 0.35 + e * 0.65
    const endZ = portrait ? -1.8 : -3.6
    cam.fov = portrait ? THREE.MathUtils.lerp(58, 40, ee) : THREE.MathUtils.lerp(50, 40, ee)
    cam.aspect = aspect
    cam.updateProjectionMatrix()
    const px = rm ? 0 : shared.pointer.x
    const py = rm ? 0 : shared.pointer.y
    const sway = rm ? 0 : Math.sin(t * 0.35) * 0.05
    cam.position.set(
      THREE.MathUtils.lerp(2.5, 0, THREE.MathUtils.smoothstep(ee, 0, 0.75)) + px * 0.25 * (1 - ee * 0.6),
      THREE.MathUtils.lerp(3.5, T.y, ee) + sway + py * 0.1,
      THREE.MathUtils.lerp(10.2, endZ, ee),
    )
    cam.lookAt(px * 0.4, THREE.MathUtils.lerp(1.9, T.y, ee) + py * 0.15, -9)
    cam.updateMatrixWorld()

    // pointer projected into the beam: closest point of the cursor ray to the beam axis
    s.ndc.x += (px - s.ndc.x) * (1 - Math.exp(-dt * 5))
    s.ndc.y += (py - s.ndc.y) * (1 - Math.exp(-dt * 5))
    tmp.v.set(s.ndc.x, s.ndc.y, 0.5).unproject(cam).sub(cam.position).normalize()
    const w0 = tmp.w.copy(cam.position).sub(A)
    const b = tmp.v.dot(AXIS), d = tmp.v.dot(w0), ee2 = AXIS.dot(w0)
    const den = 1 - b * b
    let sRay = den > 1e-4 ? (b * ee2 - d) / den : 6
    sRay = THREE.MathUtils.clamp(sRay, 2, 14)
    s.ptr.copy(cam.position).addScaledVector(tmp.v, sRay)

    const gain = THREE.MathUtils.lerp(1, 0.42, THREE.MathUtils.smoothstep(p, 0.6, 1))
    beamMat.uniforms.uTime.value = t
    beamMat.uniforms.uFlick.value = f.flick
    beamMat.uniforms.uFrame.value = f.frame
    beamMat.uniforms.uGain.value = gain
    const du = dust.m.uniforms
    du.uTime.value = t; du.uFlick.value = f.flick
    du.uScale.value = (state.size.height * state.viewport.dpr) / (2 * Math.tan((cam.fov * Math.PI) / 360))
    du.uPtr.value.copy(s.ptr)
    const su = screenMat.uniforms
    su.uFlick.value = f.flick; su.uFrame.value = f.frame % 997; su.uBurst.value = f.burst * 0.35
    su.uWeave.value.copy(f.weave)

    const col = avg[s.shown] ?? avg[0]
    if (col) s.tintCur.lerp(col, 1 - Math.exp(-dt * 4))
    if (bounce.current) { bounce.current.intensity = 90 * f.flick * (0.6 + 0.4 * (1 - f.burst * 0.3)); bounce.current.color.copy(s.tintCur) }
    if (lens.current) lens.current.intensity = 4 * f.flick
  })

  return (
    <>
      <Room light={light} />
      <Projector pos={[0, 1.9, 6.0]} />
      <Seats />
      <mesh position={[0, 1.95, -9.45]} material={screenMat}><planeGeometry args={[SCREEN_W, SCREEN_H]} /></mesh>
      <mesh geometry={beamGeo} material={beamMat} position={A} quaternion={inv.quat} frustumCulled={false} renderOrder={3} />
      <points geometry={dust.g} material={dust.m} frustumCulled={false} renderOrder={4} />
      <pointLight ref={bounce} position={[0, 2.0, -7.6]} color="#FFF3D6" intensity={90} distance={22} decay={2} />
      <pointLight ref={lens} position={[0, 1.9, 4.2]} color="#FFD9A0" intensity={10} distance={9} decay={2} />
      <hemisphereLight args={['#ffcf9a', '#3a0f1c', 0.55]} />
    </>
  )
}

export default function Scene({ films, shared, light, rm, paused }: { films: Film[]; shared: Shared; light: boolean; rm: boolean; paused: boolean }) {
  const fx = useRef<Fx>({ flick: 1, frame: -1, weave: new THREE.Vector2(), burst: 0 })
  const ca = useMemo(() => new THREE.Vector2(0.0008, 0.0011), [])
  return (
    <Canvas
      dpr={light ? [1, 1.5] : [1, 2]}
      frameloop={rm ? 'demand' : paused ? 'never' : 'always'}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      camera={{ fov: 50, near: 0.1, far: 60, position: [0, 3.5, 10.2] }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#1a0710']} />
      <Suspense fallback={null}>
        <Environment resolution={64} frames={1} background={false} environmentIntensity={0.35}>
          <Lightformer form="rect" intensity={3} color="#ffd9a0" position={[0, 3, -6]} scale={[8, 4, 1]} />
          <Lightformer form="rect" intensity={1.2} color="#ff9f43" position={[-6, 3, 2]} rotation={[0, Math.PI / 2, 0]} scale={[6, 2, 1]} />
        </Environment>
        <Rig films={films} shared={shared} light={light} rm={rm} fx={fx} />
      </Suspense>
      {light ? (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.8} luminanceThreshold={0.85} luminanceSmoothing={0.25} mipmapBlur />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.6} />
          <Vignette offset={0.2} darkness={0.8} />
        </EffectComposer>
      ) : (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.9} luminanceThreshold={0.85} luminanceSmoothing={0.25} mipmapBlur />
          <ChromaticAberration offset={ca} radialModulation modulationOffset={0.35} blendFunction={BlendFunction.NORMAL} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.6} />
          <Vignette offset={0.2} darkness={0.8} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
