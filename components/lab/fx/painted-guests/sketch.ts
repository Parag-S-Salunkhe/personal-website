// p5 (instance mode) + p5.brush runtime: paint sprites once into an atlas, animate them on twos.
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ARM, BODY, CANDLE, DISH, EYES, FLAME, GLASS, GUESTS, HEAD, MOUTH, STEAM,
  paintBody, paintCandle, paintDish, paintEyes, paintFlame, paintFore, paintGlass, paintHeadA, paintHeadB,
  paintMouth, paintRoom, paintSteam, paintTable, paintUpper, paintWindow, paintChair,
} from './art'
import { C, Pen, rng } from './paint'
import { HEAD_Y, SHOULDER_Y, STORY, TABLE, clamp01, layoutFor, smooth, type Course, type Tier } from './layout'

export type SketchOpts = { courses: Course[]; tier: Tier; reduced: boolean; getProgress: () => number }
export type SketchHandle = {
  destroy: () => void
  setActive: (on: boolean) => void
  canvas: () => HTMLCanvasElement | null
  reactorHead: () => { x: number; y: number }
  cropSize: () => { w: number; h: number }
  ready: Promise<void>
  stats: () => { paintMs: number; sprites: number; atlas: string }
}

type Item = { key: string; w: number; h: number; paint: (p: Pen, g: any) => void }
type Rect = { x: number; y: number; pw: number; ph: number; lw: number; lh: number }

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const ease = (t: number) => t * t * (3 - 2 * t)
const backOut = (t: number) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) }

