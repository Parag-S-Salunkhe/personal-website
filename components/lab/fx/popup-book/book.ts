import * as THREE from 'three'
import { makeBend, paperMat, bendify, type BendU } from './bend'
import { PH, PW, type Assets, type PanelSpec } from './art'
import { mk } from './paper'

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const ss = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t) }
/** ease-out with overshoot: the paper swings past upright and settles. */
const back = (x: number) => { const c1 = 2.4, c3 = c1 + 1, t = x - 1; return 1 + c3 * t * t * t + c1 * t * t }

export const STARTS = [0.04, 0.275, 0.51, 0.745]
export type BookState = { turn: number[]; r: number[]; bookX: number; dragging: boolean }

/** Scroll progress 0..1 to: how far each of the five leaves has turned, and how risen each of the four pop-ups is. */
export function timeline(p: number): { turn: number[]; r: number[] } {
  const turn = [0, 0, 0, 0, 0], r = [0, 0, 0, 0]
  for (let k = 0; k < 4; k++) {
    turn[k] = ss(STARTS[k], STARTS[k] + 0.085, p)
    r[k] = ss(STARTS[k] + 0.07, STARTS[k] + 0.15, p) * (k < 3 ? 1 - ss(STARTS[k + 1] - 0.03, STARTS[k + 1], p) : 1)
  }
  return { turn, r }
}

