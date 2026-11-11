// Ported from components/lab/fx/popup-book/book.ts: one spread per dish, no pull-tab, no table candles.
import * as THREE from 'three'
import { makeBend, paperMat, type BendU } from './bend'
import { PH, PW, type Assets, type PanelSpec } from './art'
import { mk } from './paper'

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const ss = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t) }
/** ease-out with overshoot: the paper swings past upright and settles. */
const back = (x: number) => { const c1 = 2.4, c3 = c1 + 1, t = x - 1; return 1 + c3 * t * t * t + c1 * t * t }

/** n = number of dish spreads (1 to 3). turn[k] = leaf k turned, r[k] = pop-ups of spread k risen. */
export type BookState = { turn: number[]; r: number[]; bookX: number }

export function timeline(p: number, n: number): { turn: number[]; r: number[] } {
  const step = 0.9 / n
  const turn: number[] = [], r: number[] = []
  for (let k = 0; k < n; k++) {
    const s = 0.04 + k * step
    turn.push(ss(s, s + 0.085, p))
    r.push(ss(s + 0.07, s + 0.15, p) * (k < n - 1 ? 1 - ss(s + step - 0.03, s + step, p) : 1))
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

type Hinge = { g: THREE.Group; spec: PanelSpec; m: THREE.Mesh }

export function createBook(a: Assets) {
  const n = a.spreads.length
  const root = new THREE.Group()
  const bends: BendU[] = []
  const leaves: THREE.Group[] = []
  const pops: Hinge[][] = Array.from({ length: n }, () => [])
  const geos: THREE.BufferGeometry[] = []
  const keep: THREE.Texture[] = []
  const nl = n + 1

  for (let i = 0; i < nl; i++) {
    const U = makeBend(); bends.push(U)
    const g = new THREE.Group(); leaves.push(g); root.add(g)
    const cover = i === 0
    const w = cover ? PW + 0.08 : PW, h = cover ? PH + 0.08 : PH, x0 = cover ? -0.02 : 0, ht = cover ? 0.018 : 0
    const geo = new THREE.PlaneGeometry(w, h, 36, 1); geo.rotateX(-Math.PI / 2); geo.translate(x0 + w / 2, 0, 0); geos.push(geo)
    const f = paperMat(U, { map: a.front[i] })
    const fm = new THREE.Mesh(geo, f.mat); fm.position.y = ht + 0.0005; fm.castShadow = true; fm.receiveShadow = true; fm.customDepthMaterial = f.depth; g.add(fm)
    if (a.back[i]) {
      const bt = a.back[i].clone(); bt.wrapS = THREE.RepeatWrapping; bt.repeat.x = -1; bt.offset.x = 1; bt.needsUpdate = true; keep.push(bt)
      const b = paperMat(U, { map: bt, side: THREE.BackSide })
      const bm = new THREE.Mesh(geo, b.mat); bm.position.y = -ht - 0.0005; bm.receiveShadow = true; g.add(bm)
    }
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
        hg.add(mesh); pops[i - 1].push({ g: hg, spec, m: mesh })
      })
    }
    g.traverse((o) => { o.frustumCulled = false })
  }

  const spineMat = new THREE.MeshStandardMaterial({ color: '#5a1a2a', roughness: 0.85 })
  const spineG = new THREE.CylinderGeometry(0.1, 0.1, PH + 0.08, 14); spineG.rotateX(Math.PI / 2); geos.push(spineG)
  const spine = new THREE.Mesh(spineG, spineMat); spine.position.set(0, 0.07, 0); spine.castShadow = true; root.add(spine)
  const bbG = new THREE.BoxGeometry(PW + 0.08, 0.05, PH + 0.08); bbG.translate(PW / 2 + 0.02, 0, 0); geos.push(bbG)
  const bbM = new THREE.MeshStandardMaterial({ color: '#4f1424', roughness: 0.85 })
  const bb = new THREE.Mesh(bbG, bbM); bb.receiveShadow = true; bb.castShadow = true; root.add(bb)

  const state: BookState = { turn: new Array(nl).fill(0), r: new Array(n).fill(0), bookX: -1.5 }

  /** still = the composed reduced-motion state: open on the first dish, pop-ups standing. */
  function update(p: number, still: boolean) {
    const tl = still ? { turn: [1, ...new Array(n - 1).fill(0)], r: [1, ...new Array(n - 1).fill(0)] } : timeline(p, n)
    state.turn = [...tl.turn, 0]; state.r = tl.r
    state.bookX = -1.5 * (1 - tl.turn[0]); root.position.x = state.bookX
    for (let i = 0; i < nl; i++) {
      const u = state.turn[i], th = Math.PI * u
      const y = THREE.MathUtils.lerp(0.025 * (nl - 1 - i) + 0.03, 0.025 * (i + 1) + 0.03, u) + Math.sin(Math.PI * u) * 0.07
      leaves[i].position.y = y
      const U = bends[i]
      U.uTheta.value = th; U.uK.value = -0.34 * Math.sin(th) * (i === 0 ? 0.8 : 1)
      U.uBase.value.set(state.bookX, y, 0)
    }
    for (let k = 0; k < n; k++) {
      const r = tl.r[k]
      for (const { g, spec, m } of pops[k]) {
        const rr = clamp((r - spec.d) / (1 - spec.d))
        const o = still ? (r > 0 ? 1 : 0) : back(rr)
        g.rotation.x = (Math.PI / 2) * (1 - o)
        m.rotation.y = (spec.yaw ?? 0) * clamp(o, 0, 1)
        g.visible = r > 0.001 || still || state.turn[k + 1] < 0.999
      }
    }
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
  return { root, state, update, dispose, leaves }
}
export type Book = ReturnType<typeof createBook>