export async function createSketch(host: HTMLElement, o: SketchOpts): Promise<SketchHandle> {
  const p5mod: any = await import('p5')
  const P5 = p5mod.default ?? p5mod
  ;(window as any).p5 = P5
  const B: any = await import('p5.brush')

  const light = o.tier === 'light'
  const lay = layoutFor(o.tier)
  const { crop } = lay
  const K = light ? 0.85 : 1
  const CW = Math.round(crop.w * K), CH = Math.round(crop.h * K)
  const guests = lay.guests.map((gi) => ({ gi, s: GUESTS[gi] }))
  const reactor = guests.find((g) => g.gi === 4)!
  const glassGuest = guests.find((g) => g.gi === 5)
  const nCourse = Math.min(o.courses.length, lay.dishes.length)
  const courses = o.courses.slice(0, nCourse)
  const dishSlots = lay.dishes.slice(0, nCourse)

  // ---- sprite list ----
  const items: Item[] = []
  const add = (key: string, w: number, h: number, paint: (p: Pen, g: any) => void) => items.push({ key, w, h, paint })
  for (const { gi, s } of guests) {
    add(`hA${gi}`, HEAD.w, HEAD.h, (p) => paintHeadA(p, s))
    add(`hB${gi}`, HEAD.w, HEAD.h, (p) => paintHeadB(p, s))
    add(`body${gi}`, BODY.w, BODY.h, (p) => paintBody(p, s))
    if (s.armSide) { add(`up${gi}`, ARM.uw, ARM.uh, (p) => paintUpper(p, s)); add(`fore${gi}`, ARM.fw, ARM.fh, (p) => paintFore(p, s)) }
  }
  for (const [k, look] of [['eo-1', -1], ['eo0', 0], ['eo1', 1]] as [string, number][]) add(k, EYES.w, EYES.h, (p) => paintEyes(p, 'open', look))
  add('ec', EYES.w, EYES.h, (p) => paintEyes(p, 'closed', 0)); add('eh', EYES.w, EYES.h, (p) => paintEyes(p, 'happy', 0))
  for (let m = 0; m < 5; m++) add(`m${m}`, MOUTH.w, MOUTH.h, (p) => paintMouth(p, m))
  if (glassGuest) add('glass', GLASS.w, GLASS.h, (p) => paintGlass(p, GLASS.px, GLASS.py))
  add('candle0', CANDLE.w, CANDLE.h, (p) => paintCandle(p, '#C9A66B')); add('candle1', CANDLE.w, CANDLE.h, (p) => paintCandle(p, C.claret))
  for (let v = 0; v < 3; v++) add(`flame${v}`, FLAME.w, FLAME.h, (p) => paintFlame(p, v))
  courses.forEach((c, i) => add(`dish${i}`, DISH.w, DISH.h, (p) => paintDish(p, c.kind, i)))
  for (let v = 0; v < 2; v++) add(`steam${v}`, STEAM.w, STEAM.h, (p) => paintSteam(p, v))
  const WIN = { x: 676, y: 66, w: 250, h: 330 }
  const winVisible = crop.x <= WIN.x + WIN.w && crop.x + crop.w >= WIN.x
  if (winVisible) add('nightwin', WIN.w + 20, WIN.h + 24, (p) => paintWindow(p, 10, 10, WIN.w, WIN.h, true))

  // ---- shelf pack ----
  const AW = light ? 2048 : 4096
  const pad = 6
  const sorted = [...items].sort((a, b) => b.h - a.h)
  const rects: Record<string, Rect> = {}
  let cx = 0, cy = 0, rowH = 0
  for (const it of sorted) {
    const pw = Math.ceil(it.w * K), ph = Math.ceil(it.h * K)
    if (cx + pw + pad > AW) { cx = 0; cy += rowH + pad; rowH = 0 }
    rects[it.key] = { x: cx, y: cy, pw, ph, lw: it.w, lh: it.h }
    cx += pw + pad; rowH = Math.max(rowH, ph)
  }
  const AH = Math.max(256, cy + rowH + pad)

  let pInst: any, atlas: any, scene: any
  let resolveReady: () => void = () => {}
  const ready = new Promise<void>((r) => { resolveReady = r })
  let painted = false, paintMs = 0
  let active = true
  let destroyed = false
  const ptr = { x: 0, y: 0, in: false }
  const handlePointer = (e: PointerEvent) => {
    const el = pInst?.canvas as HTMLCanvasElement | undefined
    if (!el) return
    const r = el.getBoundingClientRect()
    const lx = crop.x + ((e.clientX - r.left) / r.width) * crop.w
    const ly = crop.y + ((e.clientY - r.top) / r.height) * crop.h
    ptr.x = lx; ptr.y = ly
    ptr.in = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
  }
  const handleLeave = () => { ptr.in = false }
  if (!o.reduced) { window.addEventListener('pointermove', handlePointer, { passive: true }); document.addEventListener('pointerleave', handleLeave) }

  // ---- pose state ----
  type GS = { lookX: number; lookY: number; wave: number; oscI: number; sip: number }
  const gs: Record<number, GS> = {}
  for (const { gi } of guests) gs[gi] = { lookX: 0, lookY: 0, wave: 0, oscI: 0, sip: 0 }
  type Pose = { dx: number; dy: number; hdx: number; hdy: number; rot: number; eyes: string; look: number; mouth: number; shiftA: number; shiftB: number; sq: number; breath: number; arm: null | { E: [number, number]; H: [number, number]; S: [number, number]; side: number; glassTilt: number; hasGlass: boolean } }
  const poses: Record<number, Pose> = {}
  let lastTick = -1
  let lean = 0

  const solveIK = (S: [number, number], H: [number, number], UL: number, FL: number) => {
    let dx = H[0] - S[0], dy = H[1] - S[1]
    let d = Math.hypot(dx, dy)
    const dmax = UL + FL - 2, dmin = Math.abs(UL - FL) + 2
    const dc = Math.min(dmax, Math.max(dmin, d))
    if (d < 1e-3) { dx = 0; dy = 1; d = 1 }
    const ux = dx / d, uy = dy / d
    const a = (UL * UL - FL * FL + dc * dc) / (2 * dc)
    const h = Math.sqrt(Math.max(0, UL * UL - a * a))
    const c1: [number, number] = [S[0] + ux * a - uy * h, S[1] + uy * a + ux * h]
    const c2: [number, number] = [S[0] + ux * a + uy * h, S[1] + uy * a - ux * h]
    const E = c1[1] > c2[1] ? c1 : c2
    const fx = H[0] - E[0], fy = H[1] - E[1], fl = Math.hypot(fx, fy) || 1
    const Hc: [number, number] = [E[0] + (fx / fl) * FL, E[1] + (fy / fl) * FL]
    return { E, H: Hc }
  }

  const updatePoses = (tt: number, p: number) => {
    const stillMode = o.reduced
    lean = stillMode ? 0.55 : smooth(STORY.leanFrom, STORY.leanTo, p)
    for (const { gi, s } of guests) {
      const st = gs[gi]
      const ph = gi * 1.7
      const per = 3.1 + gi * 0.57
      const blink = stillMode ? false : (tt + gi * 0.9) % per < 0.17
      let eyes = blink ? 'ec' : 'eo0'
      let look = 0
      let mouth = 0
      let rot = 0.045 * Math.sin(tt * 0.55 + ph)
      let hdx = 0, hdy = 0.9 * Math.sin(tt * 1.45 + ph)
      let dx = 0, dy = 0
      let lookX = 0, lookY = 0
      const talkStep = Math.floor(tt * 12) // on twos
      if (!stillMode) {
        // chatters: g1 and g2 alternate speaker every 2.6s
        if (gi === 1 || gi === 2) {
          const cyc = tt % 10.4
          const speaker = cyc < 5.2 ? 1 : 2
          const phase = (cyc % 5.2)
          const talking = phase < 3.9
          if (gi === speaker && talking) { mouth = [3, 1, 2, 3, 0, 2, 3, 1][talkStep % 8]; hdy += -1.4 * Math.abs(Math.sin(tt * 5)); rot += 0.05 * (gi === 1 ? 1 : -1) }
          else { mouth = 0; if (!talking || gi !== speaker) { rot += 0.07 * (gi === 1 ? 1 : -1); hdy += 1.8 * Math.max(0, Math.sin(tt * 3.1 + gi)) } }
          lookX = gi === 1 ? 0.8 : -0.8
        }
        // g0 laughs now and then
        if (gi === 0) {
          const c = tt % 11.5
          if (c > 6.2 && c < 7.7) { mouth = 4; eyes = 'eh'; dy = -1.5 * Math.abs(Math.sin(tt * 9)); hdy -= 2 + Math.sin(tt * 9) * 1.5 }
          else lookX = 0.6
        }
        // host at the centre: talks, glances left and right
        if (gi === 3) {
          const c = tt % 13
          if (c > 2.4 && c < 6.4) { mouth = [3, 2, 1, 3, 0, 2, 1, 3][(talkStep + 3) % 8]; hdy -= 1 }
          lookX = c < 4 ? -0.6 : c < 8 ? 0.7 : 0
        }
        if (gi === 6) { const c = tt % 9; lookX = c > 3 && c < 6.5 ? -0.9 : 0; if (c > 4.2 && c < 5.2) mouth = 1 }
      }
      // reactor: turns toward the pointer, waves when near
      let waveT = 0
      if (gi === 4 && !stillMode) {
        const hx = s.x, hy = HEAD_Y
        const near = ptr.in && Math.hypot(ptr.x - hx, ptr.y - hy) < 400
        const tx = ptr.in ? Math.max(-1, Math.min(1, (ptr.x - hx) / 260)) : 0
        const ty = ptr.in ? Math.max(-1, Math.min(1, (ptr.y - hy) / 220)) : 0
        st.lookX = lerp(st.lookX, ptr.in ? tx : Math.sin(tt * 0.4) * 0.35, 0.4)
        st.lookY = lerp(st.lookY, ty * 0.7, 0.4)
        waveT = near ? 1 : 0
        st.wave = lerp(st.wave, waveT, near ? 0.34 : 0.22)
        st.oscI += st.wave > 0.5 ? 1 : 0
        if (near) { mouth = st.wave > 0.5 ? [4, 3, 4, 3][Math.floor(tt * 6) % 4] : 1; eyes = blink ? 'ec' : 'eo0' }
        lookX = st.lookX
        rot += st.lookX * 0.09
        hdx += st.lookX * 3
      } else if (gi === 4) { lookX = 0.2 }
      look = Math.max(-1, Math.min(1, Math.round(lookX * 1.4)))
      if (eyes === 'eo0') eyes = `eo${look}`
      // glass guest
      let arm: Pose['arm'] = null
      if (glassGuest && gi === 5 && !stillMode) {
        const c = tt % 9.5
        const up = c < 1.0 ? ease(c / 1.0) : c < 2.6 ? 1 : c < 3.6 ? 1 - ease((c - 2.6) / 1.0) : 0
        st.sip = up
        if (up > 0.6 && c < 2.6) { eyes = 'ec'; rot -= 0.09 * ease((up - 0.6) / 0.4); hdy -= 1.5 }
        lookX = up > 0.2 ? -0.3 : lookX
      }
      if (s.armSide) {
        const side = s.armSide
        const S: [number, number] = [side * (s.sw * 0.62 - 12), SHOULDER_Y + 21 - TABLE.far]
        let Ht: [number, number]
        let tilt = 0
        if (gi === 4) {
          const w = ease(clamp01(st.wave))
          const osc = [1, 0.3, -1, -0.3][Math.floor(tt * 6) % 4]
          Ht = [lerp(S[0] + 6, S[0] + 62 + osc * 38, w), lerp(36, 330 - TABLE.far + (osc < 0 ? -4 : 0), w)]
          if (st.wave < 0.04) Ht = [S[0] + 8, 70]
        } else {
          const up = st.sip
          const mouthP: [number, number] = [-8, 448 - TABLE.far]
          const rest: [number, number] = [side * 56, 500 - TABLE.far]
          Ht = [lerp(rest[0], mouthP[0], up), lerp(rest[1], mouthP[1], up)]
          tilt = -0.25 * up * -side * -1 * 0 + 0.35 * up * (side < 0 ? 1 : -1) * -1
        }
        const ik = solveIK(S, Ht, ARM.UL, ARM.FL)
        arm = { E: ik.E, H: ik.H, S, side, glassTilt: tilt, hasGlass: gi !== 4 }
        if (gi === 4 && st.wave < 0.04) arm = { ...arm, H: ik.H }
      }
      poses[gi] = {
        dx, dy, hdx, hdy, rot, eyes, look,
        mouth: stillMode ? 0 : mouth,
        shiftA: look === 0 ? lookX * 6 : lookX * 6, shiftB: lookX * 11, sq: 1 - 0.04 * Math.abs(lookX), breath: 0.011 * Math.sin(tt * 1.7 + ph),
        arm,
      }
      void lookY
    }
  }

  // ambient light by progress (multiply tint)
  const KEYS: [number, number[]][] = [
    [0, [168, 190, 196]], [0.2, [214, 214, 206]], [0.45, [255, 236, 204]], [0.7, [255, 222, 176]], [0.86, [214, 176, 142]], [1, [150, 116, 104]],
  ]
  const ambient = (pr: number) => {
    for (let i = 0; i < KEYS.length - 1; i++) {
      const [a, ca] = KEYS[i], [b, cb] = KEYS[i + 1]
      if (pr <= b) { const t = ease(clamp01((pr - a) / (b - a))); return ca.map((v, k) => v + (cb[k] - v) * t) }
    }
    return KEYS[KEYS.length - 1][1]
  }

  // ---- p5 sketch ----
  const sketch = (p: any) => {
    B.instance(p)
    let queue = [...items]
    let startMs = 0

    const paintSome = (budget: number) => {
      const t0 = performance.now()
      B.load(atlas)
      while (queue.length && performance.now() - t0 < budget) {
        const it = queue.shift()!
        const r = rects[it.key]
        atlas.push()
        atlas.translate(-AW / 2 + r.x, -AH / 2 + r.y)
        atlas.scale(K)
        p.randomSeed(it.key.length * 977 + it.key.charCodeAt(it.key.length - 1) * 31 + queue.length)
        it.paint(new Pen(B, rng(queue.length * 7919 + 13)), atlas)
        atlas.pop()
      }
      B.load()
      paintMs += performance.now() - t0
    }

    const paintScene = () => {
      const t0 = performance.now()
      B.load(scene)
      const pen = new Pen(B, rng(4242))
      // region A (room)
      scene.push(); scene.translate(-CW / 2, -CH); scene.scale(K); scene.translate(-crop.x, -crop.y)
      p.randomSeed(11)
      paintRoom(pen, crop.x + crop.w, crop.y + crop.h, o.tier)
      for (const { s } of guests) paintChair(pen, s.x, s.chair)
      scene.pop()
      // region B (table)
      scene.push(); scene.translate(-CW / 2, 0); scene.scale(K); scene.translate(-crop.x, 0)
      p.randomSeed(12)
      paintTable(new Pen(B, rng(777)), lay.guests, o.tier, crop.x, crop.x + crop.w)
      scene.pop()
      B.load()
      paintMs += performance.now() - t0
    }

    p.setup = () => {
      p.pixelDensity(1)
      p.createCanvas(CW, CH, p.WEBGL)
      B.load()
      p.frameRate(60)
      atlas = p.createGraphics(AW, AH, p.WEBGL)
      atlas.pixelDensity(1)
      atlas.clear()
      scene = p.createGraphics(CW, CH * 2, p.WEBGL)
      scene.pixelDensity(1)
      scene.clear()
      const cv = p.canvas as HTMLCanvasElement
      cv.style.width = '100%'; cv.style.height = '100%'; cv.style.display = 'block'
      cv.setAttribute('aria-hidden', 'true')
      B.scaleBrushes(K * 1.5)
      startMs = performance.now()
      // scenery first (synchronously), sprites in slices
      paintScene()
    }

    const spr = (key: string, ax: number, ay: number, x = 0, y = 0) => {
      const r = rects[key]
      if (!r) return
      p.image(atlas, x - ax, y - ay, r.lw, r.lh, r.x, r.y, r.pw, r.ph)
    }
    const setTint = (r: number, g: number, b: number, a: number) => p.tint(r, g, b, a)

    let totalDone = false
    p.draw = () => {
      if (destroyed) return
      if (!painted) {
        paintSome(22)
        if (!queue.length) { painted = true; totalDone = true; (window as any).__pgDbg = { atlas, scene }; resolveReady() }
        p.background(16, 40, 31)
        if (!totalDone) return
      }
      const now = (performance.now() - startMs) / 1000
      const prog = o.reduced ? 0.8 : clamp01(o.getProgress())
      const tt = o.reduced ? 3.2 : Math.floor(now * 12) / 12
      const tick = Math.floor(now * 12)
      if (tick !== lastTick || o.reduced) { lastTick = tick; updatePoses(tt, prog) }

      p.background(16, 40, 31)
      p.push()
      p.translate(-CW / 2, -CH / 2)
      p.scale(K)
      p.translate(-crop.x, -crop.y)
      p.noTint()
      // room (region A of scene)
      p.image(scene, crop.x, crop.y, crop.w, crop.h, 0, 0, CW, CH)
      // night window crossfade
      const night = smooth(0.25, 0.88, prog)
      if (winVisible && night > 0.01) { setTint(255, 255, 255, 255 * night); spr('nightwin', 10, 10, WIN.x, WIN.y); p.noTint() }

      // guests
      for (const { gi, s } of guests) {
        const ps = poses[gi]
        if (!ps) continue
        const lk = lean
        p.push()
        p.translate(s.x + ps.dx, TABLE.far + ps.dy + lk * 9)
        p.scale(1 + lk * 0.035, 1 + lk * 0.05 + ps.breath)
        spr(`body${gi}`, BODY.nx, 0, 0, SHOULDER_Y - 30 - TABLE.far)
        // head
        p.push()
        p.translate(ps.hdx, HEAD_Y + 87 - TABLE.far + ps.hdy + lk * 6)
        p.rotate(ps.rot + lk * 0.03 * (gi % 2 ? -1 : 1))
        p.scale(ps.sq, 1)
        spr(`hA${gi}`, HEAD.cx, HEAD.pivotY, ps.shiftA, 0)
        const lkx = ps.look * 15 + (gs[gi].lookX - ps.look) * 15
        const fy = -93 + lk * 5 + (gi === 4 ? gs[gi].lookY * 5 : 0)
        spr(ps.eyes, EYES.w / 2, EYES.h / 2, lkx, fy)
        spr(`m${ps.mouth}`, MOUTH.w / 2, MOUTH.h / 2 - 4, lkx * 0.85, -87 + 56 + lk * 4)
        spr(`hB${gi}`, HEAD.cx, HEAD.pivotY, ps.shiftB, 0)
        p.pop()
        // arm
        const a = ps.arm
        if (a) {
          const ang = (v: [number, number], w: [number, number]) => -Math.atan2(w[0] - v[0], w[1] - v[1])
          p.push(); p.translate(a.S[0], a.S[1]); p.rotate(ang(a.S, a.E)); spr(`up${gi}`, ARM.ux, ARM.uy); p.pop()
          p.push(); p.translate(a.E[0], a.E[1]); p.rotate(ang(a.E, a.H)); spr(`fore${gi}`, ARM.fx, ARM.fy); p.pop()
          if (a.hasGlass) { p.push(); p.translate(a.H[0], a.H[1]); p.rotate(a.glassTilt); spr('glass', GLASS.px, GLASS.py); p.pop() }
        }
        p.pop()
      }
      // table (region B)
      p.image(scene, crop.x, crop.y, crop.w, crop.h, 0, CH, CW, CH)

      // candles
      const lit: number[] = lay.candles.map((_c, i) => {
        const base = o.reduced ? 1 : clamp01((prog - STORY.candle[i]) / 0.025)
        return i === 0 && !o.reduced ? Math.max(base, clamp01((now - 0.5) / 0.5)) : base
      })
      lay.candles.forEach((c, i) => spr(`candle${i % 2}`, CANDLE.px, CANDLE.py, c.x, c.y))

      // dishes
      courses.forEach((_c, i) => {
        const slot = dishSlots[i]
        const t = o.reduced ? 1 : clamp01((prog - STORY.course[i]) / STORY.courseLen)
        if (t <= 0) return
        const e = ease(t)
        const y = lerp(slot.y + 250, slot.y, e) - Math.sin(Math.PI * e) * 120
        const x = lerp(slot.x + (i % 2 ? 60 : -60), slot.x, e)
        const land = t > 0.84 ? Math.sin(((t - 0.84) / 0.16) * Math.PI) : 0
        p.push()
        p.translate(x, y + DISH.h * 0.5 * 0)
        p.scale(1 + land * 0.05, 1 - land * 0.09)
        p.rotate((1 - e) * (i % 2 ? 0.18 : -0.18))
        spr(`dish${i}`, DISH.px, DISH.py)
        p.pop()
        if (t >= 1) {
          const since = o.reduced ? 0.12 : prog - STORY.course[i] - STORY.courseLen
          const sa = o.reduced ? 90 : 120 * (1 - smooth(0.06, 0.16, since))
          if (sa > 2) { setTint(255, 255, 255, sa); const v = Math.floor(now * 4 + i) % 2; spr(`steam${v}`, STEAM.w / 2, STEAM.h, slot.x - 20 + v * 22, slot.y - 40 - ((now * 22 + i * 17) % 18)); p.noTint() }
        }
      })

      // ambient multiply
      const amb = ambient(prog)
      const vg = 0.62 + 0.18 * (1 - smooth(0.9, 1, prog))
      p.blendMode(p.MULTIPLY)
      p.noStroke()
      p.beginShape(p.TRIANGLES)
      const X0 = crop.x - 4, X1 = crop.x + crop.w + 4, Y0 = crop.y - 4, Y1 = crop.y + crop.h + 4
      const mx = (X0 + X1) / 2, my = (Y0 + Y1) / 2 + 40
      const pts: [number, number][] = [[X0, Y0], [mx, Y0], [X1, Y0], [X1, my], [X1, Y1], [mx, Y1], [X0, Y1], [X0, my]]
      for (let i = 0; i < pts.length; i++) {
        const a2 = pts[i], b2 = pts[(i + 1) % pts.length]
        const edge = (q: [number, number]) => { const m = (q[0] === mx || q[1] === my) ? 0.86 : vg; p.fill(amb[0] * m, amb[1] * m, amb[2] * m) }
        edge(a2); p.vertex(a2[0], a2[1])
        edge(b2); p.vertex(b2[0], b2[1])
        p.fill(amb[0], amb[1], amb[2]); p.vertex(mx, my)
      }
      p.endShape()
      p.blendMode(p.BLEND)

      // flames (drawn after the tint so they stay bright)
      lay.candles.forEach((c, i) => {
        const l = lit[i]
        if (l <= 0.001) return
        const fl = 1 + 0.07 * Math.sin(now * 13 + i * 2) + 0.05 * Math.sin(now * 23.7 + i) + 0.03 * Math.sin(now * 41 + i * 5)
        const grow = l < 1 ? backOut(l) : 1
        const v = Math.floor(now * 9 + i * 3) % 3
        p.push()
        p.translate(c.x + Math.sin(now * 6 + i) * 1.5, c.y - 128)
        p.rotate(Math.sin(now * 5.3 + i * 1.7) * 0.05)
        p.scale(grow * (0.92 + 0.12 * fl), grow * fl)
        spr(`flame${v}`, FLAME.px, FLAME.py)
        p.pop()
      })

      // light pools (additive, stacked soft discs)
      const disc = (x: number, y: number, rx: number, ry: number, rgb: number[], a: number) => {
        const N = light ? 14 : 20
        p.noStroke()
        for (let k = 0; k < N; k++) {
          const t = k / (N - 1)
          p.fill(rgb[0], rgb[1], rgb[2], (a / N) * (0.55 + 1.1 * t))
          const f = 1 - t * 0.96
          p.ellipse(x, y, rx * 2 * f, ry * 2 * f)
        }
      }
      p.blendMode(p.ADD)
      lay.candles.forEach((c, i) => {
        const l = lit[i]
        if (l <= 0.001) return
        const fl = 1 + 0.05 * Math.sin(now * 13 + i * 2) + 0.04 * Math.sin(now * 23.7 + i)
        const dim = 1 - 0.35 * smooth(0.92, 1, prog)
        const a = 95 * ease(l) * dim * fl
        disc(c.x, c.y - 130, 300 * fl, 300 * fl, [255, 176, 92], a)
        disc(c.x, c.y + 20, 300, 70, [255, 160, 80], a * 0.7)
      })
      const lampOn = o.reduced ? 1 : smooth(0.38, 0.5, prog)
      for (const lx of lay.lamps) disc(lx, 196, 270, 250, [255, 196, 120], (35 + 70 * lampOn) * (1 - 0.3 * smooth(0.92, 1, prog)))
      p.blendMode(p.BLEND)
      p.noTint()
      p.pop()
    }
  }

  const root = host
  pInst = new P5(sketch, root)

  return {
    ready,
    destroy: () => {
      destroyed = true
      window.removeEventListener('pointermove', handlePointer)
      document.removeEventListener('pointerleave', handleLeave)
      try { atlas?.remove?.() } catch {}
      try { scene?.remove?.() } catch {}
      try { pInst?.remove() } catch {}
    },
    setActive: (on) => {
      if (on === active) return
      active = on
      if (o.reduced) return
      try { on ? pInst.loop() : pInst.noLoop() } catch {}
    },
    canvas: () => pInst?.canvas ?? null,
    reactorHead: () => ({ x: reactor.s.x, y: HEAD_Y }),
    cropSize: () => ({ w: crop.w, h: crop.h }),
    stats: () => ({ paintMs: Math.round(paintMs), sprites: items.length, atlas: `${AW}x${AH}` }),
  }
}