export function flameTex() {
  const c = mk(64, 64), g = c.getContext('2d')!
  const k = g.createRadialGradient(32, 38, 2, 32, 34, 30)
  k.addColorStop(0, 'rgba(255,248,234,1)'); k.addColorStop(0.25, 'rgba(255,200,100,.9)'); k.addColorStop(0.6, 'rgba(246,150,50,.28)'); k.addColorStop(1, 'rgba(246,150,50,0)')
  g.fillStyle = k; g.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

type Hinge = { g: THREE.Group; spec: PanelSpec; j: number; m: THREE.Mesh }

export function createBook(a: Assets, light: boolean) {
  const root = new THREE.Group()
  const bends: BendU[] = []
  const leaves: THREE.Group[] = []
  const pops: Hinge[][] = [[], [], [], []]
  const geos: THREE.BufferGeometry[] = []
  const keep: THREE.Texture[] = []

  for (let i = 0; i < 5; i++) {
    const U = makeBend(); bends.push(U)
    const g = new THREE.Group(); leaves.push(g); root.add(g)
    const cover = i === 0
    const w = cover ? PW + 0.08 : PW, h = cover ? PH + 0.08 : PH, x0 = cover ? -0.02 : 0, ht = cover ? 0.018 : 0
    const geo = new THREE.PlaneGeometry(w, h, 36, 1); geo.rotateX(-Math.PI / 2); geo.translate(x0 + w / 2, 0, 0); geos.push(geo)
    const f = paperMat(U, { map: a.front[i] })
    const fm = new THREE.Mesh(geo, f.mat); fm.position.y = ht + 0.0005; fm.castShadow = true; fm.receiveShadow = true; fm.customDepthMaterial = f.depth; g.add(fm)
    const bt = a.back[i].clone(); bt.wrapS = THREE.RepeatWrapping; bt.repeat.x = -1; bt.offset.x = 1; bt.needsUpdate = true; keep.push(bt)
    const b = paperMat(U, { map: bt, side: THREE.BackSide })
    const bm = new THREE.Mesh(geo, b.mat); bm.position.y = -ht - 0.0005; bm.receiveShadow = true; g.add(bm)
    if (cover) {
      const bg = new THREE.BoxGeometry(w, ht * 2, h, 36, 1, 1); bg.translate(x0 + w / 2, 0, 0); geos.push(bg)
      const m = paperMat(U, { color: '#4f1424' })
      const board = new THREE.Mesh(bg, m.mat); board.castShadow = true; board.receiveShadow = true; board.customDepthMaterial = m.depth; g.add(board)
    }
    if (i >= 1) {
      a.spreads[i - 1].forEach((spec, j) => {
        const hg = new THREE.Group(); hg.position.set(spec.x, 0.004 + j * 0.0035, spec.z); g.add(hg)
        const pg = new THREE.PlaneGeometry(spec.w, spec.h); pg.translate(0, spec.h / 2, 0); geos.push(pg)
        const pm = paperMat(U, { map: spec.tex, glow: spec.glow ?? null, side: THREE.DoubleSide, cut: true })
        const mesh = new THREE.Mesh(pg, pm.mat); mesh.castShadow = true; mesh.receiveShadow = true; mesh.customDepthMaterial = pm.depth
        hg.add(mesh); pops[i - 1].push({ g: hg, spec, j, m: mesh })
      })
    }
    g.traverse((o) => { o.frustumCulled = false })
  }

  // cover pocket and the pull-tab card that slides out of it
  let slider: THREE.Mesh
  {
    const U = bends[0], top = 0.018
    const pg = new THREE.PlaneGeometry(2.0, 0.74); pg.rotateX(-Math.PI / 2); geos.push(pg)
    const pm = paperMat(U, { map: a.pocket, cut: true })
    const pocket = new THREE.Mesh(pg, pm.mat); pocket.position.set(1.65, top + 0.026, 0.7); pocket.castShadow = true; pocket.receiveShadow = true; pocket.customDepthMaterial = pm.depth; leaves[0].add(pocket)
    const sg = new THREE.PlaneGeometry(2.8, 0.7); sg.rotateX(-Math.PI / 2); geos.push(sg)
    const sm = paperMat(U, { map: a.slider, cut: true })
    slider = new THREE.Mesh(sg, sm.mat); slider.position.set(2.0, top + 0.012, 0.7); slider.castShadow = true; slider.receiveShadow = true; slider.customDepthMaterial = sm.depth
    slider.userData.slider = true; leaves[0].add(slider)
    pocket.frustumCulled = false; slider.frustumCulled = false
  }

  // spine and back board
  const spineMat = new THREE.MeshStandardMaterial({ color: '#5a1a2a', roughness: 0.85 })
  const spineG = new THREE.CylinderGeometry(0.1, 0.1, PH + 0.08, 14); spineG.rotateX(Math.PI / 2); geos.push(spineG)
  const spine = new THREE.Mesh(spineG, spineMat); spine.position.set(0, 0.07, 0); spine.castShadow = true; root.add(spine)
  const bbG = new THREE.BoxGeometry(PW + 0.08, 0.05, PH + 0.08); bbG.translate(PW / 2 + 0.02, 0, 0); geos.push(bbG)
  const bb = new THREE.Mesh(bbG, new THREE.MeshStandardMaterial({ color: '#4f1424', roughness: 0.85 })); bb.position.y = -0.0; bb.receiveShadow = true; bb.castShadow = true; root.add(bb)

  // dining spread: three real candles that rise with the table
  const flame = flameTex(); keep.push(flame)
  const candleG = new THREE.CylinderGeometry(0.032, 0.036, 0.3, 12); candleG.translate(0, 0.15, 0); geos.push(candleG)
  const candleM = new THREE.MeshStandardMaterial({ color: '#FFF8EA', roughness: 0.6 })
  const cGroup: THREE.Group[] = [], flames: THREE.Sprite[] = []
  const tableHinge = pops[1].find((p) => p.spec.key === 't-table')!
  ;[1.12, 1.5, 1.88].forEach((x, i) => {
    const cg = new THREE.Group(); cg.position.x = x; leaves[2].add(cg); cGroup.push(cg)
    const cm = new THREE.Mesh(candleG, candleM); cm.castShadow = true; cg.add(cm)
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: flame, color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }))
    sp.position.y = 0.36; sp.scale.set(0.3, 0.3, 1); cg.add(sp); flames.push(sp)
    void i
  })
  const candleLight = new THREE.PointLight('#ffb55a', 0, 5, 1.6); candleLight.position.set(1.5, 1.35, 0.1); if (!light) leaves[2].add(candleLight)

  const state: BookState = { turn: [0, 0, 0, 0, 0], r: [0, 0, 0, 0], bookX: -1.5, dragging: false }
  let drag = 0

  function update(p: number, t: number, pull: number, still: boolean) {
    const tl = still ? { turn: [1, 1, 0, 0, 0], r: [0, 1, 0, 0] } : timeline(p)
    state.turn = tl.turn; state.r = tl.r
    state.bookX = -1.5 * (1 - tl.turn[0]); root.position.x = state.bookX
    for (let i = 0; i < 5; i++) {
      const u = tl.turn[i], th = Math.PI * u
      const y = THREE.MathUtils.lerp(0.025 * (4 - i) + 0.03, 0.025 * (i + 1) + 0.03, u) + Math.sin(Math.PI * u) * 0.07
      leaves[i].position.y = y
      const U = bends[i]
      U.uTheta.value = th; U.uK.value = -0.34 * Math.sin(th) * (i === 0 ? 0.8 : 1)
      U.uBase.value.set(state.bookX, y, 0)
    }
    for (let k = 0; k < 4; k++) {
      const r = tl.r[k]
      for (const { g, spec, m } of pops[k]) {
        const rr = clamp((r - spec.d) / (1 - spec.d))
        const o = still ? (tl.r[k] > 0 ? 1 : 0) : back(rr)
        g.rotation.x = (Math.PI / 2) * (1 - o)
        m.rotation.y = (spec.yaw ?? 0) * clamp(o, 0, 1)
        g.visible = r > 0.001 || still || state.turn[k + 1] < 0.999
      }
    }
    // candles ride the table panel up
    {
      const r = tl.r[1], d = tableHinge.spec.d, o = still ? 1 : back(clamp((r - d) / (1 - d)))
      const grow = clamp(o, 0, 1.05), ang = (Math.PI / 2) * o
      cGroup.forEach((cg, i) => {
        cg.visible = r > 0.02 && state.turn[2] < 0.01
        cg.position.y = 0.004 + tableHinge.j * 0.0035 + 0.77 * Math.sin(ang) * 0.98
        cg.position.z = tableHinge.spec.z + 0.77 * Math.cos(ang) + 0.2
        cg.scale.set(1, Math.max(0.001, grow), 1)
        const fl = 1 + Math.sin(t * 9 + i * 2.1) * 0.08 + Math.sin(t * 23 + i) * 0.05
        flames[i].scale.set(0.3 * fl, 0.34 * fl, 1); flames[i].position.y = 0.34 + (fl - 1) * 0.04
      })
      candleLight.intensity = (r > 0.02 ? 5.5 : 0) * clamp(o) * (1 + Math.sin(t * 8) * 0.06)
      candleLight.position.y = 0.77 * Math.sin(ang) + 0.62
    }
    drag = pull
    slider.position.x = 2.0 + 1.3 * drag
  }

  function dispose() {
    geos.forEach((g) => g.dispose())
    keep.forEach((k) => k.dispose())
    root.traverse((o) => {
      const m = o as THREE.Mesh
      const mat = m.material as THREE.Material | THREE.Material[] | undefined
      ;(Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose())
      if (m.customDepthMaterial) m.customDepthMaterial.dispose()
    })
    a.textures.forEach((t) => t.dispose())
  }
  return { root, slider, state, update, dispose, leaves }
}
export type Book = ReturnType<typeof createBook>
void bendify
