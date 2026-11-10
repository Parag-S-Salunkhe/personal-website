'use client'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { kernelGeometry } from './geometry'
import { mulberry32 } from './rng'
import type { Layout } from './layout'
import type { Shared } from './types'

const G = 14
const IDLE = 0, SPRING = 1, BALL = 2, FALL = 3, HEAP = 4
const PHASE_AT = [0.14, 0.28, 0.44]
const PALETTE = ['#FFF1C9', '#FFF1C9', '#F9E0A0', '#F7D88C', '#EDBB63', '#D99A4A']

interface Sim {
  clock: number
  phase: number
  mode: Uint8
  pend: Int8Array
  tsel: Uint8
  pos: Float32Array
  vel: Float32Array
  rot: Float32Array
  ang: Float32Array
  s0: Float32Array
  sm: Float32Array
  k: Float32Array
  wake: Float32Array
  pop: Float32Array
}
type Uint8 = Uint8Array

function makeSim(layout: Layout, assembled: boolean): Sim {
  const n = layout.n
  const rnd = mulberry32(99)
  const sim: Sim = {
    clock: 0, phase: 0,
    mode: new Uint8Array(n), pend: new Int8Array(n).fill(-1), tsel: new Uint8Array(n),
    pos: new Float32Array(n * 3), vel: new Float32Array(n * 3), rot: new Float32Array(n * 3), ang: new Float32Array(n * 3),
    s0: new Float32Array(n), sm: new Float32Array(n).fill(1), k: new Float32Array(n), wake: new Float32Array(n), pop: new Float32Array(n).fill(-1),
  }
  for (let i = 0; i < n; i++) {
    sim.s0[i] = layout.r * (0.8 + rnd() * 0.5)
    sim.k[i] = 42 * (0.85 + rnd() * 0.3)
    sim.rot[i * 3] = rnd() * 6.28; sim.rot[i * 3 + 1] = rnd() * 6.28; sim.rot[i * 3 + 2] = rnd() * 6.28
    if (assembled) {
      sim.mode[i] = SPRING
      sim.pos[i * 3] = layout.t1[i * 3]; sim.pos[i * 3 + 1] = layout.t1[i * 3 + 1]; sim.pos[i * 3 + 2] = layout.t1[i * 3 + 2]
    } else {
      // resting pile of unpopped kernels along the floor
      const a = (rnd() + rnd() + rnd()) / 3 - 0.5
      sim.pos[i * 3] = a * layout.viewW * 0.95
      sim.pos[i * 3 + 1] = layout.floorY + rnd() * 0.45 * (1 - Math.abs(a))
      sim.pos[i * 3 + 2] = (rnd() - 0.5) * 3
      sim.mode[i] = IDLE
      sim.pend[i] = SPRING
      sim.wake[i] = 0.45 + (i / n) * 1.0 + rnd() * 0.4
      sim.pop[i] = -1
    }
  }
  return sim
}

function goPhase(sim: Sim, layout: Layout, ph: number) {
  sim.phase = ph
  const n = layout.n
  for (let i = 0; i < n; i++) {
    const r = Math.random()
    if (ph === 0) { sim.pend[i] = SPRING; sim.tsel[i] = 0; sim.wake[i] = sim.clock + r * 0.25 }
    else if (ph === 1) { sim.pend[i] = BALL; sim.wake[i] = sim.clock + r * 0.12 }
    else if (ph === 2) { sim.pend[i] = SPRING; sim.tsel[i] = 1; sim.wake[i] = sim.clock + r * 0.3 }
    else { sim.pend[i] = FALL; sim.wake[i] = sim.clock + r * 0.6 }
  }
}

function wakeParticle(sim: Sim, layout: Layout, i: number) {
  const p = sim.pos, v = sim.vel, a = sim.ang
  const m = sim.pend[i]
  const from = sim.mode[i]
  sim.pend[i] = -1
  sim.mode[i] = m
  const i3 = i * 3
  const R = Math.random
  if (m === SPRING) {
    if (from === IDLE) {
      v[i3] = (R() - 0.5) * 2; v[i3 + 1] = 5 + R() * 4.5; v[i3 + 2] = (R() - 0.5) * 2
      sim.pop[i] = 0
    } else if (from === HEAP) {
      v[i3 + 1] += 4 + R() * 3
    }
    a[i3] = (R() - 0.5) * 12; a[i3 + 1] = (R() - 0.5) * 12; a[i3 + 2] = (R() - 0.5) * 12
  } else if (m === BALL) {
    const dx = p[i3] + (R() - 0.5) * 2
    const dy = p[i3 + 1] - layout.cy + (R() - 0.5) * 1.5
    const len = Math.hypot(dx, dy) || 1
    const sp = 5 + R() * 9
    v[i3] = (dx / len) * sp; v[i3 + 1] = (dy / len) * sp + 3 + R() * 3; v[i3 + 2] = (R() - 0.3) * 7
    a[i3] = (R() - 0.5) * 28; a[i3 + 1] = (R() - 0.5) * 28; a[i3 + 2] = (R() - 0.5) * 28
  } else if (m === FALL) {
    // aim a ballistic arc so it lands on its slot after T seconds
    const sx = layout.slots[i3], sy = layout.slots[i3 + 1], sz = layout.slots[i3 + 2]
    const T = 0.75 + R() * 0.4
    v[i3] = (sx - p[i3]) / T
    v[i3 + 1] = (sy - p[i3 + 1] + 0.5 * G * T * T) / T
    v[i3 + 2] = (sz - p[i3 + 2]) / T
    a[i3] = (R() - 0.5) * 10; a[i3 + 1] = (R() - 0.5) * 10; a[i3 + 2] = (R() - 0.5) * 10
  }
}

export default function Particles({ layout, shared, rm }: { layout: Layout; shared: Shared; rm: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const started = useRef(false)
  const lastPhase = useRef(0)
  const geo = useMemo(() => kernelGeometry(1), [])
  useEffect(() => () => geo.dispose(), [geo])
  const { camera } = useThree()
  void camera
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const sim = useMemo(() => {
    const s = makeSim(layout, rm || started.current)
    if (started.current && !rm) {
      // resized mid-story: snap to the target of the current phase
      const tg = lastPhase.current === 2 ? layout.t2 : layout.t1
      for (let i = 0; i < layout.n * 3; i++) s.pos[i] = tg[i]
      s.phase = lastPhase.current
    }
    return s
  }, [layout, rm])
  const pw = useRef({ x: 0, y: 0 })

  // instance colours (once per count)
  useEffect(() => {
    const m = mesh.current
    if (!m) return
    const rnd = mulberry32(7)
    const c = new THREE.Color()
    for (let i = 0; i < layout.n; i++) {
      c.set(PALETTE[Math.floor(rnd() * PALETTE.length)])
      m.setColorAt(i, c)
    }
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [layout.n])

  const write = (m: THREE.InstancedMesh) => {
    const { pos, rot, s0, sm, pop, mode } = sim
    for (let i = 0; i < layout.n; i++) {
      let s = s0[i] * sm[i]
      if (mode[i] === IDLE) s *= 0.7
      else if (pop[i] >= 0) {
        const u = pop[i] / 0.45
        s *= u < 0.35 ? 0.7 + 0.9 * (u / 0.35) : u < 1 ? 1.6 - 0.6 * ((u - 0.35) / 0.65) : 1
      }
      dummy.position.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2])
      dummy.rotation.set(rot[i * 3], rot[i * 3 + 1], rot[i * 3 + 2])
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  }

  // reduced motion: one still frame of the assembled name
  useEffect(() => {
    if (!rm || !mesh.current) return
    write(mesh.current)
    shared.onReady()
  }) // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, delta) => {
    const m = mesh.current
    if (!m || rm) return
    const dt = Math.min(delta, 1 / 30)
    started.current = true
    sim.clock += dt
    // phase from scroll progress, with hysteresis going back
    let ph = sim.phase
    const p = shared.progress
    while (ph < 3 && p > PHASE_AT[ph]) ph++
    while (ph > 0 && p < PHASE_AT[ph - 1] - 0.025) ph--
    if (ph !== sim.phase) { goPhase(sim, layout, ph); lastPhase.current = ph; shared.onPhase(ph) }
    shared.sp += (shared.progress - shared.sp) * Math.min(1, dt * 6)

    pw.current.x = shared.pointer.x * layout.viewW * 0.5
    pw.current.y = shared.pointer.y * layout.viewH * 0.5
    const R = layout.portrait ? 0.9 : 1.15
    const R2 = R * R
    const act = shared.pointer.active
    const { pos, vel, rot, ang, mode, pend, wake, tsel, k, pop, sm } = sim
    const t1 = layout.t1, t2 = layout.t2, slots = layout.slots
    const clock = sim.clock
    const bob = clock * 1.6
    for (let i = 0; i < layout.n; i++) {
      const i3 = i * 3
      if (pend[i] >= 0 && clock >= wake[i]) wakeParticle(sim, layout, i)
      const md = mode[i]
      if (md === IDLE) continue
      if (pop[i] >= 0) { pop[i] += dt; if (pop[i] > 0.45) pop[i] = -1 }
      if (md === SPRING || md === HEAP) {
        let tx: number, ty: number, tz: number
        if (md === HEAP) { tx = slots[i3]; ty = slots[i3 + 1]; tz = slots[i3 + 2] }
        else {
          const t = tsel[i] ? t2 : t1
          tx = t[i3]; ty = t[i3 + 1] + Math.sin(bob + i * 0.37) * 0.012; tz = t[i3 + 2]
        }
        const kk = md === HEAP ? 60 : k[i]
        const cc = md === HEAP ? 12 : 4.6
        vel[i3] += (kk * (tx - pos[i3]) - cc * vel[i3]) * dt
        vel[i3 + 1] += (kk * (ty - pos[i3 + 1]) - cc * vel[i3 + 1]) * dt
        vel[i3 + 2] += (kk * (tz - pos[i3 + 2]) - cc * vel[i3 + 2]) * dt
        const damp = Math.exp(-3 * dt)
        ang[i3] *= damp; ang[i3 + 1] *= damp; ang[i3 + 2] *= damp
        const target = md === HEAP ? 1.35 : 1
        sm[i] += (target - sm[i]) * Math.min(1, dt * 4)
      } else {
        vel[i3 + 1] -= G * dt
        const dr = 1 - 0.12 * dt
        vel[i3] *= dr; vel[i3 + 2] *= dr
        if (md === BALL) {
          // floor, walls and depth bounds
          if (pos[i3 + 1] < layout.floorY && vel[i3 + 1] < 0) {
            pos[i3 + 1] = layout.floorY; vel[i3 + 1] *= -0.38
            vel[i3] *= 0.82; vel[i3 + 2] *= 0.82
            ang[i3] *= 0.85; ang[i3 + 1] *= 0.85; ang[i3 + 2] *= 0.85
          }
          if (pos[i3] > layout.wallX && vel[i3] > 0) vel[i3] *= -0.5
          else if (pos[i3] < -layout.wallX && vel[i3] < 0) vel[i3] *= -0.5
          if (pos[i3 + 2] > 5 && vel[i3 + 2] > 0) vel[i3 + 2] *= -0.5
          else if (pos[i3 + 2] < -4 && vel[i3 + 2] < 0) vel[i3 + 2] *= -0.5
        } else if (md === FALL) {
          if (vel[i3 + 1] < 0 && pos[i3 + 1] <= slots[i3 + 1]) {
            pos[i3 + 1] = slots[i3 + 1]
            vel[i3 + 1] *= -0.3
            mode[i] = HEAP
          }
        }
      }
      // pointer repel
      if (act && md !== FALL && md !== HEAP) {
        const dx = pos[i3] - pw.current.x, dy = pos[i3 + 1] - pw.current.y
        const d2 = dx * dx + dy * dy
        if (d2 < R2) {
          const d = Math.sqrt(d2) || 0.001
          const f = (1 - d / R) ** 2 * 140 * dt
          vel[i3] += (dx / d) * f; vel[i3 + 1] += (dy / d) * f; vel[i3 + 2] += f * 0.4
          ang[i3 + 2] += f * 0.8
        }
      }
      pos[i3] += vel[i3] * dt; pos[i3 + 1] += vel[i3 + 1] * dt; pos[i3 + 2] += vel[i3 + 2] * dt
      rot[i3] += ang[i3] * dt; rot[i3 + 1] += ang[i3 + 1] * dt; rot[i3 + 2] += ang[i3 + 2] * dt
    }
    write(m)
    if (!shared.pointer.active) return
  })

  return (
    <instancedMesh ref={mesh} args={[geo, undefined, layout.n]} frustumCulled={false}>
      <meshStandardMaterial vertexColors flatShading roughness={0.78} emissive="#3b2208" emissiveIntensity={0.6} />
    </instancedMesh>
  )
}
